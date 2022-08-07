import { SongBase } from '@models';

type Props = {
  song: SongBase;
};
const SongItem = ({ song }: Props) => {
  return (
    <li>
      {song.no}. {song.title}
    </li>
  );
};
export default SongItem;
