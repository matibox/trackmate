import { XMarkIcon } from '@heroicons/react/20/solid';
import { type FC } from 'react';
import cn from '../../lib/classes';
import { capitilize } from '../../utils/helpers';
import Button from './Button';

type PopupHeaderProps = {
  title: string;
  close: () => void;
  smallHeading?: boolean;
};

const PopupHeader: FC<PopupHeaderProps> = ({
  title,
  close,
  smallHeading = false,
}) => {
  return (
    <div className='flex items-center justify-between'>
      <h1
        className={cn('text-xl', {
          'text-lg': smallHeading,
        })}
      >
        {capitilize(title)}
      </h1>
      <Button intent='secondary' size='xs' onClick={close}>
        <XMarkIcon className='h-6' />
      </Button>
    </div>
  );
};

export default PopupHeader;
