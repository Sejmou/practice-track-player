import type { NextPage } from 'next';
import Head from 'next/head';

const SongPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Player will come here</title>
        <meta name="description" content="description will come here" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome!</h1>
        <p>Here you will hopefully soon see a Music Player for a song</p>
        <audio />
      </main>
    </div>
  );
};

export default SongPage;
