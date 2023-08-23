import Rally1 from '/public/images/rally-1.png';
import GT1 from '/public/images/gt-1.png';
import Logo from '/public/images/TM_Symbol_2.png';

import { type GetServerSidePropsContext, type NextPage } from 'next';
import SimImage from '~/components/SimImage';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import DynamicContainer from '~/components/DynamicContainer';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // TODO: check if user already got through get started process

  return {
    props: {
      session,
    },
  };
}

const usernameError = 'Username needs to be between 2 and 20 characters';

const formSchema = z.object({
  username: z.string().min(2, usernameError).max(20, usernameError),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(35, "First name can't be longer than 35 characters"),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(35, "Last name can't be longer than 35 characters"),
});

const Welcome: NextPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className='relative flex h-[100dvh] flex-col xl:flex-row'>
      <header className='absolute left-0 top-0 z-10 flex w-full justify-start p-3'>
        <Image src={Logo} alt='TrackMate logo' width={45} />
      </header>
      <SimImage sources={[Rally1, GT1]} priority />
      <DynamicContainer
        as='main'
        padding={48}
        className='relative z-10 min-h-[50%] w-full border-y border-slate-900 bg-slate-950 p-6 xl:w-1/3'
      >
        <div className='flex flex-col gap-10 sm:gap-16 xl:h-full'>
          <div className='flex flex-col gap-0.5 text-center'>
            <h1 className='text-3xl font-bold'>
              Welcome to <span className='text-sky-500'>TrackMate</span>
            </h1>
            <p className='text-sm leading-[18px] text-slate-300'>
              Fill in your data to continue with the app. We use your name only
              for displaying purposes.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Continue</Button>
            </form>
          </Form>
        </div>
      </DynamicContainer>
      <SimImage sources={[GT1, Rally1]} />
      {/* gradient */}
      <div className='absolute h-full w-full bg-gradient-radial from-sky-500/20 via-sky-500/10 opacity-20' />
    </div>
  );
};

export default Welcome;
