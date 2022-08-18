import {
  extractQueryParamAsBoolean,
  extractQueryParamAsString,
} from '@backend';
import { SourceData } from '@models';
import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SourceData> // TODO: research on how to type error response
) {
  const videoId = extractQueryParamAsString(req, 'videoId');
  const noWebM = extractQueryParamAsBoolean(req, 'noWebM', false);
  console.log(
    'fetching audio stream URL for video ID',
    videoId,
    noWebM ? '(no webm support)' : ''
  );
  try {
    const info = await ytdl.getInfo(videoId);
    const availableAudioFormats = info.formats.filter(
      f =>
        f.mimeType?.startsWith('audio') &&
        (!noWebM || !f.mimeType?.includes('webm'))
    );
    const selectedFormat = availableAudioFormats.reduce(
      (p, c) => (p.itag < c.itag ? c : p) // bigger itag isn't necessarily better quality, but I don't care at this point
    );
    const { mimeType, url } = selectedFormat;
    console.log(
      `found audio stream URL for video ID '${videoId}'`,
      mimeType,
      url
    );
    res.status(200).json({ src: url, type: mimeType || '' });
  } catch (error) {
    console.warn('An error occurred while fetching the audio stream', error);
    res.status(404).end();
  }
}
