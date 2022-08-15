import Head from 'next/head';
import { NextPage } from 'next/types';
import { useCallback, useEffect, useState } from 'react';
import { Button, SxProps } from '@mui/material';
import { Box } from '@mui/material';
import SongPlayer from '@components/SongPlayer/SongPlayer';
import { Song, SourceData } from '@models';

type Props = {};

const containerStyles: SxProps = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  top: 0,
  left: 0,
  // minHeight: {
  //   xs: 473,
  //   md: 517,
  // },
};

type SongData = {
  song: Song;
  file: File;
  sourceData: SourceData;
  audioBuffer: AudioBuffer;
};

const Player: NextPage = (props: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const [songData, setSongData] = useState<SongData[]>([]);
  const [currSongIdx, setCurrSongIdx] = useState(0);
  const [nextAvailable, setNextAvailable] = useState(false);

  useEffect(() => {
    setNextAvailable(currSongIdx < songData.length - 1);
  }, [currSongIdx, songData.length]);

  const nextSongHandler = useCallback(() => {
    setCurrSongIdx(prev => Math.min(prev + 1, songData.length - 1));
  }, [songData]);

  const previousSongHandler = useCallback(() => {
    setCurrSongIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const requestFileAccess = useCallback(async () => {
    if (!audioContext) return;
    const fileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Audio Files',
          accept: {
            'audio/*': ['.mp3', '.ogg'],
          },
        },
      ],
    });
    console.log(fileHandles);
    for (const fileName in fileHandles.entries()) {
      console.log(fileName);
    }
    const files = await Promise.all(fileHandles.map(fh => fh.getFile()));
    const fileAudioBuffers = await Promise.all(
      files.map(f => f.arrayBuffer().then(b => audioContext.decodeAudioData(b)))
    );

    setSongData(
      files.map((f, i) => ({
        file: f,
        song: {
          title: f.name,
          no: (i + 1).toString(),
        },
        sourceData: {
          src: URL.createObjectURL(f),
          type: f.type,
        },
        audioBuffer: fileAudioBuffers[i],
      }))
    );
  }, [audioContext]);

  return (
    <>
      <Head>
        <title>Custom Track Player</title>
        <meta
          name="description"
          content="Play your own tracks, right in your browser!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={containerStyles}>
        {songData.length === 0 ? (
          <Button onClick={requestFileAccess}>
            Select file(s) from local folder
          </Button>
        ) : (
          <SongPlayer
            song={songData[currSongIdx].song}
            audioElSrcData={songData[currSongIdx].sourceData}
            audioBuffer={songData[currSongIdx].audioBuffer}
            onNextSong={nextSongHandler}
            onPreviousSong={previousSongHandler}
            nextSongAvailable={nextAvailable}
          />
        )}
      </Box>
    </>
  );
};
export default Player;
