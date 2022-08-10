import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { pipeline as callbackPipeline } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(callbackPipeline);

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

    // not sure if that makes sense for my use case
    // https://stackoverflow.com/a/54359569/13727176 (using axios instead of http here)
    // figure out 'real' target if the server returns a 302 (redirect)
    // const urlRes = await axios.get(url);
    // if (urlRes.status == 302) {
    //   url = urlRes.headers.location;
    // }

    const urlRes = await fetch(url);
    if (!urlRes.ok)
      throw new Error(`unexpected response: ${urlRes.statusText}`);
    const resBody = urlRes.body;
    if (resBody) {
      console.log(resBody);

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
