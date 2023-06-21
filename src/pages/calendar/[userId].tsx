import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from 'next';
import { getServerAuthSession } from '~/server/auth';

const Calendar: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return <div>calendar</div>;
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Calendar;
