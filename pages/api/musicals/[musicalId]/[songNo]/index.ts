import { NextApiRequest, NextApiResponse } from 'next';
import { MusicalSong } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MusicalSong>
) {}
