import { NextApiRequest, NextApiResponse } from 'next';
import { SongTrack } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SongTrack>
) {}
