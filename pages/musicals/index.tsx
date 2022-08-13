import { NextPage } from 'next';
import Head from 'next/head';
import { Typography, Link, Box } from '@mui/material';

import { getAllMusicalBaseData } from '@backend/musical-data';
import { MusicalBaseData } from '@models';
import MusicalsList from '@components/Musical/MusicalsList';

type Props = { musicalsBaseData: MusicalBaseData[] };

const Musicals: NextPage<Props> = ({ musicalsBaseData }) => {
  return (
    <>
      <Head>
        <title>Practice Tracks Player</title>
        <meta
          name="description"
          content="An overview of all the musicals for which practice tracks are available"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h2">Musicals</Typography>
        <Typography>
          This is a list of musical practice tracks from &nbsp;
          <Link
            target="_blank"
            href="https://www.musicalpracticetracks.com/index.php/"
          >
            musicalpracticetracks.com
          </Link>
          .
        </Typography>
        <Typography>
          Select any musical and play every song and all the practice tracks for
          it in a web-based audio player 👌
        </Typography>
        {musicalsBaseData.length == 1 && (
          <Typography>For now, only a single musical is available:</Typography>
        )}
      </Box>
      <MusicalsList musicalData={musicalsBaseData} />
    </>
  );
};

export default Musicals;

export async function getStaticProps() {
  const musicalsBaseData = await getAllMusicalBaseData();
  return {
    props: {
      musicalsBaseData,
    },
  };
}
