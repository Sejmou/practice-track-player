import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string> // TODO: research on how to type error response
) {
  try {
    const videoId = extractQueryParamAsString(req, 'videoId');
    const resJson = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const parsedJson = await resJson.json();
    const description = parsedJson.items[0].snippet.description;

    res.status(200).json(description);
  } catch (error) {
    console.warn(
      'An error occurred while fetching the video description',
      error
    );
    res.status(404).end();
  }
}
