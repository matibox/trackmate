import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { type RefObject, useMemo, useState } from 'react';
import { useClickOutside } from '~/hooks/useClickOutside';
import { useError } from '~/hooks/useError';
import useSetupDownload from '~/hooks/useSetupDownload';
import { type Event } from '~/pages/event/[eventId]';
import { api } from '~/utils/api';

type UseSetupProps = {
  setup: Event['setups'][number];
  refs: {
    menuRef: RefObject<HTMLDivElement>;
    menuBtnRef: RefObject<HTMLButtonElement>;
  };
  isAssigned?: boolean;
};

export function useSetup({
  setup: { createdAt, updatedAt, events, downloads, author },
  refs: { menuRef, menuBtnRef },
  isAssigned: defaultIsAssigned = false,
}: UseSetupProps) {
  const [actionsOpened, setActionsOpened] = useState(false);
  const [isAssigned, setIsAssigned] = useState(defaultIsAssigned);

  const { data: session } = useSession();
  const { Error, setError } = useError();

  const isEdited = useMemo(() => {
    return !dayjs(createdAt).isSame(dayjs(updatedAt));
  }, [createdAt, updatedAt]);

  const isActive = useMemo(() => {
    return isAssigned && (events[0]?.isActive ?? false);
  }, [events, isAssigned]);

  const isAuthor = useMemo(() => {
    if (!session?.user?.id) return false;
    return author.id === session.user.id;
  }, [author.id, session?.user?.id]);

  const changedSinceLastDownload = useMemo(() => {
    if (!isAssigned) return false;
    const userDownloads = downloads;
    if (userDownloads.length === 0 || !userDownloads[0]) return false;
    const lastDownloaded = userDownloads[0].downloadedAt;
    return dayjs(lastDownloaded).isBefore(dayjs(updatedAt));
  }, [isAssigned, downloads, updatedAt]);

  const { download, isLoading: isDownloadLoading } = useSetupDownload(setError);

  useClickOutside(menuRef, () => setActionsOpened(false), [menuBtnRef]);

  const utils = api.useContext();
  const { mutate: toggleIsActive, isLoading: activeToggleLoading } =
    api.setup.toggleIsActive.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.setups.invalidate();
        await utils.event.single.invalidate();
        await utils.setup.invalidate();
        setActionsOpened(false);
      },
    });

  const { mutate: toggleAssignment, isLoading: assignmentLoading } =
    api.setup.toggleAssignment.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
        await utils.event.setups.invalidate();
        await utils.setup.invalidate();
        setIsAssigned(prev => !prev);
        setActionsOpened(false);
      },
    });

  return {
    isEdited,
    isActive,
    isAssigned,
    isAuthor,
    changedSinceLastDownload,
    actionsOpened,
    setActionsOpened,
    download,
    toggleIsActive,
    toggleAssignment,
    Error,
    isLoading: isDownloadLoading || activeToggleLoading || assignmentLoading,
  };
}
