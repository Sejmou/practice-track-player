import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from 'react';

import {
  Musical,
  MusicalSong,
  MusicalSongTrack,
  MusicalSongTrackTimeStamp,
} from '@models';

const useMusicalController = (musical: Musical) => {
  const songs = musical.songs;
  const [currentSong, setCurrentSong] = useState(songs[0]);

  const tracks = useMemo(() => currentSong.tracks, [currentSong]);
  const [currentTrack, setCurrentTrack] = useState(tracks[0]);

  const [nextSongAvailable, setNextSongAvailable] = useState(true);
  const [previousSongAvailable, setPreviousSongAvailable] = useState(false);

  const updateNextPreviousAvailability = useCallback(
    (newIdx: number) => {
      setNextSongAvailable(!!songs[newIdx + 1]);
      setPreviousSongAvailable(!!songs[newIdx - 1]);
    },
    [songs]
  );

  const changeSongHandler = useCallback(
    (song: MusicalSong) => {
      const songIdx = songs.findIndex(s => s.no === song.no);
      if (songIdx === -1) {
        console.warn(
          `Cannot change song, no song with song no.'${song.no} found!`
        );
        return;
      }
      setCurrentSong(songs[songIdx]);
      setCurrentTrack(songs[songIdx].tracks[0]);
      updateNextPreviousAvailability(songIdx);
      setLastSeekedTime(0);
    },
    [songs, updateNextPreviousAvailability]
  );

  const changeTrackHandler = useCallback(
    (track: MusicalSongTrack) => {
      const trackIdx = tracks.findIndex(t => t.name === track.name);
      if (trackIdx === -1) {
        console.warn(
          `Cannot change track, no track with name '${track.name}' found for current song!`
        );
        console.warn('Current song:', currentSong);
        return;
      }
      setCurrentTrack(tracks[trackIdx]);
      setLastSeekedTime(0);
    },
    [tracks, currentSong]
  );

  const goToNextSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const nextSong = songs[currentSongIdx + 1];
    if (nextSong) {
      setCurrentSong(nextSong);
      updateNextPreviousAvailability(currentSongIdx + 1);
      setCurrentTrack(nextSong.tracks[0]);
      setLastSeekedTime(0);
    }
  }, [currentSong, songs, updateNextPreviousAvailability]);

  const goToPreviousSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const previousSong = songs[currentSongIdx - 1];
    if (previousSong) {
      setCurrentSong(previousSong);
      updateNextPreviousAvailability(currentSongIdx - 1);
      setCurrentTrack(previousSong.tracks[0]);
      setLastSeekedTime(0);
    }
  }, [currentSong, songs, updateNextPreviousAvailability]);

  const [lastSeekedTime, setLastSeekedTime] = useState(0);

  const seekCurrentTrack = useCallback((seconds: number) => {
    // setting to slightly larger value than provided seconds to always "trigger change detection"
    // especially, also when seeking to same number of seconds as before
    setLastSeekedTime(seconds + Math.random() * 0.001);
  }, []);

  const [currentTimeStamps, setCurrentTimeStamps] = useState<
    MusicalSongTrackTimeStamp[]
  >([]);

  return {
    songs,
    tracks,
    currentSong,
    currentTrack,
    setCurrentSong: changeSongHandler,
    goToNextSong,
    goToPreviousSong,
    previousSongAvailable,
    nextSongAvailable,
    setCurrentTrack: changeTrackHandler,
    lastSeekedTime,
    seekCurrentTrack,
    currentTimeStamps,
    setCurrentTimeStamps,
  };
};

const MusicalContext = createContext<ReturnType<typeof useMusicalController>>({
  songs: [],
  tracks: [],
  currentSong: {
    title: '',
    no: '',
    tracks: [],
  },
  currentTrack: {
    name: '',
    url: '',
  },
  setCurrentSong: () => {},
  goToNextSong: () => {},
  goToPreviousSong: () => {},
  previousSongAvailable: false,
  nextSongAvailable: false,
  setCurrentTrack: () => {},
  lastSeekedTime: 0,
  seekCurrentTrack: () => {},
  currentTimeStamps: [],
  setCurrentTimeStamps: () => {},
});

export const MusicalProvider = ({
  musical,
  children,
}: {
  musical: Musical;
  children: React.ReactNode;
}) => (
  <MusicalContext.Provider value={useMusicalController(musical)}>
    {children}
  </MusicalContext.Provider>
);

export const useMusicalContext = () => useContext(MusicalContext);
