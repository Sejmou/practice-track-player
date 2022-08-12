import { NextApiRequest, NextApiResponse } from 'next';
import { handleLocalFileRequest } from '@backend';

// this endpoint is not used atm
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse // TODO: research on how to type properly
) {
  return handleLocalFileRequest(
    req,
    res,
    'waveform-data',
    'dat',
    'application/octet-stream'
  );
}
