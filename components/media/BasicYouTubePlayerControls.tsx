import {
  YouTubePlayer,
  useYouTubePlayerControls,
} from '@frontend/hooks/media-playback/use-youtube-player-controls';
import BasicMediaControls from './BasicMediaControls';

type Props = {
  player: YouTubePlayer;
  onNext: () => void;
  onPrevious: () => void;
};
const BasicYouTubePlayerControls = ({ player, onNext, onPrevious }: Props) => {
  const controlsData = useYouTubePlayerControls({ player, onNext, onPrevious });

  return <BasicMediaControls {...controlsData} />;
};
export default BasicYouTubePlayerControls;
