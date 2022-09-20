import Head from 'next/head';
import { NextPage } from 'next/types';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import { signIn, signOut, useSession, getCsrfToken } from 'next-auth/react';
import {
  ChangeEvent,
  FocusEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getURLVideoID } from 'ytdl-core';
import {
  Button,
  InputAdornment,
  Paper,
  Stack,
  SxProps,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/material';
import SongList from 'features/SongList/SongList';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import useSWRImmutable from 'swr/immutable';
import { jsonFetcher } from '@frontend/util/data-fetchers';
import {
  Song,
  YouTubePlaylistDataValidator,
  YouTubePlaylistVideoData,
  YouTubeVideoData,
  YouTubeVideoDataValidator,
} from '@models';
import {
  useYouTubePlayer,
  YouTubePlayer,
} from '@frontend/media-playback/use-youtube-player';
import ClassicPlayerUI from '@frontend/media-playback/ui/ClassicPlayerUI';
import PBRPlayerUI from '@frontend/media-playback/ui/PBRPlayerUI';
import { usePlaybackStore } from '@frontend/media-playback/store';
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
  const session = useSession();
  const googleApiToken = session?.data?.accessToken;

  const { data: playlists } = useSWRImmutable(
    googleApiToken ? '/api/yt/user/playlists' : null,
    jsonFetcher
  );

  console.log('user playlists', playlists);

  // wanted to fetch YouTube data on client-side, doesn't work because of CORS lol
  // const csrfToken = getCsrfToken();
  // const { data } = useSWR(
  //   googleApiToken
  //     ? [
  //         'https://www.googleapis.com/youtube/v3/playlists',
  //         { headers: { Bearer: googleApiToken } },
  //       ]
  //     : null,
  //   jsonFetcher
  // );
  // console.log(data);

  const [linkInputTouched, setLinkInputTouched] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>();
  const [youTubePlayer, setYouTubePlayer] = useState<YouTubePlayer>();

  useYouTubePlayer(youTubePlayer);

  const {
    initialize,
    mediaElements: mediaElementsAny,
    currIdx,
    switchTo,
    initialized,
    reset,
  } = usePlaybackStore();

  const mediaElements = mediaElementsAny as (
    | YouTubeVideoData
    | YouTubePlaylistVideoData
  )[];

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

  console.log(session);

  const linkInput = (
    <>
      <Typography variant="h3">YouTube Player</Typography>
      <Paper sx={{ p: 1, mt: 1 }}>
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="subtitle1" maxWidth="650px">
            Play any YouTube video or playlist, with more controls than
            YouTube&apos;s own player offers.
          </Typography>
          {!session || session.status !== 'authenticated' ? (
            <>
              <Typography variant="subtitle1" maxWidth="650px">
                Want to play videos stored in your YouTube account?
              </Typography>
              <Button onClick={() => signIn('google')}>Login</Button>
            </>
          ) : (
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography>
                You are currently logged in with your Google Account (
                {session.data.user?.name}).
              </Typography>
              <Button onClick={() => signOut()}>Logout</Button>
            </Stack>
          )}
          <Typography variant="subtitle1" maxWidth="650px">
            Wanna play a video/playlist? Just paste the link below:
          </Typography>
          <TextField
            label="Video/Playlist link"
            helperText={
              videoLinkError
                ? 'Please provide a valid YouTube playlist/video URL'
                : ''
            }
            id="outlined-start-adornment"
            sx={{ m: 1, width: '100%', maxWidth: 650 }}
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
        </Stack>
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
            <Stack alignItems="center">
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
