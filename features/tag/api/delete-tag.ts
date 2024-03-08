import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { deleteTagByID } from '../actions';

type UseDeleteTagOptions = {
  config?: UseMutationOptions<typeof deleteTagByID>;
};

export const useDeleteTag = (id: string, config?: UseDeleteTagOptions) => {
  return useMutation({
    ...config,
    mutationKey: ['tag', id],
    mutationFn: (id: string) => deleteTagByID(id),
  });
};
