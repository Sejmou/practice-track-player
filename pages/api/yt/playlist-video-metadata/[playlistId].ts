import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';
import {
  YouTubePlaylistVideoData,
  YouTubePlaylistDataValidator,
} from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubePlaylistVideoData[]> // TODO: research on how to type error response
) {
  try {
    const playlistId = extractQueryParamAsString(req, 'playlistId');
    const videoData = await fetchPlaylistVideoData(playlistId);

    res.status(200).json(videoData);
  } catch (error) {
    console.warn(
      'An error occurred while fetching the playlist video metadata',
      error
    );
    res.status(404).end();
  }
}

async function fetchPlaylistVideoData(
  playlistId: string,
  nextPageTokenVal?: string
) {
  const reqUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&maxResults=50&key=${
    process.env.YOUTUBE_API_KEY
  }${nextPageTokenVal ? `&nextPageToken=${nextPageTokenVal}` : ''}`;
  const resJson = await fetch(reqUrl);
  const parsedJson = await resJson.json();
  const { nextPageToken } = parsedJson;
  const itemContent = parsedJson.items.map(
    ({ contentDetails, snippet }: any) => ({
      // those two props of each item should contain everything we need
      // validator will error out if something's missing
      ...contentDetails,
      ...snippet,
    })
  );
  const filteredContent = itemContent.filter(
    (i: any) => i.title !== 'Deleted video'
  );
  const videoData = YouTubePlaylistDataValidator.parse(filteredContent);
  if (nextPageToken) {
    videoData.push(
      ...(await fetchPlaylistVideoData(playlistId, nextPageToken))
    );
  }
  return videoData;
}
