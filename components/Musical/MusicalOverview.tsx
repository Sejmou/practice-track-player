import { Musical } from '@models';
import SongItem from './SongItem';

type Props = {
  musical: Musical;
  onSongClick: (songNo: string) => void;
};
const MusicalOverview = ({ musical, onSongClick }: Props) => {
  return (
    <div>
      <h2>{musical.title}</h2>
      <span>Tracks:</span>
      <ul>
        {musical.songs.map((song: any) => (
          <SongItem song={song} key={song.no} onClick={onSongClick} />
        ))}
      </ul>
    </div>
  );
};

export default MusicalOverview;
