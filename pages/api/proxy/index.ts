import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { pipeline } from 'stream/promises';

// this route proxies any incoming request to work around CORS issues
// currently, only streams of data are supported (e.g. audio files)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  let url = req.query.url;
  if (!(url && typeof url === 'string')) {
    res
      .status(400)
      .send('Please provide a URL (encoded, as "url" query parameter)');
    return;
  }
  try {
    console.log('fetching data from URL', url);

    const urlRes = await fetch(url, { highWaterMark: Math.pow(2, 16) });
    if (!urlRes.ok)
      throw new Error(`unexpected response: ${urlRes.statusText}`);
    const resBody = urlRes.body;
    if (resBody) {
      console.log('Proxy: Streaming data from response body');

      res.setHeader('Content-Type', urlRes.headers.get('Content-Type') || '');
      await pipeline(resBody, res);
    } else {
      res.status(400).send('Expected stream response, but got ');
    }
  } catch (error) {
    console.warn('An error occurred while fetching the data from', url, error);
    res.status(404).end();
  }
}
