import React, {
  useState,
  useMemo,
  createContext,
  useContext,
  useCallback,
  useRef,
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
  const [filteredSongs, setFilteredSongs] = useState(musical.songs);
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

  const router = useRouter();
  const queryParams = useRef<{ [key: string]: string }>({
    songIdx: initialSongIdx.toString(),
    trackIdx: initialTrackIdx.toString(),
    filters: initialFilters
      .map(f => encodeURIComponent(f))
      .join(encodeURIComponent(',')),
  });
  const updateQueryParams = useCallback(() => {
    console.log('updating params');
    if (!queryParams.current.filters) {
      // TODO: there must be a cleaner way to solve this problem
      delete queryParams.current.filters;
      delete router.query.filters;
    }
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, ...queryParams.current },
    });
  }, [router]);

  const handleSongIdxChange = useCallback(
    (newIdx: number) => {
      setCurrSongIdx(newIdx);
      queryParams.current.songIdx = newIdx.toString();
      updateQueryParams();
      setCurrTrackIdx(0);
      updateNextPreviousAvailability(newIdx);
      setLastSeekedTime(0);
    },
    [updateNextPreviousAvailability, updateQueryParams]
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
      handleSongIdxChange(songIdx);
    },
    [filteredSongs, handleSongIdxChange]
  );

  const handleTrackIdxChange = useCallback(
    (newIdx: number) => {
      const validIndex = !!tracks[newIdx];
      if (!validIndex) return;
      setCurrTrackIdx(newIdx);
      setLastSeekedTime(0);
      queryParams.current.trackIdx = newIdx.toString();
      updateQueryParams();
    },
    [tracks, updateQueryParams]
  );

  const changeTrackHandler = useCallback(
    (track: MusicalSongTrack) => {
      const trackIdx = tracks.findIndex(t => t.name === track.name);
      if (trackIdx === -1) {
        console.warn(
          `Cannot change track, no track with name '${track.name}' found for current song!`
        );
        return;
      }
      handleTrackIdxChange(trackIdx);
    },
    [handleTrackIdxChange, tracks]
  );

  const goToNextSong = useCallback(() => {
    const currentSongIdx = filteredSongs.findIndex(
      song => song === currentSong
    );
    const nextSong = filteredSongs[currentSongIdx + 1];
    if (nextSong) {
      handleSongIdxChange(currentSongIdx + 1);
    }
  }, [filteredSongs, currentSong, handleSongIdxChange]);

  const goToPreviousSong = useCallback(() => {
    const currentSongIdx = filteredSongs.findIndex(
      song => song === currentSong
    );
    const previousSong = filteredSongs[currentSongIdx - 1];
    if (previousSong) {
      handleSongIdxChange(currentSongIdx - 1);
    }
  }, [filteredSongs, currentSong, handleSongIdxChange]);

  const goToNextTrack = useCallback(() => {
    const trackIdx = tracks.findIndex(t => t.name === currentTrack.name);
    const nextTrack = tracks[trackIdx + 1];
    if (nextTrack) {
      handleTrackIdxChange(trackIdx + 1);
    }
  }, [currentTrack.name, handleTrackIdxChange, tracks]);

  const goToPreviousTrack = useCallback(() => {
    const trackIdx = tracks.findIndex(t => t.name === currentTrack.name);
    const previousTrack = tracks[trackIdx - 1];
    if (previousTrack) {
      handleTrackIdxChange(trackIdx - 1);
    }
  }, [currentTrack.name, handleTrackIdxChange, tracks]);

  const [lastSeekedTime, setLastSeekedTime] = useState(0);

  const seekCurrentTrack = useCallback((seconds: number) => {
    // setting to slightly larger value than provided seconds to always "trigger change detection"
    // especially, also when seeking to same number of seconds as before
    setLastSeekedTime(seconds + Math.random() * 0.001);
  }, []);

  const [currentTimeStamps, setCurrentTimeStamps] = useState<
    MusicalSongTrackTimeStamp[]
  >([]);

  const [stagedTrackFilters, setStagedTrackFilters] = useState<TrackFilter[]>(
    initialFilters.map(f => ({ label: f, value: encodeURIComponent(f) }))
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

  const filterTracks = useCallback(
    (newFilters: TrackFilter[], initializing?: boolean) => {
      if (newFilters.length === 0) delete queryParams.current.filters;
      else {
        const filtersString = stagedTrackFilters
          .map(f => f.value)
          .join(encodeURIComponent(','));
        queryParams.current.filters = filtersString;
      }
      updateQueryParams(); // apply changes to filters in URL query params as well
      const newFilteredSongs =
        newFilters.length === 0
          ? musical.songs
          : musical.songs
              .map(s => ({
                ...s,
                tracks: s.tracks.filter(
                  t =>
                    !!newFilters.find(
                      filter =>
                        t.name.toLowerCase() === filter.label.toLowerCase()
                    )
                ),
              }))
              .filter(s => s.tracks.length > 0);

      // TODO: make this easier to understand lol

      if (initializing) {
        setFilteredSongs(newFilteredSongs);
        return;
      }

      if (currentSong) {
        const currSongIdxInNewFilter = newFilteredSongs.findIndex(
          s => s.title === currentSong.title
        );
        if (currSongIdxInNewFilter !== -1) {
          console.log(
            'Found current song in new filtered songs',
            newFilteredSongs[currSongIdxInNewFilter]
          );
          // we can jump to index of current song in new filter selection
          const currTrackIdxInNewFilter = newFilteredSongs[
            currSongIdxInNewFilter
          ].tracks.findIndex(t => t.name === currentTrack.name);
          handleSongIdxChange(currSongIdxInNewFilter);
          handleTrackIdxChange(
            currTrackIdxInNewFilter !== -1 ? currTrackIdxInNewFilter : 0
          );
        } else {
          handleTrackIdxChange(0);
          handleSongIdxChange(0);
        }
      } else {
        // current song not present anymore in current filter selection - jump to beginning!
        handleTrackIdxChange(0);
        handleSongIdxChange(0);
      }
      setFilteredSongs(newFilteredSongs);
    },
    [
      currentSong,
      currentTrack,
      handleSongIdxChange,
      handleTrackIdxChange,
      musical.songs,
      stagedTrackFilters,
      updateQueryParams,
    ]
  );

  useEffect(() => {
    filterTracks(
      initialFilters.map(f => ({ label: f, value: encodeURIComponent(f) })),
      true
    );
  }, []);

  const applyFilters = useCallback(() => {
    console.log('applying filters');
    filterTracks(stagedTrackFilters);
  }, [filterTracks, stagedTrackFilters]);

  const resetFilters = useCallback(() => {
    console.log('resetting filters');
    setStagedTrackFilters([]);
    filterTracks([]);
  }, [filterTracks]);

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
