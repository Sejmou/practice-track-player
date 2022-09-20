import useSWRImmutable from 'swr/immutable';
import { SourceData } from '@models';
import { useEffect, useState } from 'react';
import { baseFetcher, jsonFetcher } from '@frontend/util/data-fetchers';

const binaryDataFetcher = (url: string) =>
  baseFetcher(url).then(data => data.arrayBuffer());

const audioBufferFetcher = (url: string, ctx: AudioContext) =>
  binaryDataFetcher(url).then(buffer => ctx.decodeAudioData(buffer));

export const useYouTubeAudioSrcDataFetcher = (videoId: string | null) => {
  return useSWRImmutable<SourceData, any>(
    videoId ? '/api/yt/audio-el-data/' + videoId : null,
    async (url: string) => {
      const webMSupport =
        new Audio().canPlayType('audio/webm; codecs="opus"') === 'probably';

      console.log(webMSupport);
      const reqUrl = url + (!webMSupport ? '?noWebM=true' : '');
      console.log(reqUrl);
      return jsonFetcher(reqUrl);
    },
    {
      shouldRetryOnError: false, // we must not spam the API, otherwise YouTube blocks the server!
    }
  );
};

export const useYouTubeDescriptionFetcher = (videoId: string) => {
  return useSWRImmutable<string, any>(
    '/api/yt/description/' + videoId,
    jsonFetcher,
    {
      shouldRetryOnError: false, // we must not spam the API, otherwise YouTube blocks the server!
    }
  );
};

export const useServerAudioSrcDataFetcher = (fileId: string) => {
  return useSWRImmutable<SourceData, any>(
    '/api/server/mp3-src-data/' + fileId,
    jsonFetcher
  );
};

export const useGoogleDriveAudioSrcDataFetcher = (fileId: string) => {
  return useSWRImmutable<SourceData, any>(
    '/api/google-drive/mp3-src-data/' + fileId,
    jsonFetcher
  );
};

export const useAudioBufferFetcher = (url: string | null) => {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  console.log('here');

  const response = useSWRImmutable<AudioBuffer, any>(
    url ? [url, audioContext] : null,
    audioBufferFetcher
  );

  return response;
};

export const useProxyAudioBufferFetcher = (url: string | null) => {
  const proxyUrl = url ? '/api/proxy?url=' + encodeURIComponent(url) : null;
  return useAudioBufferFetcher(proxyUrl);
};

export const useBinaryWaveformDataFetcher = (url: string) => {
  return useSWRImmutable<ArrayBuffer, any>(url, binaryDataFetcher);
};

export const useServerWaveformDataFetcher = (fileId: string) => {
  return useBinaryWaveformDataFetcher('/api/server/waveform-data/' + fileId);
};
