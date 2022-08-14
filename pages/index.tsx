import type { NextPage } from 'next';
import Head from 'next/head';
import InternalLink from 'next/link';
import {
  Typography,
  Link,
  Card,
  CardContent,
  Button,
  CardActions,
  Box,
  SxProps,
} from '@mui/material';

const cardContainerStyles: SxProps = {
  display: 'grid',
  gridAutoColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: {
    xs: '"1fr" "1fr"',
    md: '"1fr 1fr"',
  },
  gap: 1,
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Practice Track Player</title>
        <meta
          name="description"
          content="A browser-based player for Music(al) practice tracks"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Typography variant="h2">Welcome!</Typography>
      <Box sx={cardContainerStyles}>
        <Card>
          <CardContent>
            <Typography variant="h5">Musicals</Typography>
            <Typography>
              Play musical practice tracks created by the kind folks at &nbsp;
              <Link
                target="_blank"
                href="https://www.musicalpracticetracks.com/index.php/"
              >
                musicalpracticetracks.com
              </Link>
              &nbsp; in an audio player, directly in your browser :)
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">
              <InternalLink href="/musicals">Take me there!</InternalLink>
            </Button>
          </CardActions>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5">Audio Player</Typography>
            <Typography>
              Play your own audio files, directly in your browser :)
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">
              <InternalLink href="/player">Try it out now!</InternalLink>
            </Button>
          </CardActions>
        </Card>
      </Box>
    </>
  );
};

export default Home;
