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
  '.MuiCard-root': {
    display: 'flex',
    flexDirection: 'column',
  },
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
      <Typography variant="h2" pb={2}>
        Welcome!
      </Typography>
      <Typography variant="subtitle1" pb={2} maxWidth={800}>
        This website features a purpose-built audio player for music practice
        featuring a waveform view for the currently playing track, controls for
        playback speed, jumping to sections etc., allowing you you to learn
        tracks by ear at maximum speed! It is also very useful for transcribing
        pieces of music.
      </Typography>
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
              &nbsp; in a convenient audio player, directly in your browser :)
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
            <Typography variant="h5">Play your own tracks</Typography>
            <Typography>
              Select audio files stored on your computer and play them with the
              practice track player 👌
            </Typography>
          </CardContent>
          <CardActions sx={{ mt: 'auto' }}>
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
