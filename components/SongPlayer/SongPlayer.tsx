import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { SourceData } from '@models';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls/AudioControls';

const jsonFetcher = (url: string) => fetch(url).then(res => res.json());

const binaryDataFetcher = (url: string) =>
  fetch(url).then(data => data.arrayBuffer());

const audioBufferFetcher = (url: string, ctx: AudioContext) =>
  binaryDataFetcher(url).then(buffer => ctx.decodeAudioData(buffer));

type WaveformDataStrategy =
  | 'fetch audio from audioElement src, create waveforms on client'
  | 'fetch pre-computed waveform data from server'
  | 'fetch audio from server, create waveforms on client';

type Props = {
  /**
   * specifies how waveform data for the player should be retrieved
   */
  waveformDataStrategy: WaveformDataStrategy;
};

const SongPlayer = ({ waveformDataStrategy }: Props) => {
  const {
    currentSong: song,
    currentTrack: track,
    previousSongAvailable,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
  } = useMusicalContext();

  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  // this logic is quite nasty lol

  const { data: audioElSrcData, error: audioElSrcDataError } = useSWRImmutable<
    SourceData,
    any
  >('/api/yt-audio/audio-el-data/' + videoId, jsonFetcher, {
    shouldRetryOnError: false, // we must not spam the API, otherwise YouTube blocks the server!
  });

  // maybe useful for debugging
  // const { data: audioElSrcData, error: audioElSrcDataError } = {
  //   data: {
  //     src: 'https://rr5---sn-h0jeenle.googlevideo.com/videoplayback?expire=1660315795&ei=MxT2Yo7RNZiIgAfApJeoCA&ip=84.115.237.172&id=o-AD3BE2JL_ED8ZbF6WVQmihCjrQ1WDIh3FsrD7JuodVJT&itag=251&source=youtube&requiressl=yes&mh=5n&mm=31%2C29&mn=sn-h0jeenle%2Csn-h0jelnes&ms=au%2Crdu&mv=m&mvi=5&pl=19&initcwndbps=2417500&spc=lT-KhmXkPbfGel7oZGOIVtDWoKS4UhA&vprv=1&mime=audio%2Fwebm&ns=FRG2tShWt-lEet29vGwPH5kH&gir=yes&clen=961454&otfp=1&dur=85.521&lmt=1649186800517049&mt=1660293906&fvip=5&keepalive=yes&fexp=24001373%2C24007246&c=WEB&rbqsm=fr&txp=6211224&n=1RmjdttY28P7sQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cotfp%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAJ7t_Sc6dIrSQAF_n0VBq2AICa5Nc96pUdz1iewP8nI6AiBIyNEGKlncExSC7slpS9Pp-mVS3-5UBs6BjocjYeDjvQ%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAIEA-S0cE-hYzX6E2oQVxNpBvUHkqFHKJelGgm08NGrDAiAUHj3Pi-GAPEQW4TbhW6aYPBHQzjBXatgyl-Rj3S28hw%3D%3D',
  //     type: 'audio/mpeg',
  //   },
  //   error: null,
  // };

  const { data: audioBuffer, error: audioBufferError } = useSWRImmutable<
    AudioBuffer,
    any
  >(
    waveformDataStrategy ===
      'fetch audio from server, create waveforms on client'
      ? ['/api/server-audio/mp3/' + videoId, audioContext]
      : null,
    audioBufferFetcher
  );

  const { data: waveformDataBuffer, error: waveformDataBufferError } =
    useSWRImmutable<ArrayBuffer, any>(
      waveformDataStrategy === 'fetch pre-computed waveform data from server'
        ? '/api/server-audio/waveform-data/' + videoId
        : null,
      binaryDataFetcher
    );

  console.log({ audioElSrcData, audioBuffer, waveformDataBuffer });

  const errorMsgs = [
    audioElSrcDataError ? 'Could not load audio file' : '',
    audioBufferError ? 'Could not load waveform data from audio file' : '',
    waveformDataBufferError ? 'Could not load waveform data' : '',
  ];

  const hasErrors = errorMsgs.some(msg => !!msg);

  const dataReady =
    !!audioElSrcData &&
    ((waveformDataStrategy ===
      'fetch audio from server, create waveforms on client' &&
      !!audioBuffer) ||
      (waveformDataStrategy ===
        'fetch pre-computed waveform data from server' &&
        !!waveformDataBuffer) ||
      waveformDataStrategy ===
        'fetch audio from audioElement src, create waveforms on client');

  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography variant={narrowViewport ? 'body2' : 'body1'}>
          Current Song:
        </Typography>
        <Typography variant={narrowViewport ? 'h6' : 'h5'}>
          {song.no}. {song.title}
        </Typography>
      </Box>
      {dataReady ? (
        <AudioControls
          audioContext={audioContext}
          audioElSrcData={audioElSrcData}
          audioBuffer={audioBuffer}
          onNext={goToNextSong}
          onPrevious={goToPreviousSong}
          nextAvailable={nextSongAvailable}
          previousAvailable={previousSongAvailable}
          waveformDataBuffer={waveformDataBuffer}
        />
      ) : (
        <SuspenseContainer
          height={309 + 64}
          status={!hasErrors ? 'loading' : 'error'}
          errors={[
            'Could not load player 😢',
            ...errorMsgs.filter(msg => !!msg),
          ]}
          loadingMessage="Loading player"
        />
      )}
    </Box>
  );
};
export default SongPlayer;
