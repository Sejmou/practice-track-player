import { NextPage } from 'next';
import Head from 'next/head';
import { Typography, Link } from '@mui/material';

import { getAllMusicalBaseData } from '@backend';
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
      <Typography variant="h2">Musicals</Typography>

      <Typography>
        On this site, musical practice tracks from &nbsp;
        <Link
          target="_blank"
          href="https://www.musicalpracticetracks.com/index.php/"
        >
          musicalpracticetracks.com
        </Link>
        &nbsp; will be collected.
      </Typography>
      <Typography>For now, only a single musical is available:</Typography>
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
