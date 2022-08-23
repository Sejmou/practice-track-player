import NextLink from 'next/link';
import React, { forwardRef } from 'react';
import { List, ListItem, ListItemButton, Paper } from '@mui/material';

import { MusicalBaseData } from '@models';

// https://stackoverflow.com/a/72224893/13727176
const LinkListItemButton = forwardRef((props: any, ref: any) => {
  const { href } = props;
  return (
    <NextLink href={href} passHref>
      <ListItemButton ref={ref} {...props} />
    </NextLink>
  );
});
LinkListItemButton.displayName = 'LinkListItemButton';

type Props = { musicalData: MusicalBaseData[] };
const MusicalsList = ({ musicalData }: Props) => {
  return (
    <Paper>
      <List>
        {musicalData.map(d => (
          <ListItem key={d.id}>
            <LinkListItemButton href={`musicals/${d.id}`}>
              {d.title}
            </LinkListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
export default MusicalsList;
