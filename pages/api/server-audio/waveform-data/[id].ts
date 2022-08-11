import { extractQueryParamAsString, findFile } from '@backend';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // TODO: research on how to type properly
) {
  try {
    const id = extractQueryParamAsString(req, 'id');
    const filePath = await findFile(id, 'waveform-data', 'dat');
    console.log(filePath);
    res.status(200).end();
  } catch (error) {
    console.warn('An error occurred while getting the data', error);
    res.status(404).end();
  }
}
