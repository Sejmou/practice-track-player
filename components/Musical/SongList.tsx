import { Song } from '@models';
import SongItem from './SongItem';

type Props = {
  songs: Song[];
  onSongChange: (songNo: string) => void;
};
const SongList = ({ songs, onSongChange }: Props) => {
  return (
    <div>
      <h2>Songs:</h2>
      <ul>
        {songs.map((song: any) => (
          <SongItem song={song} key={song.no} onClick={onSongChange} />
        ))}
      </ul>
    </div>
  );
};

export default SongList;
