// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export type Musical = {
  title: string;
  songs: SongBase[];
};

export type SongBase = {
  no: string;
  title: string;
  tracks: SongTrack[];
};

export type SongTrack = {
  track: string;
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const jsonDirectory = path.join(process.cwd(), 'json');
  const fileContents = await fs.readFile(
    jsonDirectory + '/hunchback-of-notredame.json',
    'utf8'
  );

  res.status(200).json(fileContents);
}

async function asdf() {}
