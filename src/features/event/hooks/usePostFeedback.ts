import { useState } from 'react';
import { z } from 'zod';
import { cornerParts, steers } from '~/constants/constants';
import crypto from 'crypto';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import useForm from '~/hooks/useForm';

export const problemSchema = z.object({
  id: z.string(),
  corner: z.number().min(1, 'Corner number must be positive'),
  cornerPart: z.enum(cornerParts),
  steer: z.enum(steers),
  notes: z.string().optional(),
});

type Problem = z.infer<typeof problemSchema>;

const generateDefaultProblem = (): Problem => ({
  id: crypto.randomBytes(8).toString('hex'),
  corner: 1,
  cornerPart: 'entry',
  steer: 'oversteer',
});

export default function usePostFeedback({
  setupId,
}: {
  setupId: string | undefined;
}) {
  const [problems, setProblems] = useState<Problem[]>([]);

  function addProblem() {
    setProblems(prev => [...prev, generateDefaultProblem()]);
  }

  function updateProblem<K extends keyof Omit<Problem, 'id'>>({
    id,
    property,
    value,
  }: {
    id: string;
    property: K;
    value: Omit<Problem, 'id'>[K];
  }) {
    setProblems(prev =>
      prev.map(problem => {
        if (problem.id === id) {
          return {
            ...problem,
            [property]: value,
          };
        }
        return problem;
      })
    );
  }

  function deleteProblem({ id }: { id: string }) {
    setProblems(prev => prev.filter(problem => problem.id !== id));
  }

  const { Error, setError } = useError();
  const utils = api.useContext();

  const { mutate: postFeedback, isLoading } =
    api.setup.postFeedback.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
        close();
      },
    });

  const { errors, handleSubmit } = useForm(
    z.object({
      problems: z
        .array(problemSchema)
        .min(1, 'There has to be at least 1 problem.'),
    }),
    ({ problems }) => {
      if (!setupId) return;
      postFeedback({ setupId, problems });
    }
  );

  return {
    problems,
    addProblem,
    updateProblem,
    deleteProblem,
    Error,
    isLoading,
    errors,
    handleSubmit,
  };
}
