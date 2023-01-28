import { XMarkIcon } from '@heroicons/react/20/solid';
import { type ReactNode, type FC } from 'react';
import Button from './Button';
import Popup from './Popup';
import PopupHeader from './PopupHeader';

type ConfirmationProps = {
  headerMessage: string;
  message: string;
  close: () => void;
  isOpened: boolean;
  isLoading?: boolean;
  children: ReactNode;
};

const Confirmation: FC<ConfirmationProps> = ({
  headerMessage,
  message,
  close,
  isOpened,
  isLoading,
  children,
}) => {
  return (
    <Popup
      condition={isOpened}
      header={<PopupHeader close={close} title={headerMessage} />}
      close={close}
      className='max-w-sm'
      isLoading={isLoading}
    >
      <div className='flex h-full w-full flex-col items-center gap-4'>
        <div className='text-xl font-semibold'>{message}</div>
        <div className='flex justify-center gap-4'>
          <Button
            intent='secondary'
            gap='small'
            className='font-semibold'
            onClick={close}
          >
            <span>Cancel</span>
            <XMarkIcon className='h-5' />
          </Button>
          {children}
        </div>
      </div>
    </Popup>
  );
};

export default Confirmation;
