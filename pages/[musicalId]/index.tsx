import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import MusicalOverview from '@components/Musical/MusicalOverview';
import SongPlayer from '@components/SongPlayer/SongPlayer';
import { getAllMusicalIds, getMusical } from '@backend';
import { Musical } from '@models';

type Props = { musical: Musical };

const MusicalPage: NextPage<Props> = ({ musical }) => {
  const [currentSong, setCurrentSong] = useState(musical.songs[0]);

  const songClickHandler = (songNo: string) => {};

  return (
    <>
      <Head>
        <title>{musical.title}</title>
        <meta name="description" content={musical.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <MusicalOverview musical={musical} onSongClick={songClickHandler} />
        <SongPlayer song={currentSong} />
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
