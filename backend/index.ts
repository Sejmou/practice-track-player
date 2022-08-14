import path from 'path';
import { promises as fs, createReadStream } from 'fs';

import { NextApiRequest, NextApiResponse } from 'next';
import { getSubstringAfterFirstSubstringOccurence } from '@util';

export class BaseError extends Error {
  message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
    console.log(this.stack);
  }
}

export class ServerFileNotFoundError extends BaseError {
  constructor(fileName: string, folderName: string) {
    super(`File '${fileName}' not found in '${folderName}'!`);
  }
}

export class ResourceNotFoundError extends BaseError {
  constructor(id: string) {
    super(`No resource with id '${id}' found!`);
  }
}

export class InvalidQueryParamError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export async function handleLocalFileRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  folderName: string,
  fileExt: string,
  mimeType: string,
  paramName: string = 'id'
) {
  try {
    const id = extractQueryParamAsString(req, paramName);
    const filePath = await findFile(id, folderName, fileExt);
    const stat = await fs.stat(filePath);
    const readStream = createReadStream(filePath);
    res
      .status(200)
      .setHeader('Content-Type', mimeType)
      .setHeader('Content-Length', stat.size);

    readStream.pipe(res);
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

/**
 * Finds the local (== server-internal) path to a file
 *
 * @param name
 * @param folderName
 * @param fileExt
 * @returns
 */
export async function findFile(
  name: string,
  folderName: string,
  fileExt: string
) {
  const dataFolderPath = path.join(process.cwd(), `./public/${folderName}`);
  const folderContent = await fs.readdir(dataFolderPath);
  const fileNames = folderContent
    .filter(file => {
      const ext = path.extname(file).slice(1); // path.extname() includes the '.'
      return ext === fileExt;
    })
    .map(file => path.parse(file).name);

  for (const f of fileNames) {
    if (f === name) {
      return `${dataFolderPath}/${f}.${fileExt}`;
    }
  }

  throw new ServerFileNotFoundError(name, folderName);
}

/**
 * Searches for a file in a provided subfolder of the server's public folder and
 * returns its public URL (can be used by clients)
 *
 * @param name
 * @param folderName
 * @param fileExt
 * @returns
 */
export async function findClientFilePath(
  name: string,
  folderName: string,
  fileExt: string
) {
  const serverFilePath = await findFile(name, folderName, fileExt);
  // all files (and subfolders + their files) from public folder are available publicly
  // -> send this public URL to client
  const publicPath = getSubstringAfterFirstSubstringOccurence(
    serverFilePath,
    '/public'
  );
  return publicPath;
}

// used for testing purposes to emulate slow API response: https://stackoverflow.com/a/39914235/13727176
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractQueryParamAsString(
  req: NextApiRequest,
  paramName: string
) {
  const paramValue = req.query[paramName];
  if (!paramValue) {
    throw new InvalidQueryParamError(`No value for ${paramName} found!`);
  }
  if (typeof paramValue !== 'string') {
    throw new InvalidQueryParamError(
      `Multiple values for ${paramName} provided!`
    );
  }
  return paramValue;
}
