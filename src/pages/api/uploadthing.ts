import { createRouteHandler } from 'uploadthing/next-legacy';
import { fileRouter } from '~/server/uploadthing';

export default createRouteHandler({
  router: fileRouter,
});
