import { signIn, signOut, useSession } from 'next-auth/react';
import useSWRImmutable from 'swr/immutable';

import { jsonFetcher } from '@frontend/util/data-fetchers';
import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import { Button, Stack, Typography } from '@mui/material';
import PlaylistPicker from './PlaylistPicker';
import { PlaylistItem } from '@pages/api/yt/user/playlists';
import { PlaylistVideoItemsData } from '..';
import { YouTubePlaylistDataValidator } from '@models';

type Props = {
  onUserPlaylistPicked: (playlistData: PlaylistVideoItemsData) => void;
};

const UserPlaylists = ({ onUserPlaylistPicked }: Props) => {
  const session = useSession();
  const googleApiToken = session?.data?.accessToken;

  const { data: playlists, error } = useSWRImmutable(
    googleApiToken ? '/api/yt/user/playlists' : null,
    jsonFetcher
  );

  const loading = !playlists && !error;

  console.log(session);

  const handlePlaylistSelection = async (playlist: PlaylistItem) => {
    console.log('user picked playlist', playlist);
    await fetch(`/api/yt/playlist-video-metadata/${playlist.id}`)
      .then(res => res.json())
      .then(json => {
        const data = YouTubePlaylistDataValidator.parse(json);
        onUserPlaylistPicked({ videos: data, initialIndex: 0 });
      });
  };

  return (
    <ResponsiveContainer
      title="Play your own playlist"
      contentWrapperSxWide={{ px: 2, py: 2 }}
    >
      {!session || session.status !== 'authenticated' ? (
        <Stack>
          <Typography variant="subtitle1" maxWidth="650px">
            Want to play videos stored in your YouTube account?
          </Typography>
          <Button onClick={() => signIn('google')}>Login</Button>
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Stack sx={{ textAlign: 'center' }}>
            <Typography>
              Hi, {session.data.user?.name?.split(' ')[0]}!
            </Typography>
            <Typography>
              You&apos;re logged into your Google-Account (
              {session.data.user?.email}).
            </Typography>
            <Button onClick={() => signOut()}>Logout</Button>
          </Stack>
          {loading ? (
            <Typography sx={{ px: 2, pt: 1 }}>
              Fetching your playlists...
            </Typography>
          ) : !playlists ? (
            <Typography variant="body2" sx={{ px: 2, pt: 1 }}>
              {error
                ? 'Could not fetch playlists 😢'
                : 'If you had playlists in your account they would show up here.'}
            </Typography>
          ) : (
            <PlaylistPicker
              playlists={playlists}
              onPlaylistSelected={handlePlaylistSelection}
            />
          )}
        </Stack>
      )}
    </ResponsiveContainer>
  );
};
export default UserPlaylists;
