import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState, useMemo } from 'react';
import {
  FormProvider,
  type UseFormReturn,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { z } from 'zod';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import ResponsiveDialog from '~/components/ui/ResponsiveDialog';
import { type sessionTypes } from '~/lib/constants';
import { capitalize, cn, isNaNArr } from '~/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { Button } from '~/components/ui/Button';
import dayjs from 'dayjs';
import {
  CalendarIcon,
  CloudIcon,
  Loader2Icon,
  ServerIcon,
  Settings2Icon,
} from 'lucide-react';
import { Calendar } from '~/components/ui/Calendar';
import { Input } from '~/components/ui/Input';
import { type stepThreeSchema } from './Step3';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import Flag from '~/components/Flag';
import { api } from '~/utils/api';
import { type stepTwoSchema } from './Step2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import { Slider } from '~/components/ui/Slider';
import { Checkbox } from '~/components/ui/Checkbox';

type SessionType = (typeof sessionTypes)[number];

const serverInfoSchema = z.object({
  inGameTime: z.string().optional(),
  serverName: z.string().optional(),
  serverPassword: z.string().optional(),
});

const weatherSchema = z.object({
  includeWeather: z.boolean().default(false),
  rainLevel: z.string().optional(),
  cloudLevel: z.string().optional(),
  randomness: z.string().optional(),
  temperature: z.string().optional(),
});

const briefingSchema = z.object({
  type: z.literal('briefing'),
  date: z.date({ required_error: 'Date is required.' }),
  startTime: z
    .string({ required_error: 'Start time is required.' })
    .min(1, 'Start time is required.'),
});

const practiceSchema = z
  .object({
    type: z.literal('practice', { required_error: 'type is required' }),
    date: z.date({ required_error: 'Date is required.' }),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .min(1, 'Start time is required.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .min(1, 'End time is required.'),
  })
  .merge(serverInfoSchema);

const qualifyingSchema = z
  .object({
    type: z.literal('qualifying'),
    date: z.date({ required_error: 'Date is required.' }),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .min(1, 'Start time is required.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .min(1, 'End time is required.'),
    driverId: z
      .string({ required_error: 'Choose a driver.' })
      .min(1, 'Choose a driver.'),
  })
  .merge(serverInfoSchema)
  .merge(weatherSchema);

const raceSchema = z.object({
  type: z.literal('race'),
  date: z.date({ required_error: 'Date is required.' }),
  beng: z.string().min(1, 'yes'),
});

function BriefingForm() {
  const form = useFormContext<z.infer<typeof briefingSchema>>();

  return (
    <>
      <FormField
        control={form.control}
        name='date'
        render={({ field }) => (
          <FormItem className='flex flex-col'>
            <FormLabel className='w-min'>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      dayjs(field.value).format('MMMM DD, YYYY')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='startTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start time</FormLabel>
            <FormControl>
              <Input {...field} type='time' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

function PracticeForm() {
  const form = useFormContext<z.infer<typeof practiceSchema>>();

  return (
    <Tabs defaultValue='basic-info' className='flex flex-col gap-4'>
      <TabsList className='flex w-full bg-transparent p-0'>
        <TabsTrigger
          value='basic-info'
          className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
        >
          <Settings2Icon className='h-4 w-4' />
          Basic info
        </TabsTrigger>
        <TabsTrigger
          value='server-info'
          className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
        >
          <ServerIcon className='h-4 w-4' />
          Server settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value='basic-info'>
        <div className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='w-min'>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          dayjs(field.value).format('MMMM DD, YYYY')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='startTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <Input {...field} type='time' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='endTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Input {...field} type='time' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
      <TabsContent value='server-info'>
        <div className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='inGameTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>In-game time</FormLabel>
                <FormControl>
                  <Input {...field} type='time' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='serverName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='serverPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server password</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function QualifyingForm({
  stepTwoForm,
}: {
  stepTwoForm: UseFormReturn<z.infer<typeof stepTwoSchema>>;
}) {
  const form = useFormContext<z.infer<typeof qualifyingSchema>>();

  const driverIds = stepTwoForm.getValues('driverIds');

  const { data: drivers, status } = api.user.byId.useQuery(
    { memberIds: driverIds },
    { enabled: !!driverIds }
  );

  return (
    <>
      <Tabs defaultValue='basic-info' className='flex flex-col gap-4'>
        <TabsList className='flex w-full bg-transparent p-0'>
          <TabsTrigger
            value='basic-info'
            className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
          >
            <Settings2Icon className='h-4 w-4' />
            Basic info
          </TabsTrigger>
          <TabsTrigger
            value='server-info'
            className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
          >
            <ServerIcon className='h-4 w-4' />
            Server settings
          </TabsTrigger>
          <TabsTrigger
            value='weather'
            className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
          >
            <CloudIcon className='h-4 w-4' />
            Weather
          </TabsTrigger>
        </TabsList>
        <TabsContent value='basic-info'>
          <div className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='w-min'>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format('MMMM DD, YYYY')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='startTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start time</FormLabel>
                  <FormControl>
                    <Input {...field} type='time' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End time</FormLabel>
                  <FormControl>
                    <Input {...field} type='time' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='driverId'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Driver</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select driver' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-96'>
                      {status === 'loading' && (
                        <div className='flex justify-center py-2'>
                          <Loader2Icon className='h-5 w-5 animate-spin text-slate-300' />
                        </div>
                      )}
                      {drivers?.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className='flex items-center gap-2'>
                            <Flag country={driver.profile?.country} />
                            <span>
                              {driver.firstName?.charAt(0).toUpperCase()}
                              {'. '}
                              {driver.lastName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
        <TabsContent value='server-info'>
          <div className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='inGameTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In-game time</FormLabel>
                  <FormControl>
                    <Input {...field} type='time' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='serverName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='serverPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server password</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
        <TabsContent value='weather'>
          <div className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='includeWeather'
              render={({ field }) => (
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='weather'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor='weather'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Include weather
                  </label>
                </div>
              )}
            />

            {form.watch('includeWeather') && (
              <>
                <FormField
                  control={form.control}
                  name='rainLevel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rain level</FormLabel>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Slider
                            value={isNaNArr(field.value)}
                            onValueChange={v =>
                              field.onChange(v[0]?.toString())
                            }
                            min={0}
                            max={1}
                            step={0.05}
                          />
                          <span>{Number(field.value).toFixed(2)}</span>
                        </div>
                      </FormControl>
                      <FormDescription className='!text-sm'>
                        Between 0 and 1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='cloudLevel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cloud level</FormLabel>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Slider
                            value={isNaNArr(field.value)}
                            onValueChange={v =>
                              field.onChange(v[0]?.toString())
                            }
                            min={0}
                            max={1}
                            step={0.05}
                          />
                          <span>{Number(field.value).toFixed(2)}</span>
                        </div>
                      </FormControl>
                      <FormDescription className='!text-sm'>
                        Between 0 and 1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='randomness'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Randomness</FormLabel>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Slider
                            value={isNaNArr(field.value)}
                            onValueChange={v =>
                              field.onChange(v[0]?.toString())
                            }
                            min={0}
                            max={7}
                            step={1}
                          />
                          <span>{Number(field.value).toFixed(0)}</span>
                        </div>
                      </FormControl>
                      <FormDescription className='!text-sm'>
                        Between 0 and 7
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='temperature'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl>
                        <div className='flex gap-2'>
                          <Slider
                            value={isNaNArr(field.value)}
                            onValueChange={v =>
                              field.onChange(v[0]?.toString())
                            }
                            min={10}
                            max={45}
                            step={1}
                          />
                          <span>{Number(field.value).toFixed(0)}°C</span>
                        </div>
                      </FormControl>
                      <FormDescription className='!text-sm'>
                        Between 10 and 45
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function RaceForm() {
  const form = useFormContext<z.infer<typeof raceSchema>>();

  return <div>race</div>;
}

export const sessionSchema = z.discriminatedUnion('type', [
  briefingSchema,
  practiceSchema,
  qualifyingSchema,
  raceSchema,
]);

export default function SessionForm({
  sessionType,
  onSubmit: handleSubmit,
}: {
  sessionType: SessionType;
  onSubmit: (values: z.infer<typeof sessionSchema>) => void;
}) {
  const [isOpened, setIsOpened] = useState(false);

  const stepTwoForm = useFormContext<z.infer<typeof stepTwoSchema>>();
  const stepThreeForm = useFormContext<z.infer<typeof stepThreeSchema>>();

  const sessions = stepThreeForm.getValues('sessions');
  const lastSessionDate = [...sessions].pop()?.date;

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      type: sessionType,
      date: lastSessionDate,
      startTime: '',
      endTime: '',
      serverName: '',
      serverPassword: '',
      rainLevel: '0',
      cloudLevel: '0',
      randomness: '0',
      temperature: '10',
    },
  });

  const sessionTypeMap: Record<SessionType, ReactNode> = useMemo(
    () => ({
      briefing: <BriefingForm />,
      practice: <PracticeForm />,
      qualifying: <QualifyingForm stepTwoForm={stepTwoForm} />,
      race: <RaceForm />,
    }),
    [stepTwoForm]
  );

  return (
    <ResponsiveDialog
      key={sessionType}
      open={isOpened}
      onOpenChange={setIsOpened}
      title={`Create ${sessionType} session`}
      trigger={
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          {capitalize(sessionType)}
        </DropdownMenuItem>
      }
    >
      <FormProvider {...form}>
        <form
          onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            await form.handleSubmit(values => {
              setIsOpened(false);
              handleSubmit(values);
            })();
          }}
        >
          <div className='mx-auto flex max-w-sm flex-col gap-4 px-4 pb-4 text-slate-50 md:px-0 md:pb-0'>
            {sessionTypeMap[sessionType]}
            <Button>Submit</Button>
          </div>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
