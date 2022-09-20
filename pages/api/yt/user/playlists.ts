import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

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

    // TODO: think about whether it is necessary at all for server to do the YouTube API requests for the clients
    console.log('client Google/YouTube API access token:', token.accessToken);

    res.status(200).send('Success');
  } catch (error) {
    console.warn('An error occurred while fetching the video metadata', error);
    res.status(404).end();
  }
}
