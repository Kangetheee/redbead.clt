import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getUsersAction,
  getUserAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  getUserProfileAction,
  updateUserProfileAction,
} from "@/lib/users/users.actions";
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
} from "@/lib/users/dto/users.dto";
import { UserOption } from "@/lib/users/types/users.types";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersDto) => [...userKeys.lists(), { ...params }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
} as const;

// Hooks for fetching users
export function useUsers(params?: GetUsersDto) {
  const defaultParams: GetUsersDto = { page: 1, limit: 10 };
  const queryParams = { ...defaultParams, ...params };

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => getUsersAction(queryParams),
    select: (data) => (data.success ? data.data : null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching user details
export function useUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserAction(userId),
    select: (data) => (data.success ? data.data : null),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching current user profile
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getUserProfileAction,
    select: (data) => (data.success ? data.data : null),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export async function fetchUserProfile() {
  const response = await getUserProfileAction();
  return response.success ? response.data : null;
}

// Hook for user search/autocomplete
export function useUserSearch(options?: {
  isAdmin?: boolean;
  enabled?: boolean;
}) {
  const { isAdmin = false, enabled = true } = options || {};

  const searchParams: GetUsersDto = {
    page: 1,
    limit: 100,
    isActive: true,
  };

  return useQuery({
    queryKey: userKeys.list(searchParams),
    queryFn: () => getUsersAction(searchParams),
    select: (data): UserOption[] => {
      if (!data.success) return [];

      return data.data.items
        .filter((user) => !isAdmin || user.role.name !== "Customer")
        .map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
          role: user.role.name,
        }));
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation for creating users
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => createUserAction(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        toast.success("User created successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

// Mutation for updating users
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      updateUserAction(userId, data),
    onSuccess: (result, { userId }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
        toast.success("User updated successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

// Mutation for updating current user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => updateUserProfileAction(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Mutation for deleting users
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUserAction(userId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        toast.success("User deleted successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}
