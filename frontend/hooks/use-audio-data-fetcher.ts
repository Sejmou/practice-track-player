import useSWRImmutable from 'swr/immutable';
import { SourceData } from '@models';
import { useEffect, useState } from 'react';

// makes sure that we always get an error if the fetch request fails
const baseFetcher = async (url: string) => {
  const res = await fetch(url);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data. Status code: ' + res.status
    );
    // TODO: Attach extra info to the error object - not working like that because of TypeScript lol
    // error.info = await res.json()
    // error.status = res.status
    throw error;
  }
  return res;
};

const jsonFetcher = (url: string) => baseFetcher(url).then(data => data.json());

const binaryDataFetcher = (url: string) =>
  baseFetcher(url).then(data => data.arrayBuffer());

const audioBufferFetcher = (url: string, ctx: AudioContext) =>
  binaryDataFetcher(url).then(buffer => ctx.decodeAudioData(buffer));

export const useYouTubeAudioSrcDataFetcher = (videoId: string) => {
  return useSWRImmutable<SourceData, any>(
    '/api/yt-audio/audio-el-data/' + videoId,
    jsonFetcher,
    {
      shouldRetryOnError: false, // we must not spam the API, otherwise YouTube blocks the server!
    }
  );
};

export const useAudioBufferFetcher = (url: string) => {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const response = useSWRImmutable<AudioBuffer, any>(
    [url, audioContext],
    audioBufferFetcher
  );

  return response;
};

export const useBinaryWaveformDataFetcher = (url: string) => {
  return useSWRImmutable<ArrayBuffer, any>(url, binaryDataFetcher);
};

export const useServerWaveformDataFetcher = (fileId: string) => {
  return useBinaryWaveformDataFetcher('/api/server/waveform-data/' + fileId);
};
