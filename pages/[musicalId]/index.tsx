import type { NextPage } from 'next';
import Head from 'next/head';
import MusicalSummary from '@components/Musical/MusicalSummary';

const MusicalPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Musical name will come here</title>
        <meta name="description" content="description will come here" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome!</h1>
        <p>
          Here you will hopefully soon see an overview of the selected musical
          including a list of its songs
        </p>
        <MusicalSummary musicalId="hunchback-of-notredame" />
      </main>
    </div>
  );
};

export default MusicalPage;
