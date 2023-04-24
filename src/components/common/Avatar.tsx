import Image, { type ImageProps } from 'next/image';
import { useState, type FC } from 'react';

const Avatar: FC<ImageProps> = ({ ...props }) => {
  const [src, setSrc] = useState(props.src);
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image {...props} src={src} onError={() => setSrc('/DefaultAvatar.png')} />
  );
};

export default Avatar;
