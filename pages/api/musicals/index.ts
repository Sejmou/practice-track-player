import { NextApiRequest, NextApiResponse } from 'next';
import { MusicalBaseData } from '@models';
import { getAllMusicalBaseData } from '@backend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MusicalBaseData[]>
) {
  const musicalsBaseData = await getAllMusicalBaseData();
  res.status(200).json(musicalsBaseData);
}
