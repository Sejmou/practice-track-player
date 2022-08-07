import { SongBase } from '@models';

type Props = {
  song: SongBase;
};
const SongItem = ({ song }: Props) => {
  return (
    <div>
      {song.no}. {song.title}
    </div>
  );
};
export default SongItem;
