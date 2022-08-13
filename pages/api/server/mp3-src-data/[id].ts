import { NextApiRequest, NextApiResponse } from 'next';
import {
  extractQueryParamAsString,
  findClientFilePath,
  InvalidQueryParamError,
  ServerFileNotFoundError,
} from '@backend';
import { SourceData } from '@models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SourceData> // TODO: research on how to type properly
) {
  try {
    const fileId = extractQueryParamAsString(req, 'id');
    const filePath = await findClientFilePath(fileId, 'mp3', 'mp3');
    res.status(200).json({ src: filePath, type: 'audio/mpeg' });
  } catch (error) {
    if (error instanceof ServerFileNotFoundError) {
      res.status(404).end();
    } else if (error instanceof InvalidQueryParamError) {
      res.status(403).end();
    } else {
      throw error;
    }
  }
}
