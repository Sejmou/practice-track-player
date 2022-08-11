import type { NextPage } from 'next';
import Head from 'next/head';
import { MusicalBaseData } from '@models';
import {
  Typography,
  Link,
  Card,
  CardContent,
  Button,
  CardActions,
} from '@mui/material';
import InternalLink from 'next/link';

type Props = { musicalsBaseData: MusicalBaseData[] };

const Home: NextPage<Props> = ({ musicalsBaseData }) => {
  return (
    <>
      <Head>
        <title>Practice Tracks Player</title>
        <meta
          name="description"
          content="A browser-based player for Music(al) practice tracks"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Typography variant="h1">Welcome!</Typography>
      <Card>
        <CardContent>
          <Typography variant="h5">Musicals</Typography>
          <Typography>
            Play practice tracks for musicals created by the kind folks at
            &nbsp;
            <Link
              target="_blank"
              href="https://www.musicalpracticetracks.com/index.php/"
            >
              musicalpracticetracks.com
            </Link>
            &nbsp;:)
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">
            <InternalLink href="/musicals">Take me there!</InternalLink>
          </Button>
        </CardActions>
      </Card>
    </>
  );
};

export default Home;
