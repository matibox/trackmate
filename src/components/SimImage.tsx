import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type BgImageProps = {
  images: [StaticImageData, ...StaticImageData[]];
  className?: string;
  priority?: boolean;
};

export default function SimImage({ images, className }: BgImageProps) {
  const [displayedImage, setDisplayedImage] = useState(images[0]);

  const handleImageChange = useCallback(() => {
    setDisplayedImage(prevImg => {
      const index = images.findIndex(img => img.src === prevImg.src) + 1;
      let image = images[index];
      if (!image) image = images[0];
      return image;
    });
  }, [setDisplayedImage, images]);

  useEffect(() => {
    const interval = setInterval(handleImageChange, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [handleImageChange]);

  return (
    <div className='relative max-h-[25%] w-full grow xl:h-full xl:max-h-none xl:w-1/3'>
      <AnimatePresence>
        <motion.div
          key={displayedImage.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          <Image
            src={displayedImage}
            alt=''
            className={cn(
              'absolute left-0 top-0 h-full w-full object-cover',
              className
            )}
            priority={true}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
