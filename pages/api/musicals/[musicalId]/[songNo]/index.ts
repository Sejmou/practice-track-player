import { NextApiRequest, NextApiResponse } from 'next';
import { Song } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Song>
) {}
