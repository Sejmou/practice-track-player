import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';

type Props = {};
const Login: NextPage<Props> = ({}: Props) => {
  const router = useRouter();
  const session = useSession();

  if (typeof window !== 'undefined' && session.status === 'authenticated') {
    // redirect user away from this page if already authenticated
    // TODO: figure out if this can be done in cleaner way with middleware, i.e. not delivering this page to clients at all if already authenticated and redirecting instead
    router.replace('/');
  }

  return (
    <>
      <Head>
        <title>YouTube-Login (Practice Track Player)</title>
        <meta
          name="description"
          content="Log in with with your YouTube account to access your playlists!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Card sx={{ p: 2, width: '100%' }}>
          <Stack spacing={1}>
            <Typography variant="h4">YouTube-Login</Typography>
            <Typography>
              Log in with with your YouTube account to access your playlists!
            </Typography>
            <Typography>
              This is the only reason this app needs permission to access your
              account.
            </Typography>
            <Button onClick={() => signIn('google')}>Login</Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
};

export default Login;
