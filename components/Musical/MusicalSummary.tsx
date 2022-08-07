//useSWR allows the use of SWR (https://swr.vercel.app/) inside function components
// SWR makes fetching data easier (compared to fetch w/ useState and useEffect or similar "low-level" approaches)
// it also adds other useful stuff
import useSWR from 'swr';
import { useRouter } from 'next/router';

import { Musical } from '@models';
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
  const router = useRouter();

  const backToOverviewHandler = () => {
    router.push('/');
  };

  let content: JSX.Element = <div>Loading...</div>;

  //Handle the error state
  if (error) content = <div>Failed to load</div>;
  //Handle the loading state
  if (data) {
    content = (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2>{data.title}</h2>
          <div>
            <button onClick={backToOverviewHandler}>Back to overview</button>
          </div>
        </div>
        <span>Tracks:</span>
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
