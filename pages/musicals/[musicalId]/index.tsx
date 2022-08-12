import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import TrackList from '@components/Musical/TrackList';
import SongList from '@components/Musical/SongList';
import { getAllMusicalIds, getMusical } from '@backend';
import { Musical } from '@models';
import {
  Box,
  Button,
  Stack,
  SxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { MusicalProvider } from '@frontend/context/musical-context';
import SongPlayer from '@components/SongPlayer/SongPlayer';

type Props = { musical: Musical };

const tracksAndSongsContainerStyles: SxProps = {
  display: 'grid',
  gridAutoColumns: 'minmax(0, 1fr)',
  gridTemplateColumns: {
    xs: '1fr',
    sm: '1fr 1fr',
  },
  gap: { sm: '10px' },
};

const MusicalPage: NextPage<Props> = ({ musical }) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MusicalProvider musical={musical}>
      <Head>
        <title>{musical.title}</title>
        <meta name="description" content={musical.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ pb: 1 }}>
        <Typography variant={narrowViewport ? 'h6' : 'h4'}>
          {musical.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button>
            <Link href="/musicals">Back to Overview</Link>
          </Button>
        </Box>
      </Box>
      <Stack spacing={1}>
        <SongPlayer waveformDataStrategy="fetch pre-computed waveform data from server" />
        <Box sx={tracksAndSongsContainerStyles}>
          <TrackList />
          <SongList />
        </Box>
      </Stack>
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
