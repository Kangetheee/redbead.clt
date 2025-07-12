"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { diff } from "deep-object-diff";
import { ArrowLeft, Lock, Mail, User, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import FormButton from "@/components/ui/form-button";
import FormCombobox from "@/components/ui/form-combobox";
import FormInput from "@/components/ui/form-input";
import FormPhoneInput from "@/components/ui/form-phone-input";
import FormSwitch from "@/components/ui/form-switch";
import { getRolesAction } from "@/lib/roles/role.actions";
import { tags } from "@/lib/shared/constants";
import {
  CreateUserDto,
  createUserSchema,
  UpdateUserDto,
} from "@/lib/users/dto/users.dto";
import { createUserAction, updateUserAction } from "@/lib/users/users.actions";

type Props = {
  update?: {
    defaultValues: CreateUserDto;
    userId: string;
  };
  canUpdate?: boolean;
  canCreate?: boolean;
};

export default function CreateUserForm({
  update,
  canUpdate,
  canCreate,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // const canEdit = canUpdate && !!update;
  const canEdit = canUpdate || canCreate;

  const rolesQuery = useQuery({
    queryKey: [tags.ROLE],
    queryFn: async () => {
      const res = await getRolesAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  const form = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: update?.defaultValues,
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (values: CreateUserDto) => {
      if (!!update) {
        if (!canUpdate)
          throw new Error("You are not authorized to update this user");

        const data = diff(update.defaultValues, values) as UpdateUserDto;
        const res = await updateUserAction(update.userId, { ...data });
        if (!res.success) throw res.error;
        return res.data;
      }

      if (!canCreate) throw new Error("You are not authorized to create users");

      const res = await createUserAction(values);
      if (!res.success) throw res.error;
      return res.data;
    },
    onError: ({ message }) => toast.error("Error", { description: message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tags.USER] });
      toast.success(`User ${!!update ? "updated" : "created"} successfully`);
      form.reset();
      router.replace("/settings/users");
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {!!update ? "Update User" : "Create New User"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {!!update
              ? "Update existing user information"
              : "Add a new user to the system"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className="space-y-8"
          noValidate
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the user&apos;s personal and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Enter full name"
                  required
                  icon={<User className="size-4 text-muted-foreground" />}
                />
                <FormInput
                  control={form.control}
                  name="username"
                  label="Username"
                  placeholder="Enter username"
                  required
                  icon={<UserCog className="size-4 text-muted-foreground" />}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormPhoneInput
                  control={form.control}
                  name="phone"
                  label="Phone Number"
                  required
                  // icon={<Phone className="size-4 text-muted-foreground" />}
                />
                <FormInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  placeholder="Enter email address"
                  type="email"
                  required
                  icon={<Mail className="size-4 text-muted-foreground" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Security
              </CardTitle>
              <CardDescription>
                Set up secure access credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder={
                    !!update ? "Leave blank to keep current" : "Enter password"
                  }
                  required={!update}
                  icon={<Lock className="size-4 text-muted-foreground" />}
                />
                <FormInput
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder={
                    !!update
                      ? "Leave blank to keep current"
                      : "Confirm password"
                  }
                  required={!update}
                  icon={<Lock className="size-4 text-muted-foreground" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="size-5" />
                Role & Status
              </CardTitle>
              <CardDescription>
                Assign user role and set account status
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormCombobox
                  control={form.control}
                  name="roleId"
                  label="Role"
                  placeholder="Select role"
                  isLoading={rolesQuery.isLoading}
                  key={rolesQuery.data?.results
                    ?.map(({ name }) => name)
                    .join("_")}
                  options={
                    rolesQuery.data?.results?.map(({ name, id }) => ({
                      label: name,
                      value: id,
                    })) || []
                  }
                  required
                  icon={<UserCog className="size-4 text-muted-foreground" />}
                />
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label="Active Status"
                  description="Whether this user account is active"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            {canEdit && (
              <FormButton
                isLoading={isPending}
                loadingText={!!update ? "Updating..." : "Creating..."}
                variant="default"
              >
                {!!update ? "Update User" : "Create User"}
              </FormButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
