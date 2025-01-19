import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { type ReactNode } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import { cn } from '~/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { useIsMobile } from '~/hooks/use-mobile';

export default function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger = null,
  children,
  tooltip,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  trigger?: ReactNode | null;
  children: ReactNode;
  tooltip?: string;
  className?: string;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>{trigger}</DialogTrigger>
            </TooltipTrigger>
            <TooltipContent hidden={!tooltip}>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent
          className={cn('sm:max-w-[425px]', className)}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          </TooltipTrigger>
          <TooltipContent hidden={!tooltip}>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DrawerContent onOpenAutoFocus={e => e.preventDefault()}>
        <DrawerHeader className="text-slate-50 sm:text-center">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="px-6 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
