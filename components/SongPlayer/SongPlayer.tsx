import { Song } from '@models';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Props = { song: Song };

const SongPlayer = ({ song }: Props) => {
  const videoUrlSearch = new URL(song.tracks[0].url).search;
  const params = new URLSearchParams(videoUrlSearch);
  const videoId = params.get('v')!;
  console.log(videoId);
  const { data, error } = useSWR('/api/yt-audio/' + videoId, fetcher);

  return (
    <div>
      <h2>
        Current Track: {song.no}. {song.title}
      </h2>
      <p>Here you will hopefully soon see a Music Player for a song.</p>
      <audio src={data} />
    </div>
  );
};
export default SongPlayer;
