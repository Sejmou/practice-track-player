import { z } from 'zod';

export const SongTrackValidator = z.object({
  track: z.string(),
  url: z.string().url().startsWith('https://www.youtube.com/watch?v='),
});
export type SongTrack = z.infer<typeof SongTrackValidator>;

const SongBaseValidator = z.object({
  no: z.string(),
  title: z.string(),
});
export type SongBase = z.infer<typeof SongBaseValidator>;

export const SongValidator = SongBaseValidator.extend({
  tracks: z.array(SongTrackValidator),
});
export type Song = z.infer<typeof SongValidator>;

export const MusicalValidator = z.object({
  title: z.string(),
  songs: z.array(SongValidator),
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
