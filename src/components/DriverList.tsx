import Link from 'next/link';
import { type FC } from 'react';
import { type RouterOutputs } from '../utils/api';

type DriversProps = {
  drivers: RouterOutputs['championship']['get'][number]['drivers'];
};

const DriverList: FC<DriversProps> = ({ drivers }) => {
  return (
    <>
      {drivers.map(driver => {
        const { id, name } = driver;
        return (
          <>
            <Link
              key={id}
              href={`/profile/${id}`}
              className='transition-colors hover:text-sky-400'
            >
              {name}
            </Link>
            {drivers[drivers.length - 1]?.id === id ? '' : ', '}
          </>
        );
      })}
    </>
  );
};

export default DriverList;
