import {
  Box,
  Container,
  IconButton,
  Link,
  SxProps,
  Typography,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

type Props = { sx?: SxProps };
const Footer = ({ sx }: Props) => {
  return (
    <Container
      component="footer"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        alignItems: 'center',
        ...sx,
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
  );
};
export default Footer;
