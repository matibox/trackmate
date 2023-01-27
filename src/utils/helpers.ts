export const formatErrors = (errors: string[] | undefined) =>
  errors?.reduce((a, b) => `${a}. ${b}`);

export const capitilize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
