import { z } from 'zod';

export const MusicalSongTrackSegmentValidator = z.object({
  startTime: z.number(),
  endTime: z.number(),
  labelText: z.string(),
});
export type MusicalSongTrackSegment = z.infer<
  typeof MusicalSongTrackSegmentValidator
>;

export const MusicalSongTrackTimeStampValidator = z.object({
  time: z.number(),
  labelText: z.string(),
});
export type MusicalSongTrackTimeStamp = z.infer<
  typeof MusicalSongTrackTimeStampValidator
>;

export const MusicalSongTrackValidator = z.object({
  name: z.string(),
  url: z.string().url().startsWith('https://www.youtube.com/watch?v='),
  segments: z.array(MusicalSongTrackSegmentValidator).optional(),
  timestamps: z.array(MusicalSongTrackTimeStampValidator).optional(),
});
export type MusicalSongTrack = z.infer<typeof MusicalSongTrackValidator>;

const SongValidator = z.object({
  title: z.string(),
  artist: z.string().optional(),
  releaseDate: z.date().optional(),
  album: z.string().optional(),
  no: z.string().optional(),
});
export type Song = z.infer<typeof SongValidator>;

export const MusicalSongValidator = SongValidator.extend({
  tracks: z.array(MusicalSongTrackValidator),
});
export type MusicalSong = z.infer<typeof MusicalSongValidator>;

export const MusicalValidator = z.object({
  title: z.string(),
  songs: z.array(MusicalSongValidator),
});
export type Musical = z.infer<typeof MusicalValidator>;

export const MusicalBaseDataValidator = z.object({
  title: z.string(),
  id: z.string(),
});
export type MusicalBaseData = z.infer<typeof MusicalBaseDataValidator>;

export const SourceDataValidator = z.object({
  src: z.string().url(),
  type: z.string(),
});

export type SourceData = z.infer<typeof SourceDataValidator>;

export const TimeStampValidator = z.object({
  seconds: z.number().min(0),
  label: z.string(),
});

export type TimeStamp = z.infer<typeof TimeStampValidator>;
