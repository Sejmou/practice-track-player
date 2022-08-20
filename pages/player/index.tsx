import Head from 'next/head';
import { NextPage } from 'next/types';
import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { Button, Stack, SxProps } from '@mui/material';
import { Box } from '@mui/material';
import AudioPlayer from '@components/AudioPlayer/AudioPlayer';
import { Song, SourceData } from '@models';
import * as mmb from 'music-metadata-browser';
import SongList from '@components/SongList/SongList';

type Props = {};

const containerStyles: SxProps = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

type SongData = {
  song: Song;
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

  const nextSongHandler = useCallback(() => {
    setCurrSongIdx(prev => Math.min(prev + 1, songData.length - 1));
  }, [songData]);

  const previousSongHandler = useCallback(() => {
    setCurrSongIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    async ev => {
      if (!audioContext) return;
      const fileList = ev.target.files;
      if (fileList) {
        const files = Array.from(fileList);

        async function processFile(
          file: File,
          audioContext: AudioContext
        ): Promise<SongData> {
          const metadata = (await mmb.parseBlob(file)).common;
          const audioBuffer = await file
            .arrayBuffer()
            .then(b => audioContext.decodeAudioData(b));
          return {
            song: {
              title: metadata.title || file.name,
              album: metadata.album,
              artist: metadata.artist || 'Unknown Artist',
            },
            sourceData: {
              src: URL.createObjectURL(file),
              type: file.type,
            },
            audioBuffer,
          };
        }

        const songData = await Promise.all(
          files.map(f => processFile(f, audioContext))
        );

        console.log(songData);

        setSongData(songData);
      }
    },
    [audioContext]
  );

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
          <Button sx={{ m: 'auto' }} component="label">
            Select file(s) from your device
            <input
              hidden
              accept="audio/mpeg, audio/aac, audio/mp4, audio/ogg, audio/opus, audio/wav, audio/webm, audio/3gp, audio/3g2"
              type="file"
              multiple
              onChange={fileChangeHandler}
            />
          </Button>
        ) : (
          <Stack spacing={2}>
            <AudioPlayer
              mainTitle={songData[currSongIdx].song.title}
              subTitle={songData[currSongIdx].song.artist}
              audioElSrcData={songData[currSongIdx].sourceData}
              audioContext={audioContext}
              nextDisabled={currSongIdx === songData.length - 1}
              onNext={nextSongHandler}
              onPrevious={previousSongHandler}
            />
            {songData.length > 1 && (
              <SongList
                songs={songData.map(d => d.song)}
                currentSong={songData[currSongIdx].song}
                handleSongChange={song =>
                  setCurrSongIdx(songData.findIndex(d => d.song === song))
                }
              />
            )}
            <Stack direction="row">
              <Button sx={{ m: 'auto' }} component="label">
                Pick other file(s)
                <input
                  hidden
                  accept="audio/mpeg, audio/aac, audio/mp4, audio/ogg, audio/opus, audio/wav, audio/webm, audio/3gp, audio/3g2"
                  type="file"
                  multiple
                  onChange={fileChangeHandler}
                />
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </>
  );
};
export default Player;
