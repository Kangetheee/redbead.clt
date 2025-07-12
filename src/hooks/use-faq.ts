import { CreateFaqDto } from "@/lib/faqs/dto/faq.dto";
import {
  createFaqAction,
  deleteFaqAction,
  getFaqsAction,
  updateFaqAction,
} from "@/lib/faqs/faqs.action";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const queryKey: QueryKey = ["faqs"];

export function useFaqs(query?: string) {
  const { data, isError, error, isPending } = useQuery({
    queryKey: [...queryKey, query],
    queryFn: async () => {
      const res = await getFaqsAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return {
    faqs: data,
    faqsError: isError ? error?.message : undefined,
    isFaqsLoading: isPending,
  };
}

type UpdateProps = {
  id?: string;
  onSuccess?: () => void;
  canUpdate?: boolean;
};

export function useFaqUpdate({ id, onSuccess, canUpdate }: UpdateProps) {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async (values: CreateFaqDto) => {
      if (id) {
        if (!canUpdate)
          throw new Error("You are not authorized to update this FAQ");
        const res = await updateFaqAction(id, values);
        if (!res.success) throw new Error(res.error);
        return res;
      }
      const res = await createFaqAction(values);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(
        id ? "FAQ updated successfully" : "FAQ created successfully"
      );
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    isFaqUpdating: isPending,
    updateFaq: mutate,
  };
}

type DeleteProps = {
  onSuccess?: () => void;
};

export function useFaqDelete({ onSuccess }: DeleteProps = {}) {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFaqAction(id);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("FAQ deleted successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    isFaqDeleting: isPending,
    deleteFaq: mutate,
  };
}
