import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';

import {
  Musical,
  MusicalSong,
  MusicalSongTrack,
  MusicalSongTrackTimeStamp,
} from '@models';
import { useRouter } from 'next/router';

type TrackFilterOption = {
  label: string;
  value: string;
};

const useMusicalController = (
  musical: Musical,
  initialSongIdx: number,
  initialTrackIdx: number
) => {
  const [appliedTrackFilters, setAppliedTrackFilters] = useState<
    TrackFilterOption[]
  >([]);

  const songs = useMemo(
    () =>
      musical.songs
        .map(s => ({
          ...s,
          tracks:
            appliedTrackFilters.length > 0
              ? s.tracks.filter(t =>
                  appliedTrackFilters.map(o => o.label).includes(t.name)
                )
              : s.tracks,
        }))
        .filter(s => s.tracks.length > 0),
    [appliedTrackFilters, musical.songs]
  );

  const trackFilterOptions = useMemo(
    () =>
      Array.from(new Set(songs.map(s => s.tracks.map(t => t.name)).flat()))
        .filter(name => !name.includes('Private video'))
        .sort()
        .map(name => ({ label: name, value: encodeURIComponent(name) })),
    [songs]
  );

  const addTrackFilter = useCallback(
    (filter: TrackFilterOption) => {
      console.log('in add track filter');
      const newFilter = trackFilterOptions.find(f => f.label === filter.label);
      if (newFilter)
        setAppliedTrackFilters([...appliedTrackFilters, newFilter]);
    },
    [appliedTrackFilters, trackFilterOptions]
  );

  const removeTrackFilter = useCallback(
    (filter: TrackFilterOption) => {
      setAppliedTrackFilters(
        appliedTrackFilters.filter(f => f.label !== filter.label)
      );
    },
    [appliedTrackFilters]
  );

  const [currSongIdx, setCurrSongIdx] = useState(initialSongIdx);

  useEffect(() => {
    setCurrSongIdx(initialSongIdx);
  }, [initialSongIdx, setCurrSongIdx, songs]);

  const currentSong = useMemo(() => {
    return songs[currSongIdx];
  }, [currSongIdx, songs]);

  const tracks = useMemo(() => currentSong.tracks, [currentSong]);
  const [currTrackIdx, setCurrTrackIdx] = useState(initialTrackIdx);

  const currentTrack = useMemo(() => {
    return tracks[currTrackIdx];
  }, [tracks, currTrackIdx]);

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
      setCurrSongIdx(songIdx);
      setCurrTrackIdx(0);
      updateNextPreviousAvailability(songIdx);
      setLastSeekedTime(0);
    },
    [setCurrSongIdx, songs, updateNextPreviousAvailability]
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
      setCurrTrackIdx(trackIdx);
      setLastSeekedTime(0);
    },
    [tracks, currentSong]
  );

  const goToNextSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const nextSong = songs[currentSongIdx + 1];
    if (nextSong) {
      setCurrSongIdx(currentSongIdx + 1);
      updateNextPreviousAvailability(currentSongIdx + 1);
      setCurrTrackIdx(0);
      setLastSeekedTime(0);
    }
  }, [currentSong, setCurrSongIdx, songs, updateNextPreviousAvailability]);

  const goToPreviousSong = useCallback(() => {
    const currentSongIdx = songs.findIndex(song => song === currentSong);
    const previousSong = songs[currentSongIdx - 1];
    if (previousSong) {
      setCurrSongIdx(currentSongIdx - 1);
      updateNextPreviousAvailability(currentSongIdx - 1);
      setCurrTrackIdx(0);
      setLastSeekedTime(0);
    }
  }, [currentSong, setCurrSongIdx, songs, updateNextPreviousAvailability]);

  const goToNextTrack = useCallback(() => {
    const trackIdx = tracks.findIndex(t => t.name === currentTrack.name);
    const nextTrack = tracks[trackIdx + 1];
    if (nextTrack) {
      setCurrTrackIdx(trackIdx + 1);
      setLastSeekedTime(0);
    }
  }, [currentTrack.name, tracks]);

  const goToPreviousTrack = useCallback(() => {
    const trackIdx = tracks.findIndex(t => t.name === currentTrack.name);
    const previousTrack = tracks[trackIdx - 1];
    if (previousTrack) {
      setCurrTrackIdx(trackIdx - 1);
      setLastSeekedTime(0);
    }
  }, [currentTrack.name, tracks]);

  const [lastSeekedTime, setLastSeekedTime] = useState(0);

  const seekCurrentTrack = useCallback((seconds: number) => {
    // setting to slightly larger value than provided seconds to always "trigger change detection"
    // especially, also when seeking to same number of seconds as before
    setLastSeekedTime(seconds + Math.random() * 0.001);
  }, []);

  const [currentTimeStamps, setCurrentTimeStamps] = useState<
    MusicalSongTrackTimeStamp[]
  >([]);

  const router = useRouter();

  useEffect(() => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, songIdx: currSongIdx },
      },
      undefined,
      { shallow: true }
    );
  }, [currSongIdx]); //TODO: figure out why this behaves VERY weirdly as soon as router is added as dependency

  useEffect(() => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, trackIdx: currTrackIdx },
      },
      undefined,
      { shallow: true }
    );
  }, [currTrackIdx]);

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
    goToNextTrack,
    goToPreviousTrack,
    setCurrSongIdx,
    setCurrTrackIdx,
    trackFilterOptions,
    appliedTrackFilters,
    addTrackFilter,
    removeTrackFilter,
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
  goToNextTrack: () => {},
  goToPreviousTrack: () => {},
  setCurrSongIdx: () => {},
  setCurrTrackIdx: () => {},
  trackFilterOptions: [],
  appliedTrackFilters: [],
  addTrackFilter: () => {},
  removeTrackFilter: () => {},
});

export const MusicalProvider = ({
  musical,
  initialSongIdx,
  initialTrackIdx,
  children,
}: {
  musical: Musical;
  initialSongIdx: number;
  initialTrackIdx: number;
  children: React.ReactNode;
}) => (
  <MusicalContext.Provider
    value={useMusicalController(musical, initialSongIdx, initialTrackIdx)}
  >
    {children}
  </MusicalContext.Provider>
);

export const useMusicalContext = () => useContext(MusicalContext);
