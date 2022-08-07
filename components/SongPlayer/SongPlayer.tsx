import { Song } from '@models';

type Props = { song: Song };
const SongPlayer = ({ song }: Props) => {
  return (
    <div>
      <h2>
        Current Track: {song.no}. {song.title}
      </h2>
      <p>Here you will hopefully soon see a Music Player for a song.</p>
      <audio />
    </div>
  );
};
export default SongPlayer;
