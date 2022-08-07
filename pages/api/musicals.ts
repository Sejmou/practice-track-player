// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// apparently, such types are unnecessary?
// export interface Musical {
//   title: string;
//   songs: Song[];
// }

// export interface SongBase {
//   no: string;
//   title: string;
// }

// export interface Song extends SongBase {
//   tracks: SongTrack[];
// }

// export interface SongTrack {
//   track: string;
//   url: string;
// }

// can just use zod instead, like this:
const SongTrack = z.object({
  track: z.string(),
  url: z.string().url().startsWith('https://www.youtube.com/watch?v='),
});
type SongTrack = z.infer<typeof SongTrack>;

const SongBase = z.object({
  no: z.string(),
  title: z.string(),
});
type SongBase = z.infer<typeof SongBase>;

const Song = SongBase.extend({
  tracks: z.array(SongTrack),
});
type Song = z.infer<typeof Song>;

const Musical = z.object({
  title: z.string(),
  songs: z.array(Song),
});
type Musical = z.infer<typeof Musical>;

const musicals = new Map<string, Musical>();
let musicalsInitialized = false;

async function intializeMusicals() {
  const jsonDirectory = path.join(process.cwd(), 'backend/json');
  const folderContents = await fs.readdir(jsonDirectory, 'utf8');

  for (const file of folderContents) {
    if (!file.endsWith('.json')) {
      console.warn('skipping unexpected file:', file);
      continue;
    }
    try {
      const json = await fs.readFile(path.join(jsonDirectory, file), 'utf8');
      const parsedJson = JSON.parse(json);
      const musical = Musical.parse(parsedJson);
      const musicalPath = path.parse(file).name;
      musicals.set(musicalPath, musical);
    } catch (error) {
      console.error('Error while processing JSON:\n', error);
    }
  }

  musicalsInitialized = true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Musical>
) {
  if (!musicalsInitialized) {
    await intializeMusicals();
  }
  // TODO: dynamic routes
  const musical = musicals.get('hunchback-of-notredame');
  if (!musical) {
    res.status(404);
    return;
  }
  res.status(200).json(musical);
}

async function asdf() {}
