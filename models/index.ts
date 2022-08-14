import { z } from 'zod';

export const SongTrackValidator = z.object({
  name: z.string(),
  url: z.string().url().startsWith('https://www.youtube.com/watch?v='),
});
export type SongTrack = z.infer<typeof SongTrackValidator>;

const SongValidator = z.object({
  no: z.string(),
  title: z.string(),
});
export type Song = z.infer<typeof SongValidator>;

export const MusicalSongValidator = SongValidator.extend({
  tracks: z.array(SongTrackValidator),
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
