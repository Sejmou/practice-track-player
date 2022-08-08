import { Song, SourceData } from '@models';
import useSWRImmutable from 'swr/immutable';
import AudioControls from './AudioControls';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Props = { song: Song };

const SongPlayer = ({ song }: Props) => {
  const videoUrlSearch = new URL(song.tracks[0].url).search;
  const params = new URLSearchParams(videoUrlSearch);
  const videoId = params.get('v')!;
  console.log(videoId);
  const { data: audioData, error } = useSWRImmutable<SourceData, any>(
    '/api/yt-audio/' + videoId,
    fetcher
  );

  return (
    <div>
      <h2>
        Current Song: {song.no}. {song.title}
      </h2>
      {error && <p>Could not load audio :/</p>}
      {audioData && <AudioControls audioData={audioData} />}
    </div>
  );
};
export default SongPlayer;
