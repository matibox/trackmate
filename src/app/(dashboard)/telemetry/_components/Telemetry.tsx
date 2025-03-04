import { EllipsisIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { type CarName, type TrackName } from '~/lib/constants';
import dayjs from '~/lib/dates';

type Telemetry = {
  id: number;
  track: TrackName;
  car: CarName;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: {
    id: string;
    image: string | null;
    firstName: string;
    lastName: string;
  };
};

const placeholderTelemetry: Array<Telemetry> = [
  {
    id: 0,
    track: 'Circuit of the Americas',
    car: 'Lamborghini Huracán Super Trofeo EVO2',
    fileSize: 25,
    uploadDate: new Date(),
    uploadedBy: {
      id: 'a',
      image:
        'https://cdn.discordapp.com/avatars/459023179801952286/770f8c81e01aef4169b18d5cff5833f6.png',
      firstName: 'Mateusz',
      lastName: 'Hladky',
    },
  },
  {
    id: 1,
    track: 'Spa-Francorchamps',
    car: 'BMW M4',
    fileSize: 32.4,
    uploadDate: new Date('2024-01-15'),
    uploadedBy: {
      id: 'b',
      image: null,
      firstName: 'John',
      lastName: 'Smith',
    },
  },
  {
    id: 2,
    track: 'Monza',
    car: 'Ferrari 296',
    fileSize: 28.7,
    uploadDate: new Date('2024-01-12'),
    uploadedBy: {
      id: 'c',
      image: 'https://unsplash.it/99/99',
      firstName: 'Marco',
      lastName: 'Rossi',
    },
  },
  {
    id: 3,
    track: 'Silverstone',
    car: 'Porsche 911 GT3R',
    fileSize: 30.1,
    uploadDate: new Date('2024-01-10'),
    uploadedBy: {
      id: 'd',
      image: 'https://unsplash.it/101/101',
      firstName: 'James',
      lastName: 'Wilson',
    },
  },
  {
    id: 4,
    track: 'Nürburgring',
    car: 'Mercedes AMG EVO',
    fileSize: 35.8,
    uploadDate: new Date('2024-01-08'),
    uploadedBy: {
      id: 'e',
      image: 'https://unsplash.it/100/100',
      firstName: 'Michael',
      lastName: 'Schmidt',
    },
  },
];

export default function Telemetry() {
  return (
    <div className="w-full px-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Track</TableHead>
            <TableHead className="min-w-[150px]">Car</TableHead>
            <TableHead className="min-w-[80px]">Size</TableHead>
            <TableHead className="min-w-[125px]">Upload date</TableHead>
            <TableHead className="min-w-[150px]">Uploaded by</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderTelemetry.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.track}</TableCell>
              <TableCell>{row.car}</TableCell>
              <TableCell>{row.fileSize}MB</TableCell>
              <TableCell>
                {dayjs(row.uploadDate).format('YYYY/MM/DD')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 rounded-full">
                    <AvatarImage
                      src={row.uploadedBy.image ?? undefined}
                      alt={`${row.uploadedBy.firstName} ${row.uploadedBy.lastName}`}
                    />
                    <AvatarFallback className="rounded-lg">
                      <span className="text-xs">
                        {row.uploadedBy.firstName[0]}
                        {row.uploadedBy.lastName[0]}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  {row.uploadedBy.firstName} {row.uploadedBy.lastName}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="secondary" size="icon" className="h-7 w-7">
                  <EllipsisIcon />
                  <span className="sr-only">Actions</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
