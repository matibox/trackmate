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
import dayjs from '~/lib/dates';

export default function Telemetry() {
  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead className="w-[100px]">Size</TableHead>
            <TableHead className="w-[150px]">Upload date</TableHead>
            <TableHead>Uploaded by</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              Barcelona-mercedes_amg_gt3_evo-10-2025.02.15-12.53.46
            </TableCell>
            <TableCell>25.5MB</TableCell>
            <TableCell>{dayjs().format('YYYY/MM/DD')}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 rounded-full">
                  <AvatarImage
                    src="https://cdn.discordapp.com/avatars/459023179801952286/770f8c81e01aef4169b18d5cff5833f6.png"
                    alt="Mateusz Hladky"
                  />
                  <AvatarFallback className="rounded-lg">MH</AvatarFallback>
                </Avatar>
                Mateusz Hladky
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="secondary" size="icon" className="h-7 w-7">
                <EllipsisIcon />
                <span className="sr-only">Previous month</span>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
