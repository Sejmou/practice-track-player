import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

import TrackList from '@frontend/musical/TrackList';
import MusicalSongList from '@frontend/musical/MusicalSongList';
import { getMusical } from '@backend/musical-data';
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
import { MusicalProvider } from '@frontend/musical/musical-context';
import MusicalSongPlayer from '@frontend/musical/MusicalSongPlayer';
import DescriptionContainer from '@frontend/musical/DescriptionContainer';
import TrackFilter from '@frontend/musical/TrackFilter';

type Props = {
  musical: Musical;
  queryParamSongIdx: number | null; // can't use undefined instead of null as this is computed on server and undefined cannot be serialized to JSON
  queryParamTrackIdx: number | null;
  queryParamFilters: string[] | null;
};

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

const MusicalPage: NextPage<Props> = ({
  musical,
  queryParamSongIdx,
  queryParamTrackIdx,
  queryParamFilters,
}) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MusicalProvider
      musical={musical}
      initialSongIdx={queryParamSongIdx ?? 0}
      initialTrackIdx={queryParamTrackIdx ?? 0}
      initialFilters={queryParamFilters ?? []}
    >
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
        <TrackFilter />
        <MusicalSongPlayer />
        <Box sx={tracksAndSongsContainerStyles}>
          <TrackList
            sx={trackListStyles}
            contentWrapperSxWide={{ maxHeight: { md: 200 } }}
          />
          <DescriptionContainer
            sx={descriptionContainerStyles}
            contentWrapperSxWide={{ maxHeight: { md: 200 } }}
          />
          <MusicalSongList sx={songListStyles} />
        </Box>
      </Stack>
    </MusicalProvider>
  );
};

export default MusicalPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { musicalId, songIdx, trackIdx, filters } = query;
  if (typeof musicalId !== 'string') return { notFound: true };
  const musical = await getMusical(musicalId);
  if (!musical) return { notFound: true };

  let queryParamSongIdx: number | null = null;
  let queryParamTrackIdx: number | null = null;
  let queryParamFilters: string[] | null = null;

  if (typeof songIdx === 'string' && !isNaN(+songIdx)) {
    queryParamSongIdx = +songIdx;
  }
  if (typeof trackIdx === 'string' && !isNaN(+trackIdx)) {
    queryParamTrackIdx = +trackIdx;
  }

  if (typeof filters === 'string') {
    queryParamFilters = decodeURIComponent(filters).split(',');
  }

  return {
    props: {
      musical,
      queryParamSongIdx,
      queryParamTrackIdx,
      queryParamFilters,
    },
  };
};
