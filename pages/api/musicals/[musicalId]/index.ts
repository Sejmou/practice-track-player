// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { Musical } from '@models';
import { getMusical } from '@backend/musical-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Musical> // TODO: research on how to type error response
) {
  // TODO: dynamic routes
  const musical = await getMusical('hunchback-of-notredame');
  if (!musical) {
    console.log('NO MUSICAL');
    res.status(404).end();
    return;
  }
  res.status(200).json(musical);
}
