import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';

import type { FileRouter } from '~/server/uploadthing';

export const UploadButton = generateUploadButton<FileRouter>();
export const UploadDropzone = generateUploadDropzone<FileRouter>();

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<FileRouter>();
