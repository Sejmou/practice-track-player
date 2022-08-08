import Link from 'next/link';
import { useRouter } from 'next/router';

import { MusicalBaseData } from '@models';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

type Props = { musicalData: MusicalBaseData[] };
const MusicalsList = ({ musicalData }: Props) => {
  return (
    <List>
      {musicalData.map(d => (
        <ListItem key={d.id}>
          <Link href={d.id}>
            <ListItemButton>
              <ListItemText primary={d.title} />
            </ListItemButton>
          </Link>
        </ListItem>
      ))}
    </List>
  );
};
export default MusicalsList;
