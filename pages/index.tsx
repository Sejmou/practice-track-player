import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
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
        <p>Here you will hopefully see an awesome Web App soon.</p>
      </main>
    </div>
  );
};

export default Home;
