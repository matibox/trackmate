import Image, { type StaticImageData } from 'next/image';
import { cn } from '~/lib/utils';

type BgImageProps = {
  sources: StaticImageData[];
  className?: string;
  priority?: boolean;
};

export default function SimImage({
  sources,
  className,
  priority = false,
}: BgImageProps) {
  return (
    <div className='relative max-h-[25%] w-full grow xl:h-full xl:max-h-none xl:w-1/3'>
      {sources.map((source, i) => (
        <Image
          key={source.src}
          src={source}
          alt=''
          className={cn(
            'absolute left-0 top-0 h-full w-full animate-image-carousel object-cover opacity-0',
            className
          )}
          style={{
            animationDelay: `${i * 20}s`,
          }}
          priority={priority}
        />
      ))}
    </div>
  );
}
