import { SongBase } from '@models';

type Props = {
  song: SongBase;
  onClick: (no: string) => void;
};
const SongItem = ({ song, onClick }: Props) => {
  return (
    <li onClick={() => onClick(song.no)}>
      {song.no}. {song.title}
    </li>
  );
};
export default SongItem;
