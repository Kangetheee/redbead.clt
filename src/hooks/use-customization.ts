import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomizationOptionsAction,
  getCustomizationOptionAction,
  createCustomizationOptionAction,
  updateCustomizationOptionAction,
  deleteCustomizationOptionAction,
  assignOptionToTemplateAction,
  removeOptionFromTemplateAction,
  getCustomizationValuesAction,
  getCustomizationValueAction,
  getCustomizationValuesByOptionAction,
  getCustomizationValuesByTemplateAction,
  getCustomizationValueStatsAction,
  calculatePriceAdjustmentAction,
  validateCustomizationsAction,
  createCustomizationValueAction,
  updateCustomizationValueAction,
  deleteCustomizationValueAction,
  restoreCustomizationValueAction,
} from "@/lib/customization/options.actions";
import {
  CreateCustomizationOptionDto,
  UpdateCustomizationOptionDto,
  GetCustomizationOptionsDto,
  AssignOptionToTemplateDto,
  CreateCustomizationValueDto,
  UpdateCustomizationValueDto,
  GetCustomizationValuesDto,
  CalculatePriceAdjustmentDto,
  ValidateCustomizationsDto,
  GetCustomizationValueStatsDto,
} from "@/lib/customization/dto/options.dto";

// ===== Customization Options Hooks =====

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

export const useAssignOptionToTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      data,
    }: {
      optionId: string;
      data: AssignOptionToTemplateDto;
    }) => assignOptionToTemplateAction(optionId, data),
    onSuccess: (_, { optionId }) => {
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-options", optionId],
      });
    },
  });
};

export const useRemoveOptionFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      optionId,
      templateId,
    }: {
      optionId: string;
      templateId: string;
    }) => removeOptionFromTemplateAction(optionId, templateId),
    onSuccess: (_, { optionId }) => {
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-options", optionId],
      });
    },
  });
};

// ===== Customization Values Hooks =====

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

export const useCustomizationValuesByOption = (optionId: string) => {
  return useQuery({
    queryKey: ["customization-values", "by-option", optionId],
    queryFn: () => getCustomizationValuesByOptionAction(optionId),
    enabled: !!optionId,
  });
};

export const useCustomizationValuesByTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ["customization-values", "by-template", templateId],
    queryFn: () => getCustomizationValuesByTemplateAction(templateId),
    enabled: !!templateId,
  });
};

export const useCustomizationValueStats = (
  params?: GetCustomizationValueStatsDto
) => {
  return useQuery({
    queryKey: ["customization-values", "stats", params],
    queryFn: () => getCustomizationValueStatsAction(params),
  });
};

export const useCalculatePriceAdjustment = () => {
  return useMutation({
    mutationFn: (data: CalculatePriceAdjustmentDto) =>
      calculatePriceAdjustmentAction(data),
  });
};

export const useValidateCustomizations = () => {
  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: ValidateCustomizationsDto;
    }) => validateCustomizationsAction(templateId, data),
  });
};

export const useCreateCustomizationValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomizationValueDto) =>
      createCustomizationValueAction(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["customization-values"] });
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-values", "by-option", data.optionId],
      });
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

export const useRestoreCustomizationValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => restoreCustomizationValueAction(valueId),
    onSuccess: (_, valueId) => {
      queryClient.invalidateQueries({ queryKey: ["customization-values"] });
      queryClient.invalidateQueries({
        queryKey: ["customization-values", valueId],
      });
      queryClient.invalidateQueries({ queryKey: ["customization-options"] });
    },
  });
};
