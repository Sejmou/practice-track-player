import { SourceData } from '@models';

type Props = { audioData: SourceData };
const AudioControls = ({ audioData }: Props) => {
  const { src, type } = audioData;
  return (
    <audio controls>
      <source src={src} type={type} />
    </audio>
  );
};
export default AudioControls;
