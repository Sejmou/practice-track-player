import { extractQueryParamAsString, findFile } from '@backend';
import { NextApiRequest, NextApiResponse } from 'next';

// this endpoint is not used atm
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // TODO: research on how to type properly
) {
  try {
    const id = extractQueryParamAsString(req, 'id');
    const filePath = await findFile(id, 'waveform-data', 'dat');
    console.log(filePath);
    // TODO: figure out how to always send proper static file path for client
    res.status(404).end();
  } catch (error) {
    console.warn('An error occurred while getting the data', error);
    res.status(404).end();
  }
}
