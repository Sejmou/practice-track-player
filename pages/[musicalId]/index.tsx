import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import SongList from '@components/Musical/SongList';
import SongPlayer from '@components/SongPlayer/SongPlayer';
import { getAllMusicalIds, getMusical } from '@backend';
import { Musical } from '@models';

type Props = { musical: Musical };

const MusicalPage: NextPage<Props> = ({ musical }) => {
  const [currentSong, setCurrentSong] = useState(musical.songs[0]);

  const songClickHandler = (songNo: string) => {
    setCurrentSong(() => musical.songs.find(song => song.no === songNo)!);
  };

  return (
    <>
      <Head>
        <title>{musical.title}</title>
        <meta name="description" content={musical.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>{musical.title}</h1>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
        }}
      >
        <SongPlayer song={currentSong} />
        <SongList songs={musical.songs} onSongChange={songClickHandler} />
      </div>
    </>
  );
};

export default MusicalPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const musicalIds = await getAllMusicalIds();

  const musicalPaths = musicalIds.map(id => ({ params: { musicalId: id } }));

  return {
    fallback: false,
    paths: musicalPaths,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const musicalId = context.params!.musicalId! as string; // TODO: figure out smarter way to get this
  const musical = await getMusical(musicalId);

  return {
    props: {
      musical,
    },
  };
};
