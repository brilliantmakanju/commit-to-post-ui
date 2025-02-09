"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCookie } from "@/lib/cookies/create-cookies";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import {
	OrganizationSettingsFormValues,
	organizationSettingsSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { updateOrganization } from "@/server-actions/organizations/update-organization";

export function GeneralSettingsForm({ isFetching }: { isFetching: boolean }) {
	const { organization, setOrganization } = useOrganizationStore();
	const queryClient = useQueryClient();

	const form = useForm<OrganizationSettingsFormValues>({
		resolver: zodResolver(organizationSettingsSchema),
		defaultValues: {
			name: organization.name || "",
			description: organization.description || "",
		},
	});

	// Update form values when organization changes
	useEffect(() => {
		if (organization) {
			form.reset({
				name: organization.name,
				description: organization.description,
			});
		}
	}, [organization, form]);

	const onSubmit = async (data: OrganizationSettingsFormValues) => {
		try {
			// Create an object with only the changed fields
			const changedFields: Partial<OrganizationSettingsFormValues> = {};

			if (data.name !== organization.name) {
				changedFields.name = data.name;
			}

			if (data.description !== organization.description) {
				changedFields.description = data.description;
			}
			// Only make the API call if there are changes
			if (Object.keys(changedFields).length > 0) {
				const response = await updateOrganization(changedFields);

				if (response.success) {
					// Clear previous state
					// useOrganizationStore.getState().clearOrganization();

					// Function to invalidate organizations query
					queryClient.invalidateQueries({ queryKey: ["organizations"] });

					// Set new state
					setOrganization(response.data.organization);
					await updateCookie("organization", {
						domain: response.data.organization.domain,
					});
					toast.success("Organization updated successfully");
				} else {
					toast.error(
						response.error?.non_field_errors?.[0] || response.message,
					);
				}
			}
		} catch {
			toast.error("Failed to update organization");
		}
	};

	// Check if form values are different from current organization
	const isFormChanged =
		form.watch("name") !== organization.name ||
		form.watch("description") !== organization.description;

	if (!organization) return;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-[#6B7280]">
								Organization Name
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									className="border-gray-200 bg-transparent"
									disabled={isFetching}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-[#6B7280]">Description</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									rows={4}
									disabled={isFetching}
									className="border-gray-200 bg-transparent"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end pt-4">
					<Button type="submit" disabled={!isFormChanged || isFetching}>
						Save Changes
					</Button>
				</div>
			</form>
		</Form>
	);
}
