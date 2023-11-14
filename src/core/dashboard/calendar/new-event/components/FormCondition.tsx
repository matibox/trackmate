import { type z } from 'zod';
import { type games } from '~/lib/constants';
import { type sessionSchema } from './StepFourSingle';
import { useCallback, type ReactNode } from 'react';
import { useNewEvent } from '../store/newEventStore';

type Game = (typeof games)[number];
type Session = z.infer<typeof sessionSchema>['type'];

type GameCondition = {
  type: 'games';
  games: Game[];
};

type SessionsCondition = {
  type: 'sessions';
  sessions: Session[];
  currentSession: Session;
};

type BothConditions = {
  type: 'both';
  games: Game[];
  sessions: Session[];
  currentSession: Session;
};

type ConditionalFormProps = (
  | GameCondition
  | SessionsCondition
  | BothConditions
) & { children: ReactNode };

export default function FormCondition(props: ConditionalFormProps) {
  const {
    steps: { stepTwoSingle },
  } = useNewEvent();

  const gamesCheck = useCallback(
    (games: Game[]) => !stepTwoSingle || !games.includes(stepTwoSingle.game),
    [stepTwoSingle]
  );

  const sessionsCheck = useCallback(
    (sessions: Session[], currentSession: Session) =>
      !sessions.includes(currentSession),
    []
  );

  if (props.type === 'games') {
    const { games, children } = props;
    if (gamesCheck(games)) return <></>;
    return <>{children}</>;
  }

  if (props.type === 'sessions') {
    const { sessions, currentSession, children } = props;
    if (sessionsCheck(sessions, currentSession)) return <></>;
    return <>{children}</>;
  }

  if (props.type === 'both') {
    const { games, sessions, currentSession, children } = props;
    if (gamesCheck(games) || sessionsCheck(sessions, currentSession))
      return <></>;
    return <>{children}</>;
  }
}
