import path from 'path';
import { promises as fs, createReadStream, stat } from 'fs';

import { Musical, MusicalBaseData, MusicalValidator } from '@models';
import { NextApiRequest, NextApiResponse } from 'next';

const musicals = new Map<string, Musical>();
let musicalsInitialized = false;

// TODO: find smarter solution for pre-loading JSON files into memory than current Map approach
async function loadMusicals() {
  if (!musicalsInitialized) {
    const jsonDirectory = path.join(process.cwd(), 'backend/json');
    const folderContents = await fs.readdir(jsonDirectory, 'utf8');

    for (const file of folderContents) {
      if (!file.endsWith('.json')) {
        console.warn('skipping unexpected file:', file);
        continue;
      }
      try {
        const json = await fs.readFile(path.join(jsonDirectory, file), 'utf8');
        const parsedJson = JSON.parse(json);
        const musical = MusicalValidator.parse(parsedJson);
        const musicalPath = path.parse(file).name;
        musicals.set(musicalPath, musical);
      } catch (error) {
        console.error('Error while processing JSON:\n', error);
      }
    }

    musicalsInitialized = true;
  }
}

export async function getMusical(id: string) {
  await loadMusicals();
  return musicals.get(id);
}

export async function getAllMusicalIds() {
  await loadMusicals();
  return Array.from(musicals.keys());
}

export async function getAllMusicals() {
  await loadMusicals();
  return Array.from(musicals.entries());
}

export async function getAllMusicalBaseData(): Promise<MusicalBaseData[]> {
  await loadMusicals();
  const entries = Array.from(musicals.entries());
  return entries.map(([id, musical]) => ({
    id,
    title: musical.title,
  }));
}

export async function getSongData(musicalId: string, songNo: string) {
  await loadMusicals();
  const musical = musicals.get(musicalId);
  if (!musical) return;
  return musical.songs.find(song => song.no === songNo);
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
    console.warn('An error occurred while getting the data', error);
    res.status(404).end();
  }
}

export function extractQueryParamAsString(
  req: NextApiRequest,
  paramName: string
) {
  const paramValue = req.query[paramName];
  if (!paramValue) {
    throw Error(`No value for ${paramName} found!`);
  }
  if (typeof paramValue !== 'string') {
    throw Error(`Multiple values for ${paramName} provided!`);
  }
  return paramValue;
}

export async function findFile(
  name: string,
  folderName: string,
  fileExt: string
) {
  const dataFolderPath = `./public/${folderName}/`;
  const folderContent = await fs.readdir(dataFolderPath);
  const fileNames = folderContent
    .filter(file => {
      const ext = path.extname(file).slice(1); // path.extname() includes the '.'
      return ext === fileExt;
    })
    .map(file => path.parse(file).name);

  for (const f of fileNames) {
    const stat = await fs.stat(`${dataFolderPath}/${f}.${fileExt}`);
    console.log('file:', f, 'size:', stat.size);
    if (f === name) {
      return `${dataFolderPath}/${f}.${fileExt}`;
    }
  }

  throw Error(`No file called '${name}' found in '${dataFolderPath}'!`);
}
