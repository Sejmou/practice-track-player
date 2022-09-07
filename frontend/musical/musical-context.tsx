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

export type TrackFilter = {
  label: string;
  value: string;
};

const useMusicalController = (
  musical: Musical,
  initialSongIdx: number,
  initialTrackIdx: number,
  initialFilters: string[]
) => {
  const [appliedTrackFilters, setAppliedTrackFilters] = useState<TrackFilter[]>(
    initialFilters.map(f => ({ label: f, value: encodeURIComponent(f) }))
  );

  const [stagedTrackFilters, setStagedTrackFilters] = useState<TrackFilter[]>(
    initialFilters.map(f => ({ label: f, value: encodeURIComponent(f) }))
  );

  const applyFilters = useCallback(() => {
    setCurrSongIdx(0);
    setCurrTrackIdx(0);
    setAppliedTrackFilters(stagedTrackFilters);
  }, [stagedTrackFilters]);

  const resetFilters = useCallback(() => {
    setCurrSongIdx(0);
    setCurrTrackIdx(0);
    setAppliedTrackFilters([]);
    setStagedTrackFilters([]);
  }, []);

  const filteredSongs = useMemo(
    () =>
      musical.songs
        .map(s => ({
          ...s,
          tracks:
            appliedTrackFilters.length > 0
              ? s.tracks.filter(
                  t =>
                    !!appliedTrackFilters.find(
                      filter =>
                        t.name.toLowerCase() === filter.label.toLowerCase()
                    )
                )
              : s.tracks,
        }))
        .filter(s => s.tracks.length > 0),
    [appliedTrackFilters, musical.songs]
  );

  const trackFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(musical.songs.map(s => s.tracks.map(t => t.name)).flat())
      )
        .filter(name => !name.includes('Private video'))
        .sort()
        .map(name => ({ label: name, value: encodeURIComponent(name) })),
    [musical.songs]
  );

  const addTrackFilter = useCallback(
    (filter: TrackFilter) => {
      const addVocalFilter =
        !filter.label.toLowerCase().includes('piano') &&
        !filter.label.toLowerCase().includes('instrumental') &&
        !stagedTrackFilters.find(f => f.label === 'Vocal');
      setStagedTrackFilters(
        addVocalFilter
          ? [
              ...stagedTrackFilters,
              filter,
              { label: 'Vocal', value: encodeURIComponent('Vocal') },
            ]
          : [...stagedTrackFilters, filter]
      );
    },
    [stagedTrackFilters]
  );

  const removeTrackFilter = useCallback(
    (filter: TrackFilter) => {
      setStagedTrackFilters(
        stagedTrackFilters.filter(f => f.label !== filter.label)
      );
    },
    [stagedTrackFilters]
  );

  const [currSongIdx, setCurrSongIdx] = useState(initialSongIdx);

  const currentSong = useMemo(() => {
    return filteredSongs[currSongIdx];
  }, [currSongIdx, filteredSongs]);

  const tracks = useMemo(() => currentSong.tracks, [currentSong]);
  const [currTrackIdx, setCurrTrackIdx] = useState(initialTrackIdx);

  const currentTrack = useMemo(() => {
    return tracks[currTrackIdx];
  }, [tracks, currTrackIdx]);

  const [nextSongAvailable, setNextSongAvailable] = useState(true);
  const [previousSongAvailable, setPreviousSongAvailable] = useState(false);

  const updateNextPreviousAvailability = useCallback(
    (newIdx: number) => {
      setNextSongAvailable(!!filteredSongs[newIdx + 1]);
      setPreviousSongAvailable(!!filteredSongs[newIdx - 1]);
    },
    [filteredSongs]
  );

  const changeSongHandler = useCallback(
    (song: MusicalSong) => {
      const songIdx = filteredSongs.findIndex(s => s.no === song.no);
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
    [setCurrSongIdx, filteredSongs, updateNextPreviousAvailability]
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
    const currentSongIdx = filteredSongs.findIndex(
      song => song === currentSong
    );
    const nextSong = filteredSongs[currentSongIdx + 1];
    if (nextSong) {
      setCurrSongIdx(currentSongIdx + 1);
      updateNextPreviousAvailability(currentSongIdx + 1);
      setCurrTrackIdx(0);
      setLastSeekedTime(0);
    }
  }, [
    currentSong,
    setCurrSongIdx,
    filteredSongs,
    updateNextPreviousAvailability,
  ]);

  const goToPreviousSong = useCallback(() => {
    const currentSongIdx = filteredSongs.findIndex(
      song => song === currentSong
    );
    const previousSong = filteredSongs[currentSongIdx - 1];
    if (previousSong) {
      setCurrSongIdx(currentSongIdx - 1);
      updateNextPreviousAvailability(currentSongIdx - 1);
      setCurrTrackIdx(0);
      setLastSeekedTime(0);
    }
  }, [
    currentSong,
    setCurrSongIdx,
    filteredSongs,
    updateNextPreviousAvailability,
  ]);

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
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, songIdx: currSongIdx },
    });
  }, [currSongIdx]); //TODO: figure out why this behaves VERY weirdly as soon as router is added as dependency

  useEffect(() => {
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, trackIdx: currTrackIdx },
    });
  }, [currTrackIdx]);

  useEffect(() => {
    const filtersString = appliedTrackFilters
      .map(f => f.value)
      .join(encodeURIComponent(','));
    const query = {
      ...router.query,
    };
    if (filtersString) {
      query.filters = filtersString;
    } else {
      delete query.filters;
    }
    router.replace({
      pathname: router.pathname,
      query,
    });
  }, [appliedTrackFilters]);

  console.log('current song index', currSongIdx);
  console.log('applied track filters', appliedTrackFilters);

  return {
    songs: filteredSongs,
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
    addTrackFilter,
    removeTrackFilter,
    applyFilters,
    resetFilters,
    stagedTrackFilters,
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
  stagedTrackFilters: [],
  addTrackFilter: () => {},
  removeTrackFilter: () => {},
  applyFilters: () => {},
  resetFilters: () => {},
});

export const MusicalProvider = ({
  musical,
  initialSongIdx,
  initialTrackIdx,
  initialFilters,
  children,
}: {
  musical: Musical;
  initialSongIdx: number;
  initialTrackIdx: number;
  initialFilters: string[];
  children: React.ReactNode;
}) => (
  <MusicalContext.Provider
    value={useMusicalController(
      musical,
      initialSongIdx,
      initialTrackIdx,
      initialFilters
    )}
  >
    {children}
  </MusicalContext.Provider>
);

export const useMusicalContext = () => useContext(MusicalContext);
