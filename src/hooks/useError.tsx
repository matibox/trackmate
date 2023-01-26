import { type FC, useEffect, useState } from 'react';
import ErrorMessage, { type ErrorMessageProps } from '@ui/ErrorMessage';

export function useError(visibleFor = 5000) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(undefined), visibleFor);
    return () => clearTimeout(timeout);
  }, [error, setError, visibleFor]);

  const Error: FC<Omit<ErrorMessageProps, 'error'>> = ({ ...props }) => (
    <ErrorMessage error={error} {...props} />
  );

  return { Error, setError };
}
