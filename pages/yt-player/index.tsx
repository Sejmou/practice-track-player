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
import SongList from 'features/SongList/SongList';
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
  useYouTubePlayer,
  YouTubePlayer,
} from '@frontend/media-playback/use-youtube-player';
import ClassicPlayerUI from '@frontend/media-playback/ui/ClassicPlayerUI';
import PBRPlayerUI from '@frontend/media-playback/ui/PBRPlayerUI';
import { useYouTubeStore } from '@frontend/media-playback/store';
import PBRAndLoopPlayerUI from '@frontend/media-playback/ui/PBRAndLoopPlayerUI';

const containerStyles: SxProps = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

type YouTubeLinkData = {
  videoId?: string;
  playlistId?: string;
  playlistIndex?: number;
};

const YouTubePlayerPage: NextPage = () => {
  const [linkInputTouched, setLinkInputTouched] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>();
  const [youTubePlayer, setYouTubePlayer] = useState<YouTubePlayer>();

  useYouTubePlayer(youTubePlayer);

  const { initialize, mediaElements, currIdx, switchTo, initialized, reset } =
    useYouTubeStore();

  const [songListData, setSongListData] = useState<Song[]>([]);
  useEffect(() => {
    setSongListData(
      mediaElements.map(el => {
        if ('videoOwnerChannelTitle' in el) {
          return {
            title: el.title,
            artist: el.videoOwnerChannelTitle,
          };
        } else
          return {
            title: el.title,
            artist: el.channelTitle,
          };
      })
    );
  }, [mediaElements]);

  const [youTubePlayerOpts, setYouTubePlayerOpts] = useState<
    YouTubeProps['opts']
  >({ controls: false, playerVars: { controls: 0, autoplay: 0 } });

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

  const handleLinkInputChange = useCallback(
    async (
      ev: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>
    ) => {
      const input = ev.target.value;
      const { videoId, playlistId, playlistIndex } = getYouTubeLinkData(input);
      const inputInvalid = !videoId && !playlistId;
      setVideoLinkError(inputInvalid);

      // too lazy to write useSWR hook for that, should be fine anyway
      if (playlistId) {
        const playlistData = await fetch(
          `/api/yt/playlist-video-metadata/${playlistId}`
        )
          .then(res => res.json())
          .then(json => YouTubePlaylistDataValidator.parse(json));
        initialize(playlistData, playlistIndex ?? 0);
        // setLocalMediaElements(playlistData);
      } else if (videoId) {
        const videoData = await fetch(`/api/yt/video-metadata/${videoId}`)
          .then(res => res.json())
          .then(json => YouTubeVideoDataValidator.parse(json));
        initialize([videoData], 0);
      }
    },
    []
  );

  const handleLinkBlur = () => {
    setLinkInputTouched(true);
  };

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
            error: videoLinkError && linkInputTouched,
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
        {!initialized ? (
          linkInput
        ) : (
          <Stack spacing={2}>
            <Box ref={playerContainerRef}>
              <YouTube
                onReady={onPlayerReady}
                videoId={mediaElements[currIdx].videoId}
                opts={youTubePlayerOpts}
              />
            </Box>
            {/* {youTubePlayer && <ClassicPlayerUI />} */}
            {/* {youTubePlayer && <PBRPlayerUI />} */}
            {youTubePlayer && <PBRAndLoopPlayerUI />}
            {mediaElements.length > 1 && (
              <SongList
                title="Videos"
                songs={songListData}
                currentSong={songListData[currIdx]}
                handleSongChange={song => {
                  switchTo(songListData.findIndex(s => s.title === song.title));
                }}
              />
            )}
            <Stack direction="column">
              <Button onClick={() => reset()}>
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

function getYouTubeLinkData(input: string): YouTubeLinkData {
  let videoId;
  try {
    // make use of function used by ytdl-core
    videoId = getURLVideoID(input);
  } catch (error) {
    // continue in any case to also check if there is a playlist ID
  }
  const playlistId = getYouTubeQueryParam(input, 'list');
  const playlistIndex = Number(getYouTubeQueryParam(input, 'index'));
  return {
    videoId,
    playlistId,
    playlistIndex: isNaN(playlistIndex) ? undefined : playlistIndex - 1, // playlistIndex on YouTube is not zero-based
  };
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
