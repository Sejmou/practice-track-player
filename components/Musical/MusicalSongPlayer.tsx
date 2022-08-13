import { useMemo } from 'react';

import { useMusicalContext } from '@frontend/context/musical-context';

import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import SongPlayer from '@components/SongPlayer/SongPlayer';
import {
  useServerAudioSrcDataFetcher,
  useServerWaveformDataFetcher,
  useYouTubeAudioSrcDataFetcher,
} from '@frontend/hooks/use-audio-data-fetcher';

const MusicalSongPlayer = () => {
  const {
    currentSong: song,
    currentTrack: track,
    previousSongAvailable,
    nextSongAvailable,
    goToNextSong,
    goToPreviousSong,
  } = useMusicalContext();

  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);

  const { data: audioElSrcData, error: audioElSrcError } =
    useYouTubeAudioSrcDataFetcher(videoId);
  const { data: waveformData, error: waveformDataError } =
    useServerWaveformDataFetcher(videoId);

  const dataReady = !!audioElSrcData && !!waveformData;
  const errorMsgs = [
    audioElSrcError ? 'Could not load audio file' : '',
    waveformDataError ? 'Could not load waveform data' : '',
  ];
  const hasErrors = errorMsgs.some(msg => !!msg);

  return dataReady ? (
    <SongPlayer
      song={song}
      audioElSrcData={audioElSrcData}
      waveformData={waveformData}
      previousSongAvailable={previousSongAvailable}
      nextSongAvailable={nextSongAvailable}
      onNextSong={goToNextSong}
      onPreviousSong={goToPreviousSong}
    />
  ) : (
    <SuspenseContainer
      height={309 + 64}
      status={!hasErrors ? 'loading' : 'error'}
      errors={['Could not load player 😢', ...errorMsgs.filter(msg => !!msg)]}
      loadingMessage="Loading player"
    />
  );
};
export default MusicalSongPlayer;
