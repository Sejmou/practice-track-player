import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';
import { YouTubeVideoData, YouTubePlaylistDataValidator } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubeVideoData[]> // TODO: research on how to type error response
) {
  try {
    const playlistId = extractQueryParamAsString(req, 'playlistId');
    const resJson = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const parsedJson = await resJson.json();
    const itemContent = parsedJson.items.map(
      ({ contentDetails, snippet }: any) => ({
        // those two props of each item should contain everything we need
        // validator will error out if something's missing
        ...contentDetails,
        ...snippet,
      })
    );
    const videos = YouTubePlaylistDataValidator.parse(itemContent);

    res.status(200).json(videos);
  } catch (error) {
    console.warn(
      'An error occurred while fetching the playlist video metadata',
      error
    );
    res.status(404).end();
  }
}
