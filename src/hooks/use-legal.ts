import { CreateLegalDto } from "@/lib/legal/dto/legal.dto";
import {
  createLegalAction,
  getLegalAction,
  updateLegalAction,
} from "@/lib/legal/legal.actions";
import { LegalTypeEnum } from "@/lib/legal/types/legal.types";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const queryKey: QueryKey = ["legal"];

export function useLegal(type: LegalTypeEnum) {
  const { data, isError, error, isPending } = useQuery({
    queryKey: [...queryKey, type],
    queryFn: async () => {
      const res = await getLegalAction(type);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return {
    legal: data,
    legalError: isError ? error.message : undefined,
    isLegalLoading: isPending,
  };
}

type Props = {
  id?: string;
  onSuccess?: () => void;
  canUpdate?: boolean;
  type: LegalTypeEnum;
};

export function useLegalUpdate({ id, onSuccess, canUpdate, type }: Props) {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async (values: CreateLegalDto) => {
      if (id) {
        if (!canUpdate)
          throw new Error(
            "You are not authorized to update this legal document"
          );
        const res = await updateLegalAction(id, values);
        if (!res.success) throw new Error(res.error);
        return res;
      }
      const res = await createLegalAction(values);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey, type] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    isLegalUpdating: isPending,
    updateLegal: mutate,
  };
}
