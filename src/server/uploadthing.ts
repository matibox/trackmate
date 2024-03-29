import {
  createUploadthing,
  type FileRouter as FR,
} from 'uploadthing/next-legacy';
import { getServerAuthSession } from './auth';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: '2MB' } })
    .middleware(async ({ req, res }) => {
      const session = await getServerAuthSession({ req, res });

      if (!session) throw new UploadThingError('Unauthorized');

      return { session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(file.url);

      return { uploadedBy: metadata.session.user.id };
    }),
} satisfies FR;

export type FileRouter = typeof fileRouter;
