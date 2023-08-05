import Link from 'next/link';
import { Fragment, type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';

type DriversProps = {
  drivers: RouterOutputs['championship']['get'][number]['drivers'];
};

const DriverList: FC<DriversProps> = ({ drivers }) => {
  return (
    <span>
      {drivers.map(driver => {
        const { id, name } = driver;
        return (
          <Fragment key={id}>
            <Link
              href={`/profile/${id}`}
              className='transition-colors hover:text-sky-400'
            >
              {name}
            </Link>
            {drivers[drivers.length - 1]?.id === id ? '' : ', '}
          </Fragment>
        );
      })}
    </span>
  );
};

export default DriverList;
