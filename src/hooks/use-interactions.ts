import { CreateInteractionDto } from "@/lib/interactions/dto/interaction.dto";
import {
  createInteractionAction,
  getInteractionsAction,
} from "@/lib/interactions/interaction.actions";
import { tags } from "@/lib/shared/constants";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { diff } from "deep-object-diff";
import { toast } from "sonner";
import useUpdateSearchParams from "./use-update-search-params";

const queryKey: QueryKey = [tags.INTERACTION];

export function useInteraction(clientId?: string) {
  const { getSearchParams } = useUpdateSearchParams();

  let searchParams = getSearchParams();

  if (clientId) {
    if (!searchParams) searchParams = `clientId=${clientId}`;
    else searchParams = `${searchParams}&clientId=${clientId}`;
  }

  return useQuery({
    queryKey: [...queryKey, { searchParams }],
    queryFn: async () => {
      const res = await getInteractionsAction(searchParams);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useCreateInteraction({
  defaultValues,
  interactionId,
  onSuccess,
}: {
  defaultValues: CreateInteractionDto;
  interactionId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateInteractionDto) => {
      const data = interactionId
        ? (diff(defaultValues, values) as CreateInteractionDto)
        : values;

      const res = await createInteractionAction({ ...data }, interactionId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        `Interaction ${interactionId ? "updated" : "created"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: [...queryKey] });
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  });
}
