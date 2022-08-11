import { createReadStream, promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // TODO: research on how to type properly
) {
  try {
    const videoId = req.query.videoId;
    if (!videoId) {
      throw Error('video ID missing!');
    }
    if (typeof videoId !== 'string') {
      throw Error('Multiple values provided for video ID!');
    }

    const waveformDataPath = './public/mp3/';
    const waveformFolder = await fs.readdir(waveformDataPath);
    const fileNames = waveformFolder.map(file => path.parse(file).name);

    let fileFound = false;

    for (const f of fileNames) {
      if (f === videoId) {
        const filePath = `${waveformDataPath}/${f}.mp3`;
        const stat = await fs.stat(filePath);
        const readStream = createReadStream(filePath);
        res
          .status(200)
          .setHeader('Content-Type', 'audio/mpeg')
          .setHeader('Content-Length', stat.size);

        readStream.pipe(res);
        fileFound = true;
      }
    }

    if (!fileFound)
      throw Error(`No waveform data found for video ID '${videoId}'`);
  } catch (error) {
    console.warn('An error occurred while fetching the audio URL', error);
    res.status(404).end();
  }
}
