import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import TrackList from '@components/Musical/TrackList';
import SongList from '@components/Musical/SongList';
import { getAllMusicalIds, getMusical } from '@backend';
import { Musical } from '@models';
import { Box, Button } from '@mui/material';
import Link from 'next/link';
import { MusicalProvider } from '@frontend/context/musical-context';
import SongPlayer from '@components/SongPlayer/SongPlayer';

type Props = { musical: Musical };

const MusicalPage: NextPage<Props> = ({ musical }) => {
  return (
    <MusicalProvider musical={musical}>
      <Head>
        <title>{musical.title}</title>
        <meta name="description" content={musical.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>{musical.title}</h1>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button>
            <Link href="/">Back to Home</Link>
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
        }}
      >
        <SongPlayer waveformDataStrategy="fetch from own server" />
        <Box
          sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
        >
          <TrackList />
          <SongList />
        </Box>
      </Box>
    </MusicalProvider>
  );
};

export default MusicalPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const musicalIds = await getAllMusicalIds();

  const musicalPaths = musicalIds.map((id: string) => ({
    params: { musicalId: id },
  }));

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
