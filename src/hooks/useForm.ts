import { type FormEvent, useCallback, useState } from 'react';
import { type Schema } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type allKeys<T> = T extends any ? keyof T : never;

export default function useForm<TValues>(
  schema: Schema<TValues>,
  handleSubmit: (values: TValues) => void
) {
  const [errors, setErrors] =
    useState<{ [P in allKeys<TValues>]?: string[] | undefined }>();

  const onSubmit = useCallback(
    (e: FormEvent, values: unknown) => {
      e.preventDefault();
      setErrors(undefined);
      const parseResult = schema.safeParse(values);
      if (!parseResult.success) {
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        return setErrors(fieldErrors);
      }
      handleSubmit(parseResult.data);
    },
    [handleSubmit, schema]
  );

  return {
    handleSubmit: onSubmit,
    errors,
  };
}
