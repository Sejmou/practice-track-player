import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';
import { YouTubeVideoData, YouTubeVideoDataValidator } from '@models';
import { extractTimestamps } from '@util';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubeVideoData> // TODO: research on how to type error response
) {
  try {
    const videoId = extractQueryParamAsString(req, 'videoId');
    const videoData = await fetchVideoMetaData(videoId);

    res.status(200).json(videoData);
  } catch (error) {
    console.warn('An error occurred while fetching the video metadata', error);
    res.status(404).end();
  }
}

export async function fetchVideoMetaData(videoId: string) {
  const resJson = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const parsedJson = await resJson.json();
  const videoData = YouTubeVideoDataValidator.parse({
    videoId: parsedJson.items[0].id,
    ...parsedJson.items[0].snippet,
  });
  return { ...videoData, timestamps: extractTimestamps(videoData.description) };
}
