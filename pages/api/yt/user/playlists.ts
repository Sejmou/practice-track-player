import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

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

    google.options({ auth: googleApiToken });

    const response = await youtube.playlists.list({
      access_token: googleApiToken,
      mine: true,
      part: ['snippet'],
      maxResults: 50, // TODO: handle users with more than 50 playlists
    });

    console.log(response.data);

    if (response.status === 200) {
      res
        .status(200)
        .send(response.data.items?.map(i => ({ id: i.id, ...i.snippet })));
    } else {
      res.status(500).end();
    }

    // const response = await fetch(
    //   `https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&key=${youTubeApiKey}`,
    //   { headers: { Authorization: `Bearer ${googleApiToken}` } }
    // );
    // const data = await response.json();
    // console.log(data);
    // if (response.ok) {
    //   res.status(200).send(data);
    // } else {
    //   res.status(500).end();
    // }
  } catch (error) {
    console.warn(
      "An error occurred while fetching the user's playlists",
      error
    );
    res.status(404).end();
  }
}
