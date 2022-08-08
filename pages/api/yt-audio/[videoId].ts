import { SourceData } from '@models';
import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SourceData> // TODO: research on how to type error response
) {
  const videoId = req.query.videoId as string;
  console.log('fetching audio stream URL for video ID', videoId);
  try {
    const info = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });
    const { mimeType, url } = format;
    console.log(
      `found audio stream URL for video ID '${videoId}'`,
      mimeType,
      url
    );
    res.status(200).json({ src: url, type: mimeType || '' });
  } catch (error) {
    res.status(400).end();
  }
}
