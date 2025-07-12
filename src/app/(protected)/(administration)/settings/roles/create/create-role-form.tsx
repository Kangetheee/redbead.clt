"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormInput from "@/components/ui/form-input";
import FormModuleSelector from "@/components/ui/form-module-selector";
import FormTextArea from "@/components/ui/form-textarea";
import { CreateRoleDto, createRoleSchema } from "@/lib/roles/dto/roles.dto";
import { createRoleAction, deleteRoleAction } from "@/lib/roles/role.actions";
import { Module } from "@/lib/roles/types/roles.types";
import { tags } from "@/lib/shared/constants";

type Props = {
  modules: Module[];
  roleId?: string;
  values?: CreateRoleDto;
  canUpdate?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
};

export default function CreateRoleForm({
  modules,
  roleId,
  values,
  canUpdate = false,
  canDelete = false,
  canCreate = false,
}: Props) {
  const canEdit = canUpdate || canCreate;
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateRoleDto>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: values ?? { name: "", description: "", permissions: [] },
  });

  const { control, handleSubmit, reset } = form;

  const { isPending, mutate } = useMutation({
    mutationFn: async (values: CreateRoleDto) => {
      if (!canEdit)
        throw new Error("You are not authorized to create/update this role");
      const res = await createRoleAction(values, roleId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onError: ({ message }) => toast.error(message),
    onSuccess: () => {
      toast.success(`Role ${roleId ? "updated" : "created"} successfully`);
      reset();
      queryClient.invalidateQueries({ queryKey: [tags.ROLE] });
      router.replace("/settings/roles");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleID: string) => {
      if (!canDelete)
        throw new Error("You are not authorized to delete this role");
      const res = await deleteRoleAction(roleID);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onError: ({ message }) => toast.error(message),
    onSuccess: () => {
      toast.success(`Role deleted successfully`);
      reset();
      queryClient.invalidateQueries({ queryKey: [tags.ROLE] });
      router.replace("/settings/roles");
    },
  });

  return (
    <div className="-space-y-4">
      {!!roleId && canDelete && (
        <div className="flex justify-end">
          <FormButton
            variant="destructive"
            onClick={() => deleteMutation.mutate(roleId)}
            isLoading={deleteMutation.isPending}
          >
            Delete Role
          </FormButton>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={handleSubmit((values) => mutate(values))}
          className="space-y-8 p-8"
          noValidate
        >
          <div className="max-w-lg space-y-8">
            <FormInput
              control={control}
              name="name"
              label="Name"
              placeholder="Enter role name"
              className="max-w-screen-sm"
              required
            />
            <FormTextArea
              control={control}
              name="description"
              label="Description"
              placeholder="Enter role description"
            />
          </div>

          <FormModuleSelector
            control={control}
            name="permissions"
            label="Select Modules"
            options={modules}
            required
          />

          {canEdit && (
            <FormButton isLoading={isPending}>
              {roleId ? "Update" : "Create"} Role
            </FormButton>
          )}
        </form>
      </Form>
    </div>
  );
}
