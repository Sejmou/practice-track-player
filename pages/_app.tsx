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
      <div style={{ minHeight: '100%' }}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          minHeight="100vh"
        >
          <Header />
          <Container sx={{ pt: 2 }}>
            <Component {...pageProps} />
          </Container>
          <Footer />
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
