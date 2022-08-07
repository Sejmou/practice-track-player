import Link from 'next/link';

import { MusicalBaseData } from '@models';

type Props = { musicalData: MusicalBaseData[] };
const MusicalsList = ({ musicalData }: Props) => {
  return (
    <ul>
      {musicalData.map(d => (
        <li key={d.id}>
          <Link href={d.id}>{d.title}</Link>
        </li>
      ))}
    </ul>
  );
};
export default MusicalsList;
