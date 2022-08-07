import type { NextPage } from 'next';
import Head from 'next/head';
import MusicalSummary from '@components/Musical/MusicalSummary';

const MusicalPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Musical name will come here</title>
        <meta name="description" content="description will come here" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MusicalSummary musicalId="hunchback-of-notredame" />
    </>
  );
};

export default MusicalPage;
