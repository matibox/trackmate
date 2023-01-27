import { type ReactNode, type FC, useEffect } from 'react';
import { useError } from '../hooks/useError';
import { formatErrors } from '../utils/helpers';

type ErrorWrapperProps = {
  children: ReactNode;
  error: string[] | string | undefined;
  visibleFor?: number;
};

const ErrorWrapper: FC<ErrorWrapperProps> = ({
  children,
  error,
  visibleFor = 5000,
}) => {
  const { Error, setError } = useError(visibleFor);

  useEffect(() => {
    if (!error) return;
    if (typeof error === 'string') {
      return setError(error);
    }
    setError(formatErrors(error));
  }, [error, setError]);

  return (
    <>
      {children}
      <Error />
    </>
  );
};

export default ErrorWrapper;
