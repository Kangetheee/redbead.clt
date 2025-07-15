import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomizationOptionsAction,
  getCustomizationOptionAction,
  getCustomizationOptionsByCategoryAction,
  createCustomizationOptionAction,
  updateCustomizationOptionAction,
  deleteCustomizationOptionAction,
  getCustomizationValuesAction,
  getCustomizationValueAction,
  createCustomizationValueAction,
  updateCustomizationValueAction,
  deleteCustomizationValueAction,
} from "@/lib/customization/options.actions";
import {
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  GetCustomizationOptionsDto,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  GetCustomizationValuesDto,
} from "@/lib/customization/dto/options.dto";

// Customization Options
export const useCustomizationOptions = (
  params?: GetCustomizationOptionsDto
) => {
  return useQuery({
    queryKey: ["customization-options", params],
    queryFn: () => getCustomizationOptionsAction(params),
  });
};

export const useCustomizationOption = (optionId: string) => {
  return useQuery({
    queryKey: ["customization-options", optionId],
    queryFn: () => getCustomizationOptionAction(optionId),
    enabled: !!optionId,
  });
};

export const useCustomizationOptionsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["customization-options", "category", categoryId],
    queryFn: () => getCustomizationOptionsByCategoryAction(categoryId),
    enabled: !!categoryId,
  });
};

export const useCreateCustomizationOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomizationOptionDto) =>
      createCustomizationOptionAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};

export const useUpdateCustomizationOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      data,
    }: {
      optionId: string;
      data: UpdateCustomizationOptionDto;
    }) => updateCustomizationOptionAction(optionId, data),
    onSuccess: (_, { optionId }) => {
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-options", optionId],
      });
    },
  });
};

export const useDeleteCustomizationOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) => deleteCustomizationOptionAction(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};

// Customization Values
export const useCustomizationValues = (params?: GetCustomizationValuesDto) => {
  return useQuery({
    queryKey: ["customization-values", params],
    queryFn: () => getCustomizationValuesAction(params),
  });
};

export const useCustomizationValue = (valueId: string) => {
  return useQuery({
    queryKey: ["customization-values", valueId],
    queryFn: () => getCustomizationValueAction(valueId),
    enabled: !!valueId,
  });
};

export const useCreateCustomizationValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomizationValueDto) =>
      createCustomizationValueAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customization-values"] });
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};

export const useUpdateCustomizationValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      valueId,
      data,
    }: {
      valueId: string;
      data: UpdateCustomizationValueDto;
    }) => updateCustomizationValueAction(valueId, data),
    onSuccess: (_, { valueId }) => {
      queryClient.invalidateQueries({ queryKey: ["customization-values"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-values", valueId],
      });
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};

export const useDeleteCustomizationValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => deleteCustomizationValueAction(valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customization-values"] });
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};
