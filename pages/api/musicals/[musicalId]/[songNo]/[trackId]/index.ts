import { NextApiRequest, NextApiResponse } from 'next';
import { MusicalSongTrack } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MusicalSongTrack>
) {}
