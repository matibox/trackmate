// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type allKeys<T> = T extends any ? keyof T : never;
