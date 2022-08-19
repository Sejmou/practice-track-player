import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import TrackList from '@components/Musical/TrackList';
import MusicalSongList from '@components/Musical/MusicalSongList';
import { getAllMusicalIds, getMusical } from '@backend/musical-data';
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
import MusicalSongPlayer from '@components/Musical/MusicalSongPlayer';
import DescriptionContainer from '@components/Musical/DescriptionContainer';

type Props = { musical: Musical };

const tracksAndSongsContainerStyles: SxProps = {
  display: 'grid',
  gridAutoColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: {
    xs: '"tl" "d" "sl"',
    md: '"d tl" "sl sl"',
  },
  gap: { md: '10px' },
};

const trackListStyles: SxProps = {
  gridArea: 'tl',
};

const songListStyles: SxProps = {
  gridArea: 'sl',
};

const descriptionContainerStyles: SxProps = {
  gridArea: 'd',
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
        <Stack direction="row" spacing={1}>
          <Button>
            <Link href="/musicals">Back to Overview</Link>
          </Button>
        </Stack>
      </Box>
      <Stack spacing={1}>
        <MusicalSongPlayer />
        <Box sx={tracksAndSongsContainerStyles}>
          <TrackList sx={trackListStyles} />
          <DescriptionContainer sx={descriptionContainerStyles} />
          <MusicalSongList sx={songListStyles} />
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
