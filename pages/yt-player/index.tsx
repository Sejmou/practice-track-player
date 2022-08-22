import Head from 'next/head';
import { NextPage } from 'next/types';
import {
  ChangeEvent,
  FocusEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Button,
  InputAdornment,
  Link,
  Paper,
  Stack,
  SxProps,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/material';
import SongList from '@components/SongList/SongList';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { getURLVideoID } from 'ytdl-core';
import {
  Song,
  YouTubePlaylistDataValidator,
  YouTubeVideoData,
  YouTubeVideoDataValidator,
} from '@models';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import {
  useYouTubePlayerControls,
  YouTubePlayer,
} from '@frontend/hooks/media-playback/use-youtube-player-controls';

type Props = {};

const containerStyles: SxProps = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

type YouTubeLinkData = {
  videoId?: string;
  playlistId?: string;
  playlistIndex?: string;
};

const YouTubePlayerPage: NextPage = (props: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const [linkInputTourched, setLinkInputTouched] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState(false);

  const [videoData, setVideoData] = useState<YouTubeVideoData[]>([]);
  const [songListData, setSongListData] = useState<Song[]>([]);
  const [currVideoIdx, setCurrVideoIdx] = useState(0);

  const playerContainerRef = useRef<HTMLDivElement>();
  const [youTubePlayer, setYouTubePlayer] = useState<YouTubePlayer>();

  const [youTubePlayerOpts, setYouTubePlayerOpts] = useState<
    YouTubeProps['opts']
  >({ controls: false, playerVars: { controls: 0 } });

  const resizePlayer = useCallback(() => {
    if (playerContainerRef.current) {
      const width = playerContainerRef.current.offsetWidth;
      const height = (width * 9) / 16; // assuming 16:9 aspect ratio
      setYouTubePlayerOpts({
        ...youTubePlayerOpts,
        width,
        height,
      });
    }
  }, [youTubePlayerOpts]);

  const onPlayerReady = useCallback(
    (ev: YouTubeEvent) => {
      setYouTubePlayer(ev.target);
      resizePlayer();
    },
    [resizePlayer]
  );

  useLayoutEffect(() => {
    window.addEventListener('resize', resizePlayer);
    return () => window.removeEventListener('resize', resizePlayer);
  }, [resizePlayer]);

  const handlePlay = async () => {
    if (youTubePlayer) {
      youTubePlayer.playVideo();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'playing';
    }
  };

  const handlePause = () => {
    if (youTubePlayer) {
      youTubePlayer.pauseVideo();
      if (navigator?.mediaSession?.playbackState)
        navigator.mediaSession.playbackState = 'paused';
    }
  };

  const handlePlayPauseToggle = () => {
    if (youTubePlayer) {
      if (youTubePlayer.getPlayerState() == 1) handlePause();
      else handlePlay();
    }
  };

  const handleNext = useCallback(() => {
    setCurrVideoIdx(prev => Math.min(prev + 1, videoData.length - 1));
  }, [videoData]);

  const handlePrevious = useCallback(() => {
    setCurrVideoIdx(prev => Math.max(prev - 1, 0));
  }, []);

  useYouTubePlayerControls({
    player: youTubePlayer,
    onNext: handleNext,
    onPrevious: handlePrevious,
  });

  const handleLinkInputChange = useCallback(
    async (
      ev: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>
    ) => {
      if (!audioContext) return; // should never be the case in practice
      const input = ev.target.value;
      const { videoId, playlistId, playlistIndex } = getYouTubeVideoData(input);
      const inputInvalid = !videoId && !playlistId;
      setVideoLinkError(inputInvalid);

      // too lazy to write useSWR hook for that, should be fine anyway
      if (playlistId) {
        const playlistData = await fetch(
          `/api/yt/playlist-video-metadata/${playlistId}`
        )
          .then(res => res.json())
          .then(json => YouTubePlaylistDataValidator.parse(json));
        setVideoData(playlistData);
        setSongListData(
          playlistData.map(v => ({ title: v.title, artist: v.channelTitle }))
        );
      } else if (videoId) {
        const videoData = await fetch(`/api/yt/video-metadata/${videoId}`)
          .then(res => res.json())
          .then(json => YouTubeVideoDataValidator.parse(json));
        setVideoData([videoData]);
        setSongListData([
          { title: videoData.title, artist: videoData.channelTitle },
        ]);
      }
    },
    [audioContext]
  );

  const handleLinkBlur = () => {
    setLinkInputTouched(true);
  };

  const playerDataReady = videoData.length > 0;

  const linkInput = (
    <>
      <Typography variant="h3">YouTube Player</Typography>
      <Paper sx={{ p: 1, mt: 1 }}>
        <Typography variant="subtitle1" my={1} maxWidth="650px">
          Play any YouTube video or playlist, with more controls than
          YouTube&apos;s own player offers.
        </Typography>
        <Typography variant="subtitle1" mb={1} maxWidth="650px">
          Note: Initially, my goal was to allow you to play the audio of YouTube
          videos using the same player interface as on the other subsites.
        </Typography>
        <Typography variant="subtitle1" mb={1} maxWidth={600}>
          However, that&apos;s unfortunately very difficult to do without quite
          extreme hacks. Furthermore, separating audio and video channels for a
          YouTube video would also violate YouTube&apos;s{' '}
          <Link
            href="https://developers.google.com/youtube/terms/developer-policies?hl=en#i.-additional-prohibitions:~:text=separate%2C%20isolate%2C%20or%20modify%20the%20audio%20or%20video%20components%20of%20any%20YouTube%20audiovisual%20content%20made%20available%20as%20part%20of%2C%20or%20in%20connection%20with%2C%20YouTube%20API%20Services.%20For%20example%2C%20you%20must%20not%20apply%20alternate%20audio%20tracks%20to%20videos%3B"
            target="_blank"
          >
            Terms of Use
          </Link>
          .
        </Typography>
        <TextField
          label="Paste a YouTube video/playlist link here!"
          helperText={
            videoLinkError
              ? 'Please provide a valid YouTube playlist/video URL'
              : ''
          }
          id="outlined-start-adornment"
          sx={{ m: 1, width: '98.5%' }} // for some reason, width: 100% causes input to grow outside of Paper container!?
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InsertLinkIcon />
              </InputAdornment>
            ),
            error: videoLinkError && linkInputTourched,
            spellCheck: false,
          }}
          onChange={handleLinkInputChange}
          onBlur={handleLinkBlur}
        />
      </Paper>
    </>
  );

  return (
    <>
      <Head>
        <title>YouTube Player</title>
        <meta
          name="description"
          content="Play audio from a YouTube video or playist, directly in your browser!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={containerStyles}>
        {!playerDataReady ? (
          linkInput
        ) : (
          <Stack spacing={2}>
            {/* <AudioPlayer
              mainTitle={videoData[currVideoIdx].title}
              subTitle={`uploaded by ${videoData[currVideoIdx].channelTitle}`}
              audioElSrcData={audioSrcData}
              audioContext={audioContext}
              nextDisabled={currVideoIdx === videoData.length - 1}
              onNext={nextHandler}
              onPrevious={previousHandler}
            /> */}
            <Box ref={playerContainerRef}>
              <YouTube
                onReady={onPlayerReady}
                videoId={videoData[currVideoIdx]?.videoId}
                opts={youTubePlayerOpts}
              />
            </Box>
            {videoData.length > 1 && (
              <SongList
                title="Videos"
                songs={songListData}
                currentSong={songListData[currVideoIdx]}
                handleSongChange={song => {
                  setCurrVideoIdx(
                    songListData.findIndex(s => s.title === song.title)
                  );
                }}
              />
            )}
            <Stack direction="column">
              <Button onClick={() => setVideoData([])}>
                Pick other video or playlist
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </>
  );
};
export default YouTubePlayerPage;

function getYouTubeVideoData(input: string): YouTubeLinkData {
  let videoId;
  try {
    // make use of function used by ytdl-core
    videoId = getURLVideoID(input);
  } catch (error) {
    // continue in any case to also check if there is a playlist ID
  }
  const playlistId = getYouTubeQueryParam(input, 'list');
  const playlistIndex = getYouTubeQueryParam(input, 'index');
  return { videoId, playlistId, playlistIndex };
}

//recycling code from ytdl-core
const validQueryDomains = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'gaming.youtube.com',
]);

/**
 * Extracts YouTube link query parameters other than video ID
 *
 * returns undefined if not a valid YouTube URL or param not found
 */
function getYouTubeQueryParam(link: string, paramName: string) {
  try {
    const parsed = new URL(link.trim());
    let paramValue = parsed.searchParams.get(paramName);
    if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
      return;
    }
    if (!paramValue) {
      return;
    }
    return paramValue;
  } catch (error) {
    return;
  }
}
