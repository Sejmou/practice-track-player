import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from 'react';

import { Musical, Song, SongTrack } from '@models';

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
    (song: Song) => {
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
    },
    [songs, updateNextPreviousAvailability]
  );

  const changeTrackHandler = useCallback(
    (track: SongTrack) => {
      const trackIdx = tracks.findIndex(t => t.name === track.name);
      if (trackIdx === -1) {
        console.warn(
          `Cannot change track, no track with name '${track.name}' found for current song!`
        );
        console.warn('Current song:', currentSong);
        return;
      }
      setCurrentTrack(tracks[trackIdx]);
    },
    [tracks, currentSong]
  );

  const goToNextSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const nextSong = songs[currentSongIdx + 1];
    if (nextSong) {
      setCurrentSong(nextSong);
      updateNextPreviousAvailability(currentSongIdx + 1);
    }
  }, [currentSong, songs, updateNextPreviousAvailability]);

  const goToPreviousSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const previousSong = songs[currentSongIdx - 1];
    if (previousSong) {
      setCurrentSong(previousSong);
      updateNextPreviousAvailability(currentSongIdx - 1);
    }
  }, [currentSong, songs, updateNextPreviousAvailability]);

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
