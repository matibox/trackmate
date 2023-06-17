// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type allKeys<T> = T extends any ? keyof T : never;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type Nullable<T extends object, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};
