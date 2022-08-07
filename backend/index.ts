import path from 'path';
import { promises as fs } from 'fs';

import { Musical, MusicalBaseData, MusicalValidator } from '@models';

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
