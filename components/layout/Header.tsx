import {
  AppBar,
  Typography,
  Box,
  Toolbar,
  List,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  ListItemButton,
  Stack,
  Button,
  Container,
  SxProps,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

type Props = { sx: SxProps };
const Header = ({ sx }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();

  const links: { href: string; text: string }[] = [
    {
      href: '/musicals',
      text: 'Musicals',
    },
    { href: '/player', text: 'Play your own tracks' },
    { href: '/yt-player', text: 'Play YouTube audio' },
  ];

  const handleDrawerKeyEvent = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(prev => !prev);
  };

  const handleDrawerClick = () => {
    setDrawerOpen(prev => !prev);
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="sticky" color="inherit" sx={sx}>
      <Container maxWidth="xl">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<LibraryMusicIcon />}
            color="inherit"
            onClick={() => {
              router.push('/');
            }}
          >
            Practice Track Player
          </Button>
          {matches ? (
            <Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerClick}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClick}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onKeyDown={handleDrawerKeyEvent}
                >
                  <List>
                    {links.map((link, i) => (
                      <ListItemButton key={i}>
                        <ListItemText
                          primary={
                            <Typography
                              color={
                                router.pathname.startsWith(link.href)
                                  ? 'primary'
                                  : ''
                              }
                            >
                              {link.text}
                            </Typography>
                          }
                          onClick={() => {
                            router.push(link.href);
                            handleDrawerClick();
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </Box>
          ) : (
            <Stack direction="row" spacing={2}>
              {links.map((link, i) => (
                <Button
                  color={
                    router.pathname.startsWith(link.href)
                      ? 'primary'
                      : 'inherit'
                  }
                  key={i}
                  onClick={() => router.push(link.href)}
                >
                  {link.text}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
