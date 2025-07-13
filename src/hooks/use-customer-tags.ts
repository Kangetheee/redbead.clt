import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerTagsAction,
  getCustomerTagAction,
  createCustomerTagAction,
  updateCustomerTagAction,
  deleteCustomerTagAction,
} from "@/lib/customers/customer-tags.actions";
import {
  CreateCustomerTagDto,
  UpdateCustomerTagDto,
} from "@/lib/customers/dto/customer-tag.dto";

export const useCustomerTags = () => {
  return useQuery({
    queryKey: ["customer-tags"],
    queryFn: () => getCustomerTagsAction(),
  });
};

export const useCustomerTag = (tagId: string) => {
  return useQuery({
    queryKey: ["customer-tags", tagId],
    queryFn: () => getCustomerTagAction(tagId),
    enabled: !!tagId,
  });
};

export const useCreateCustomerTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerTagDto) => createCustomerTagAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-tags"] });
    },
  });
};

export const useUpdateCustomerTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tagId,
      data,
    }: {
      tagId: string;
      data: UpdateCustomerTagDto;
    }) => updateCustomerTagAction(tagId, data),
    onSuccess: (_, { tagId }) => {
      queryClient.invalidateQueries({ queryKey: ["customer-tags"] });
      queryClient.invalidateQueries({ queryKey: ["customer-tags", tagId] });
    },
  });
};

export const useDeleteCustomerTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteCustomerTagAction(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-tags"] });
    },
  });
};
