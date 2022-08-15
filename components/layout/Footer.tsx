import {
  Box,
  Container,
  IconButton,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

type Props = {};
const Footer = (props: Props) => {
  const theme = useTheme();
  return (
    <footer
      style={{
        position: 'sticky',
        paddingTop: '1em',
      }}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: 1,
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">
          Created by Samo Kolter ({new Date().getUTCFullYear()})
        </Typography>
        <Box>
          <Link href="https://www.linkedin.com/in/samo-k/" target="_blank">
            <IconButton>
              <LinkedInIcon />
            </IconButton>
          </Link>
          <Link href="https://github.com/Sejmou" target="_blank">
            <IconButton>
              <GitHubIcon />
            </IconButton>
          </Link>
        </Box>
      </Container>
    </footer>
  );
};
export default Footer;
