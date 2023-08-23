import {
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useState,
  useEffect,
  type RefObject,
} from 'react';
import { cn } from '~/lib/utils';

interface DynamicContainerProps<T extends ElementType> {
  as?: T;
  padding?: number;
  className?: string;
  children?: ReactNode;
  style?: object;
}

export default function DynamicContainer<T extends ElementType = 'div'>({
  as,
  padding = 0,
  className,
  children,
  style,
  ...props
}: DynamicContainerProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof DynamicContainerProps<T>>) {
  const content = useRef<HTMLDivElement>(null);
  const { height } = useResizeObserver(content);

  const Component = as || 'div';

  return (
    <Component
      className={cn('transition-all duration-300', className)}
      style={{
        height: `${height + padding}px`,
        ...style,
      }}
      {...props}
    >
      <div ref={content} className='h-fit w-fit'>
        {children}
      </div>
    </Component>
  );
}

function useResizeObserver(ref: RefObject<Element>) {
  const [element, setElement] = useState<Element | null>(null);
  const [rect, setRect] = useState<{ height: number; width: number } | null>(
    null
  );
  const observer = useRef<ResizeObserver | null>(null);

  const cleanOb = () => {
    if (observer.current) {
      observer.current.disconnect();
    }
  };

  useEffect(() => {
    setElement(ref.current);
  }, [ref]);

  useEffect(() => {
    if (!element) return;
    cleanOb();

    const ob = (observer.current = new ResizeObserver(([entry]) => {
      setRect(entry?.target.getBoundingClientRect() ?? null);
    }));
    ob.observe(element);

    return () => {
      cleanOb();
    };
  }, [element]);

  return {
    height: rect?.height ?? 0,
    width: rect?.width ?? 0,
  };
}
