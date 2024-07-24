import { useState } from 'react';
import { api, type RouterOutputs } from '~/utils/api';
import { useSetupDownload } from '../useSetupDownload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import { DownloadIcon, TrashIcon, WrenchIcon } from 'lucide-react';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Skeleton } from '~/components/ui/Skeleton';
import dayjs from 'dayjs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import { Button } from '~/components/ui/Button';

export default function ViewSetupsDialog({
  event: { id, name, game },
}: {
  event: RouterOutputs['event']['fromTo'][number]['event'];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  const utils = api.useContext();
  const { data: setups, isLoading } = api.event.getSetups.useQuery(
    { eventId: id },
    {
      enabled: dialogOpen,
    }
  );

  const [currentDeleteSetupId, setCurrentDeleteSetupId] = useState<string>();

  const { mutateAsync: deleteSetup, isLoading: isDeleteLoading } =
    api.setup.delete.useMutation({
      onMutate: ({ setupId }) => setCurrentDeleteSetupId(setupId),
      onSuccess: async () => {
        await utils.event.invalidate();
        await utils.setup.invalidate();
      },
      onSettled: () => setCurrentDeleteSetupId(undefined),
    });

  const {
    download,
    downloadMany,
    isLoading: isDownloadLoading,
    currentDownloadSetupId,
  } = useSetupDownload();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!supportedGames.includes(game)}>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <WrenchIcon className='mr-2 h-4 w-4' />
          <span>View setups</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className='space-y-4 text-left'>
          <DialogTitle className='text-center sm:text-left'>Setups</DialogTitle>
          <ScrollArea className='flex max-h-96 w-full flex-col gap-2'>
            {isLoading
              ? new Array(2).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className='flex w-full justify-between pb-2 last:pb-0'
                  >
                    <div className='flex flex-col justify-center gap-1'>
                      <Skeleton className='h-4 w-12' />
                      <Skeleton className='h-3 w-44' />
                    </div>
                    <div className='flex gap-1'>
                      <Skeleton className='h-[30px] w-[30px]' />
                      <Skeleton className='h-[30px] w-[30px]' />
                    </div>
                  </div>
                ))
              : null}
            {setups?.length === 0 ? (
              <p className='text-center text-slate-300'>No setups found.</p>
            ) : (
              setups?.map(setup => (
                <div
                  key={setup.id}
                  className='flex w-full justify-between border-b border-slate-900 pb-2 last:border-b-0 last:pb-0'
                >
                  <div className='flex flex-col justify-center'>
                    <span className='text-slate-50'>{setup.name}</span>
                    <span className='text-sm text-slate-400'>
                      {dayjs(setup.uploadedAt).format(
                        'DD MMM YYYY [at] HH:mm [by] '
                      )}
                      {setup.uploader.firstName} {setup.uploader.lastName}
                    </span>
                  </div>
                  <div className='flex items-center gap-0.5'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-auto w-auto p-2'
                            aria-label='download setup'
                            onClick={async () => await download({ setup })}
                            loading={
                              currentDownloadSetupId === setup.id &&
                              isDownloadLoading
                            }
                          >
                            <DownloadIcon className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download setup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-auto w-auto p-2 text-red-500'
                            aria-label='delete setup'
                            loading={
                              currentDeleteSetupId === setup.id &&
                              isDeleteLoading
                            }
                            onClick={async () => {
                              await deleteSetup({ setupId: setup.id });
                            }}
                          >
                            <TrashIcon className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete setup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
          {setups && setups.length > 0 ? (
            <Button
              variant='positive'
              size='sm'
              className='self-end'
              onClick={() =>
                downloadMany({
                  setups: setups,
                  event: { name },
                })
              }
              loading={isDownloadLoading || isLoading}
            >
              <span>Download all</span>
              <DownloadIcon className='ml-2 h-4 w-4' />
            </Button>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
