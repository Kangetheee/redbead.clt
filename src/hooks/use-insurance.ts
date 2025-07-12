import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createUnderwriterAction,
  getUnderwritersAction,
  getUnderwriterByIdAction,
  updateUnderwriterAction,
  createInsuranceTypeAction,
  getInsuranceTypesAction,
  getInsuranceTypeByIdAction,
  updateInsuranceTypeAction,
  createInsurancePlanAction,
  getInsurancePlansAction,
  getInsurancePlanByIdAction,
  updateInsurancePlanAction,
} from "@/lib/insurance/insurance.actions";
import {
  CreateUnderwriterDto,
  UpdateUnderwriterDto,
  CreateInsuranceTypeDto,
  UpdateInsuranceTypeDto,
  CreateInsurancePlanDto,
  UpdateInsurancePlanDto,
} from "@/lib/insurance/dto/insurance.dto";

// Query Keys
const INSURANCE_KEYS = {
  all: ["insurance"] as const,
  underwriters: () => [...INSURANCE_KEYS.all, "underwriters"] as const,
  underwriter: (id: string) => [...INSURANCE_KEYS.underwriters(), id] as const,
  types: () => [...INSURANCE_KEYS.all, "types"] as const,
  type: (id: string) => [...INSURANCE_KEYS.types(), id] as const,
  plans: () => [...INSURANCE_KEYS.all, "plans"] as const,
  plan: (id: string) => [...INSURANCE_KEYS.plans(), id] as const,
};

// Underwriter Hooks
export function useUnderwriters(query?: string) {
  return useQuery({
    queryKey: [...INSURANCE_KEYS.underwriters(), query],
    queryFn: async () => {
      const res = await getUnderwritersAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useUnderwriter(id: string) {
  return useQuery({
    queryKey: INSURANCE_KEYS.underwriter(id),
    queryFn: async () => {
      const res = await getUnderwriterByIdAction(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateUnderwriter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUnderwriterDto) => {
      const res = await createUnderwriterAction(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Underwriter created successfully");
      queryClient.invalidateQueries({
        queryKey: INSURANCE_KEYS.underwriters(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create underwriter");
    },
  });
}

export function useUpdateUnderwriter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUnderwriterDto) => {
      const res = await updateUnderwriterAction(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Underwriter updated successfully");
      queryClient.invalidateQueries({
        queryKey: INSURANCE_KEYS.underwriter(id),
      });
      queryClient.invalidateQueries({
        queryKey: INSURANCE_KEYS.underwriters(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update underwriter");
    },
  });
}

// Insurance Type Hooks
export function useInsuranceTypes(query?: string) {
  return useQuery({
    queryKey: [...INSURANCE_KEYS.types(), query],
    queryFn: async () => {
      const res = await getInsuranceTypesAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useInsuranceType(id: string) {
  return useQuery({
    queryKey: INSURANCE_KEYS.type(id),
    queryFn: async () => {
      const res = await getInsuranceTypeByIdAction(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInsuranceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInsuranceTypeDto) => {
      const res = await createInsuranceTypeAction(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Insurance type created successfully");
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.types() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create insurance type");
    },
  });
}

export function useUpdateInsuranceType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInsuranceTypeDto) => {
      const res = await updateInsuranceTypeAction(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Insurance type updated successfully");
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.type(id) });
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.types() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update insurance type");
    },
  });
}

// Insurance Plan Hooks
export function useInsurancePlans(query?: string) {
  return useQuery({
    queryKey: [...INSURANCE_KEYS.plans(), query],
    queryFn: async () => {
      const res = await getInsurancePlansAction(query);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useInsurancePlan(id: string) {
  return useQuery({
    queryKey: INSURANCE_KEYS.plan(id),
    queryFn: async () => {
      const res = await getInsurancePlanByIdAction(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInsurancePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInsurancePlanDto) => {
      const res = await createInsurancePlanAction(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Insurance plan created successfully");
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.plans() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create insurance plan");
    },
  });
}

export function useUpdateInsurancePlan(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInsurancePlanDto) => {
      const res = await updateInsurancePlanAction(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Insurance plan updated successfully");
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.plan(id) });
      queryClient.invalidateQueries({ queryKey: INSURANCE_KEYS.plans() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update insurance plan");
    },
  });
}
