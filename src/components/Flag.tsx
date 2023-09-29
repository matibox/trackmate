import Image from 'next/image';

export default function Flag({ country }: { country: string | undefined }) {
  return (
    <div className='relative h-[11px] w-[17px]'>
      <Image
        src={`/flags/${country ?? ''}.svg`}
        alt={''}
        fill
        className='object-cover'
      />
    </div>
  );
}
