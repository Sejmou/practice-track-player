import { useEffect, useRef, useState } from 'react';

import { SourceData } from '@models';
import {
  KeyboardShortcuts,
  KeyboardShortcut,
} from '@frontend/keyboard-shortcuts';

const shortcuts = new KeyboardShortcuts();

type Props = { audioData: SourceData };
const AudioControls = ({ audioData }: Props) => {
  const audioElRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    shortcuts.set([
      new KeyboardShortcut({ code: 'Space' }, () => {
        setIsPlaying(previous => !previous);
      }),
    ]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioElRef.current?.play();
    } else {
      audioElRef.current?.pause();
    }
  }, [isPlaying]);

  const { src, type } = audioData;
  return (
    <audio
      ref={audioElRef}
      onKeyDownCapture={keyboardEvent => shortcuts.applyMatching(keyboardEvent)}
      controls
    >
      <source src={src} type={type} />
    </audio>
  );
};
export default AudioControls;
