import { NextApiRequest, NextApiResponse } from 'next';
import { handleLocalFileRequest } from '@backend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // TODO: research on how to type properly
) {
  return handleLocalFileRequest(req, res, 'mp3', 'mp3', 'audio/mpeg');
}
