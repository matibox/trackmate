import { useState } from 'react';
import { UploadThingError } from 'uploadthing/server';
import { toast } from '~/components/ui/useToast';
import { uploadFiles } from '~/utils/uploadthing';

export function useImageUpload() {
  const [isImageUploading, setIsImageUploading] = useState(false);

  async function uploadImage(
    file: File,
    onSuccess: ({ url }: { url: string }) => void | Promise<void>
  ) {
    setIsImageUploading(true);
    try {
      const res = await uploadFiles('imageUploader', {
        files: [file],
      });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await onSuccess({ url: res[0]!.url });
    } catch (err) {
      if (err instanceof UploadThingError) {
        toast({
          variant: 'destructive',
          title: 'An error occured while uploading the image.',
          description: err.message,
        });
      }
    } finally {
      setIsImageUploading(false);
    }
  }

  return {
    isImageUploading,
    uploadImage,
  };
}
