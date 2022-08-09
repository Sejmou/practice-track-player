import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import { SourceData } from '@models';

// currently, this is only a API used for testing
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SourceData> // TODO: research on how to type error response
) {
  try {
    const mp3Path = './public/mp3/';
    const mp3Folder = await fs.readdir(mp3Path);
    const fileName = mp3Folder[0];

    if (fileName) {
      res.status(200).json({ src: `/mp3/${mp3Folder[0]}`, type: 'audio/mpeg' });
    } else throw Error(`No audio file found for ID '${req.query.fileId}'`);
  } catch (error) {
    console.warn('An error occurred while fetching the audio URL', error);
    res.status(404).end();
  }
}
