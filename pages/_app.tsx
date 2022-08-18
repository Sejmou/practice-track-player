import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
} from '@mui/material';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

const theme = createTheme({
  palette: {
    background: {
      default: '#eeeeee',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <CssBaseline />
        <Header sx={{ flex: '0 1 auto' }} />
        <Container
          sx={{
            minHeight: '100%',
            flex: '1',
            py: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Component {...pageProps} />
        </Container>
        <Footer sx={{ flex: '0 1 auto' }} />
      </Box>
    </ThemeProvider>
  );
}

export default MyApp;
