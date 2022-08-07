//useSWR allows the use of SWR (https://swr.vercel.app/) inside function components
// SWR makes fetching data easier (compared to fetch w/ useState and useEffect or similar "low-level" approaches)
// it also adds other useful stuff
import { Musical } from '@models';
import useSWR from 'swr';
import SongItem from './SongItem';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type Props = {
  musicalId: string;
};
const MusicalSummary = ({ musicalId }: Props) => {
  // generics arguments: data response type and error response type
  const { data, error } = useSWR<Musical, any>(
    `/api/musicals/${musicalId}`,
    fetcher
  );
  let content: JSX.Element = <div>Loading...</div>;

  //Handle the error state
  if (error) content = <div>Failed to load</div>;
  //Handle the loading state
  if (data) {
    content = (
      <div>
        <h2>{data.title}</h2>
        <h3>Tracks:</h3>
        <ul>
          {data.songs.map((song: any) => (
            <SongItem song={song} key={song.no} />
          ))}
        </ul>
      </div>
    );
  }
  return content;
};
export default MusicalSummary;
