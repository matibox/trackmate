import SimImage from './_components/SimImage';

export default function GroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex h-[100dvh] flex-col xl:flex-row">
      <SimImage set={1} />
      <main className="relative z-10 flex h-1/2 flex-col items-center justify-between border-y border-slate-900 bg-slate-950 py-10 sm:justify-center sm:gap-16 xl:h-full xl:w-1/3">
        {children}
      </main>
      <SimImage set={2} />
      <div className="bg-gradient-radial absolute h-full w-full from-sky-500/20 via-sky-500/10 opacity-20" />
    </div>
  );
}
