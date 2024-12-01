'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

import ACC from '../../../../public/images/ACC.png';
import F1 from '../../../../public/images/F1.jpg';
import GT7 from '../../../../public/images/GT7.jpg';
import IRacing from '../../../../public/images/iRacing.jpg';
import Rally from '../../../../public/images/Rally.png';
import RF2 from '../../../../public/images/RF2.jpg';

const baseImages = [ACC, F1, GT7, Rally, IRacing, RF2];

export default function SimImage({
  className,
  set,
}: {
  set: 1 | 2;
  className?: string;
}) {
  const images = baseImages.slice(set === 1 ? 0 : 3, set === 1 ? 3 : -1);

  const [displayedImage, setDisplayedImage] = useState(images[0]);

  const handleImageChange = useCallback(() => {
    setDisplayedImage(prevImg => {
      const index = images.findIndex(img => img.src === prevImg.src) + 1;
      let image = images[index];
      if (!image) image = images[0];
      return image;
    });
  }, [images]);

  useEffect(() => {
    const interval = setInterval(handleImageChange, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [handleImageChange]);

  return (
    <div className="relative max-h-[25%] w-full grow xl:h-full xl:max-h-none xl:w-1/3">
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
            alt=""
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
