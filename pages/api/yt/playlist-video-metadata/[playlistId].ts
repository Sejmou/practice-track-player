import { NextApiRequest, NextApiResponse } from 'next';
import { extractQueryParamAsString } from '@backend';
import {
  YouTubePlaylistVideoData,
  YouTubePlaylistDataValidator,
} from '@models';
import { getToken } from 'next-auth/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YouTubePlaylistVideoData[]> // TODO: research on how to type error response
) {
  try {
    const playlistId = extractQueryParamAsString(req, 'playlistId');
    const token = await getToken({ req });
    const googleApiToken = token?.accessToken;
    if (!!googleApiToken && !(typeof googleApiToken === 'string')) {
      res.status(400).end();
      console.error(
        'Invalid value provided for googleApiToken',
        googleApiToken
      );
      return;
    }

    const videoData = await fetchPlaylistVideoData(
      playlistId,
      undefined,
      googleApiToken
    );

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
  nextPageTokenVal?: string,
  authToken?: string
) {
  const reqUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&maxResults=50&key=${
    process.env.YOUTUBE_API_KEY
  }${nextPageTokenVal ? `&nextPageToken=${nextPageTokenVal}` : ''}`;
  const resJson = await fetch(
    reqUrl,
    authToken
      ? { headers: { Authorization: `Bearer ${authToken}` } }
      : undefined
  );
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
      ...(await fetchPlaylistVideoData(playlistId, nextPageToken, authToken))
    );
  }
  return videoData;
}
