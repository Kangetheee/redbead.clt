import {
  createClientAction,
  getClientAction,
  getClientRelationsAction,
  getClientsAction,
  updateClientRelationAction,
} from "@/lib/clients/client.actions";
import { CreateClientDto } from "@/lib/clients/dto/client.dto";
import { ClientRelationship } from "@/lib/clients/types/client.types";
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

const queryKey: QueryKey = [tags.CLIENT];

export function useClient(clientId?: string) {
  return useQuery({
    queryKey: [...queryKey, { clientId }],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");
      const res = await getClientAction(clientId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!clientId,
  });
}

export function useClientRelationships(
  clientId: string,
  type: ClientRelationship
) {
  const { getSearchParams } = useUpdateSearchParams();
  const params = getSearchParams();

  const searchQuery = params ? `${params}&type=${type}` : `type=${type}`;

  return useQuery({
    queryKey: [...queryKey, { clientId, searchQuery }],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");
      const res = await getClientRelationsAction(clientId, searchQuery);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useClientUpdate({
  defaultValues,
  clientId,
  onSuccess,
  type,
}: {
  defaultValues: CreateClientDto;
  clientId?: string;
  onSuccess?: () => void;
  type?: ClientRelationship;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateClientDto) => {
      if (!!type && !!clientId) {
        const res = await updateClientRelationAction(clientId, {
          ...values,
          type,
        });
        if (!res.success) throw new Error(res.error);
        return res;
      }
      const data = diff(defaultValues, values) as CreateClientDto;

      const res = await createClientAction({ ...data }, clientId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success(`Client ${clientId ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: [...queryKey, { clientId }] });
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useClients(query?: string) {
  const { getSearchParams } = useUpdateSearchParams();
  const params = getSearchParams();

  const searchParams = query ?? params;

  return useQuery({
    queryKey: [...queryKey, { searchParams }],
    queryFn: async () => {
      const res = await getClientsAction(searchParams);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useUpdateClient(clientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedFields: Partial<CreateClientDto>) => {
      const res = await createClientAction(updatedFields, clientId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey, { clientId }] });
    },
  });
}
