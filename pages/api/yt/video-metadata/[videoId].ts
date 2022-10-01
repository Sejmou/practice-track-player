import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';
import { YouTubeVideoData, YouTubeVideoDataValidator } from '@models';
import { extractTimeStamps } from '@util';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubeVideoData> // TODO: research on how to type error response
) {
  try {
    const videoId = extractQueryParamAsString(req, 'videoId');
    const resJson = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const parsedJson = await resJson.json();
    const videoData = YouTubeVideoDataValidator.parse({
      videoId: parsedJson.items[0].id,
      ...parsedJson.items[0].snippet,
    });

    res.status(200).json({
      ...videoData,
      timestamps: extractTimeStamps(videoData.description),
    });
  } catch (error) {
    console.warn('An error occurred while fetching the video metadata', error);
    res.status(404).end();
  }
}
