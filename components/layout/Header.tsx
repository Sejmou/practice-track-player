import {
  AppBar,
  Typography,
  Box,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  ListItemButton,
  Stack,
  Button,
  Container,
} from '@mui/material';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, KeyboardEvent } from 'react';
import classes from './Layout.module.css';
import { useRouter } from 'next/router';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

type Props = {};
const Header = (props: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();

  const links: { href: string; text: string }[] = [
    {
      href: '/musicals',
      text: 'Musicals',
    },
    // { href: '/player', text: 'Play your own track' },
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
    <AppBar position="sticky" color="inherit">
      <Container maxWidth="xl">
        <Toolbar
          className={classes.toolBar}
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
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
                <MenuIcon className={classes.menuIcon} />
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
                                router.pathname === link.href ? 'primary' : ''
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
                <Link href={link.href} target="_blank" key={i}>
                  <Button className={classes.link}>{link.text}</Button>
                </Link>
              ))}
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
