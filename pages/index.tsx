import MusicalsList from '@components/Musical/MusicalsList';
import type { NextPage } from 'next';
import Head from 'next/head';
import { getAllMusicalBaseData } from '@backend';
import { MusicalBaseData } from '@models';

type Props = { musicalsBaseData: MusicalBaseData[] };

const Home: NextPage<Props> = ({ musicalsBaseData }) => {
  return (
    <div>
      <Head>
        <title>Musical Practice Tracks Player</title>
        <meta
          name="description"
          content="A tool allowing you to play Musical Practice Tracks (several voices)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome!</h1>
        <p>
          On this page you will hopefully soon find practice tracks for several
          musicals (pulled from{' '}
          <a href="https://www.musicalpracticetracks.com/index.php/">
            musicalpracticetracks.com
          </a>
          ). But for now, only a single musical is online:
        </p>
        <MusicalsList musicalData={musicalsBaseData} />
      </main>
    </div>
  );
};

export default Home;

export async function getStaticProps() {
  const musicalsBaseData = await getAllMusicalBaseData();
  return {
    props: {
      musicalsBaseData,
    },
  };
}
