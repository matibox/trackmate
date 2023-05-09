import { type FC } from 'react';
import { usePostFeedbackStore } from '../store';
import Popup, { PopupHeader } from '~/components/common/Popup';

const PostFeedback: FC = () => {
  const { isOpened, close, setupId } = usePostFeedbackStore();

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Post feedback' />}
    >
      {setupId}
    </Popup>
  );
};

export default PostFeedback;
