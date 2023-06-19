import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { google, youtube_v3 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

const youtube = google.youtube('v3');

const youTubeApiKey = process.env.YOUTUBE_API_KEY;
if (!youTubeApiKey) {
  throw Error('YOUTUBE_API_KEY not found in .env!');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      res.status(400).end();
      return;
    }

    const googleApiToken = token.accessToken;
    console.log('client Google/YouTube API access token:', googleApiToken);
    if (!googleApiToken || !(typeof googleApiToken === 'string')) {
      res.status(400).end();
      return;
    }

    res.send(await fetchUserPlaylists(googleApiToken));
  } catch (error) {
    console.warn(
      "An error occurred while fetching the user's playlists",
      error
    );
    res.status(500).end();
  }
}

async function fetchUserPlaylists(
  apiToken: string,
  previouslyFetched: PlaylistItems = [],
  pageToken?: string
): Promise<PlaylistItems> {
  const response = await youtube.playlists.list({
    access_token: apiToken,
    mine: true,
    part: ['snippet'],
    maxResults: 50,
    pageToken,
  });
  if (!(response.status === 200)) {
    throw Error(
      'An error occurred while fetching user playlist items' +
        (pageToken ? ' with page token' + pageToken : '')
    );
  }
  const pagePlaylists = processApiPlaylistResponse(response);
  previouslyFetched.push(...pagePlaylists);

  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken)
    return fetchUserPlaylists(apiToken, previouslyFetched, nextPageToken);
  else return previouslyFetched;
}

export type PlaylistItems = ReturnType<typeof processApiPlaylistResponse>;

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type PlaylistItem = ArrElement<PlaylistItems>;

function processApiPlaylistResponse(
  response: GaxiosResponse<youtube_v3.Schema$PlaylistListResponse>
) {
  return response.data.items?.map(i => ({ id: i.id, ...i.snippet })) || [];
}
