import Head from 'next/head';
import { NextPage } from 'next/types';
import {
  ChangeEvent,
  FocusEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  InputAdornment,
  Paper,
  Stack,
  SxProps,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/material';
import AudioPlayer from '@components/AudioPlayer/AudioPlayer';
import SongList from '@components/SongList/SongList';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { getURLVideoID } from 'ytdl-core';
import {
  useProxyAudioBufferFetcher,
  useYouTubeAudioSrcDataFetcher,
} from '@frontend/hooks/use-audio-data-fetcher';
import {
  YouTubePlaylistData,
  YouTubePlaylistDataValidator,
  YouTubeVideoData,
  YouTubeVideoDataValidator,
} from '@models';

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

const YouTubePlayer: NextPage = (props: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const [linkInputTourched, setLinkInputTouched] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState(false);

  // const [youTubeLinkData, setYouTubeLinkData] = useState<YouTubeLinkData>();

  const [videoData, setVideoData] = useState<YouTubeVideoData[]>([]);
  const [currVideoIdx, setCurrVideoIdx] = useState(0);

  const nextHandler = useCallback(() => {
    setCurrVideoIdx(prev => Math.min(prev + 1, videoData.length - 1));
  }, [videoData]);

  const previousHandler = useCallback(() => {
    setCurrVideoIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const linkInputChangeHandler = useCallback(
    async (
      ev: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>
    ) => {
      if (!audioContext) return; // should never be the case in practice
      const input = ev.target.value;
      const { videoId, playlistId, playlistIndex } = getYouTubeVideoData(input);
      const inputInvalid = !videoId && !playlistId;

      console.log({ videoId, playlistId, playlistIndex });
      console.log(inputInvalid);
      setVideoLinkError(inputInvalid);

      // too lazy to write useSWR hook for that, should be fine anyway
      if (playlistId) {
        const playlistData = await fetch(
          `/api/yt/playlist-video-metadata/${playlistId}`
        )
          .then(res => res.json())
          .then(json => YouTubePlaylistDataValidator.parse(json));
        setVideoData(playlistData);
      } else if (videoId) {
        const videoData = await fetch(`/api/yt/video-metadata/${videoId}`)
          .then(res => res.json())
          .then(json => YouTubeVideoDataValidator.parse(json));
        setVideoData([videoData]);
      }
    },
    [audioContext]
  );

  const linkBlurHandler = () => {
    setLinkInputTouched(true);
  };

  const { data: audioSrcData, error: audioSrcDataError } =
    useYouTubeAudioSrcDataFetcher(
      videoData[currVideoIdx]?.videoId ? videoData[currVideoIdx].videoId : null
    );

  const { data: audioBuffer, error: audioBufferError } =
    useProxyAudioBufferFetcher(audioSrcData?.src ? audioSrcData.src : null);

  const playerDataReady =
    !!audioSrcData && !!audioBuffer && videoData.length > 0;

  console.log('errors', audioSrcDataError, audioBufferError);
  console.log(audioBuffer);

  const linkInput = (
    <>
      <Typography variant="h3">YouTube Player</Typography>
      <Paper sx={{ p: 1, mt: 1 }}>
        <Typography variant="subtitle1" my={1}>
          Play the audio of a YouTube video (or even a whole playlist) in a nice
          audio player interface 🤘
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
          onChange={linkInputChangeHandler}
          onBlur={linkBlurHandler}
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
            <AudioPlayer
              mainTitle={videoData[currVideoIdx].title}
              subTitle={`uploaded by ${videoData[currVideoIdx].channelTitle}`}
              audioElSrcData={audioSrcData}
              audioContext={audioContext}
              nextDisabled={currVideoIdx === videoData.length - 1}
              onNext={nextHandler}
              onPrevious={previousHandler}
            />
            {videoData.length > 1 && (
              <SongList
                songs={videoData}
                currentSong={videoData[currVideoIdx]}
                handleSongChange={song => {
                  const currVideo = song as YouTubeVideoData;
                  setCurrVideoIdx(
                    videoData.findIndex(d => d.videoId === currVideo.videoId)
                  );
                }}
              />
            )}
            <Stack direction="row">{linkInput}</Stack>
          </Stack>
        )}
      </Box>
    </>
  );
};
export default YouTubePlayer;

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
const validPathDomains =
  /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;

function getYouTubeQueryParam(link: string, paramName: string) {
  try {
    const parsed = new URL(link.trim());
    let paramValue = parsed.searchParams.get(paramName);
    if (validPathDomains.test(link.trim()) && !paramValue) {
      const paths = parsed.pathname.split('/');
      paramValue = parsed.host === 'youtu.be' ? paths[1] : paths[2];
    } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
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
