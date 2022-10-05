import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next/types';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';

import { Button, Grid, Stack, SxProps, Typography } from '@mui/material';
import { Box } from '@mui/material';
import SongList from '@frontend/media-playback/ui/SongList';

import { Song, YouTubePlaylistVideoData, YouTubeVideoData } from '@models';
import {
  useYouTubePlayer,
  YouTubePlayer,
} from '@frontend/media-playback/use-youtube-player';
import ClassicPlayerUI from '@frontend/media-playback/ui/ClassicPlayerUI';
import PBRPlayerUI from '@frontend/media-playback/ui/PBRPlayerUI';
import { usePlaybackStore } from '@frontend/media-playback/store';
import PBRAndLoopPlayerUI from '@frontend/media-playback/ui/PBRAndLoopPlayerUI';
import UserPlaylists from '../../frontend/yt-player/UserPlaylists';
import YouTubeLinkInput from '../../frontend/yt-player/YouTubeLinkInput';
import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import Timestamps from '@frontend/media-playback/ui/controls/using-store/Timestamps';

import { getToken } from 'next-auth/jwt';
import { fetchPlaylistVideoMetaData } from '@pages/api/yt/playlist-video-metadata/[playlistId]';
import { fetchVideoMetaData } from '@pages/api/yt/video-metadata/[videoId]';

export type YouTubeVideoItemsData = {
  videos: YouTubeVideoData[];
  initialIndex: number;
  /**
   * undefined if the videos aren't from an actual YouTube playlist (I know, this is pretty confusing, I should have designed that whole thing differently lol)
   */
  playlistId?: string;
  /**
   * !== undefined if video is actually just an array with a single video (I know, this is stupid, should rewrite some day lol)
   */
  videoId?: string;
};

const containerStyles: SxProps = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

/**
 * Those props are passed from server based on query params in URL (see getServerSideProps)
 */
type Props = {
  initialMediaElements: (YouTubeVideoData | YouTubePlaylistVideoData)[] | null;
  initialIndex: number | null;
};

const YouTubePlayerPage: NextPage<Props> = ({
  initialMediaElements,
  initialIndex,
}) => {
  const initialize = usePlaybackStore(store => store.initialize);
  const mediaElementsAny = usePlaybackStore(store => store.mediaElements); // TODO: cleanup this mess
  const currIdx = usePlaybackStore(store => store.currIdx);
  const switchTo = usePlaybackStore(store => store.switchTo);
  const playerInitialized = usePlaybackStore(store => store.initialized);
  const reset = usePlaybackStore(store => store.reset);

  useEffect(() => {
    if (initialMediaElements)
      initialize(initialMediaElements, initialIndex ?? 0);
  }, [initialMediaElements]);

  const playerContainerRef = useRef<HTMLDivElement>();
  const [youTubePlayer, setYouTubePlayer] = useState<YouTubePlayer>();

  useYouTubePlayer(youTubePlayer);

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

  const router = useRouter();

  const handleVideosChange = useCallback(
    (playlistData: YouTubeVideoItemsData) => {
      initialize(playlistData.videos, playlistData.initialIndex);
      // TODO: maybe change this some day
      // this is freakin' ugly, couldn't find a cleaner way to only add query params if they are actually needed
      const query = {
        p: playlistData.playlistId,
        i: playlistData.initialIndex,
        v: playlistData.videoId,
      };
      if (!query.v) delete query.v;
      if (!query.p) delete query.p;
      router.push({
        pathname: router.pathname,
        query,
      });
    },
    [initialize]
  );

  const handleReset = useCallback(() => {
    reset();
    router.push({
      pathname: router.pathname,
      query: {},
    });
  }, [reset]);

  const pickPlayerVideoContent = (
    <>
      <Typography variant="h3">YouTube Player</Typography>
      <Typography variant="subtitle1" maxWidth="650px">
        Play any YouTube video or playlist, with more controls than
        YouTube&apos;s own player offers.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridAutoColumns: 'minmax(0,1fr)',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { md: 2 },
        }}
      >
        <ResponsiveContainer
          title="YouTube link"
          contentWrapperSxWide={{ px: 2, py: 2 }}
        >
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Got a video/playlist link? Just paste it below:
            </Typography>
            <YouTubeLinkInput onLinkDataChange={handleVideosChange} />
          </>
        </ResponsiveContainer>
        <UserPlaylists onUserPlaylistPicked={handleVideosChange} />
      </Box>
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
        {!playerInitialized ? (
          pickPlayerVideoContent
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
            <Timestamps />
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
              <Button onClick={handleReset}>
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

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  const { p: playlistIdVal, v: videoIdVal, i: indexVal } = query;
  const initialIndex =
    typeof indexVal === 'string' && !isNaN(parseInt(indexVal))
      ? parseInt(indexVal)
      : undefined;
  let initialMediaElements:
    | (YouTubeVideoData | YouTubePlaylistVideoData)[]
    | null = null;

  if (!!playlistIdVal && typeof playlistIdVal === 'string') {
    const token = await getToken({ req });
    const googleApiToken = token?.accessToken;
    const playlistData = await fetchPlaylistVideoMetaData(
      playlistIdVal,
      undefined,
      googleApiToken
    );
    initialMediaElements = playlistData;
  } else if (!!videoIdVal && typeof videoIdVal === 'string') {
    const videoData = await fetchVideoMetaData(videoIdVal);
    initialMediaElements = [videoData];
  }

  return {
    props: {
      initialMediaElements,
      initialIndex: 0,
    },
  };
};
