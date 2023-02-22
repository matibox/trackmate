import { type RefObject, useEffect } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  onClickOutside: (e: MouseEvent) => void,
  additionalRefs?: RefObject<HTMLElement>[]
) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        additionalRefs?.every(
          ref => ref.current && !ref.current.contains(e.target as Node)
        )
      ) {
        onClickOutside(e);
      }
    };

    document.addEventListener('pointerdown', handleClick);

    return () => document.removeEventListener('pointerdown', handleClick);
  }, [additionalRefs, onClickOutside, ref]);
}
