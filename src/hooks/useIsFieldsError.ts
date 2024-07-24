import { useMemo } from 'react';
import { type FieldErrors } from 'react-hook-form';

export function useIsFieldsError<T extends object>(
  errors: FieldErrors<T>,
  fields: Array<keyof T>
) {
  const isError = useMemo(
    () => fields.some(field => errors[field as keyof FieldErrors<T>]),
    [errors, fields]
  );

  return { isError };
}
