import { LinkIcon } from '@heroicons/react/20/solid';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';

type UserDataProps = {
  profile: RouterOutputs['user']['getProfile'] | undefined;
  isLoading: boolean;
};

const UserData: FC<UserDataProps> = ({ profile, isLoading }) => {
  return (
    <Tile className='xl:col-span-2' isLoading={isLoading}>
      <div className='flex items-center gap-4'>
        <Image
          src={profile?.image ?? '/DefaultAvatar.png'}
          alt={`${profile?.name ?? 'user'}'s avatar`}
          width={100}
          height={100}
          priority={true}
          className='rounded-full'
        />
        {profile && (
          <div className='flex flex-col gap-1'>
            <h1 className='text-lg font-semibold'>{profile.name}</h1>
            <span>
              User since: {dayjs(profile.createdAt).format('DD MMM YYYY')}
            </span>
            {profile.team?.name && (
              <Link
                draggable={false}
                href={`/team/${profile.team.id}`}
                className='flex items-center gap-1 text-slate-300 transition-colors hover:text-sky-400'
              >
                <span>{profile.team.name}</span>
                <LinkIcon className='h-4' />
              </Link>
            )}
          </div>
        )}
      </div>
    </Tile>
  );
};

export default UserData;
