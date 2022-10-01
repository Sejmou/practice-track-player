import Head from 'next/head';
import { NextPage } from 'next/types';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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

export type PlaylistVideoItemsData = {
  videos: YouTubeVideoData[];
  initialIndex: number;
};

const containerStyles: SxProps = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

const YouTubePlayerPage: NextPage = () => {
  const playerContainerRef = useRef<HTMLDivElement>();
  const [youTubePlayer, setYouTubePlayer] = useState<YouTubePlayer>();

  useYouTubePlayer(youTubePlayer);

  const {
    initialize,
    mediaElements: mediaElementsAny,
    currIdx,
    switchTo,
    initialized: playerInitialized,
    reset,
  } = usePlaybackStore();

  const mediaElements = mediaElementsAny as (
    | YouTubeVideoData
    | YouTubePlaylistVideoData
  )[];

  console.log(mediaElements);

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

  const handlePickedUserPlaylist = useCallback(
    (playlistData: PlaylistVideoItemsData) => {
      initialize(playlistData.videos, playlistData.initialIndex);
    },
    [initialize]
  );

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
            <YouTubeLinkInput
              onLinkDataChange={newData =>
                initialize(newData.videos, newData.initialIndex)
              }
            />
          </>
        </ResponsiveContainer>
        <UserPlaylists onUserPlaylistPicked={handlePickedUserPlaylist} />
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
