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

  console.log('current song', currentSong);
  console.log('current track', currentTrack);

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
      setNextSongAvailable(!!songs[songIdx + 1]);
      setPreviousSongAvailable(!!songs[songIdx - 1]);
    },
    [songs]
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

  return {
    songs,
    tracks,
    currentSong,
    currentTrack,
    setCurrentSong: changeSongHandler,
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
  setCurrentTrack: () => {},
  previousSongAvailable: false,
  nextSongAvailable: false,
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
