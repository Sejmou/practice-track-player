import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchAudioFromYouTube } from '@backend/audio-from-yt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<object> // TODO: research on how to type error response
) {
  const videoId = req.query.videoId as string;
  console.log('vid ID', videoId);
  try {
    fetchAudioFromYouTube(videoId);
  } catch (error) {
    res.status(400).end();
  }
  res.status(200).json({ message: 'success' });
}
