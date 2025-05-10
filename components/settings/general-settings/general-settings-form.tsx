"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
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
	type OrganizationSettingsFormValues,
	organizationSettingsSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { updateOrganization } from "@/server-actions/organizations/update-organization";

export function GeneralSettingsForm({ isFetching }: { isFetching: boolean }) {
	const { organization, setOrganization } = useOrganizationStore();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<OrganizationSettingsFormValues>({
		resolver: zodResolver(organizationSettingsSchema),
		defaultValues: {
			name: organization.name || "",
			description: organization.description || "",
		},
	});

	useEffect(() => {
		if (organization) {
			form.reset({
				name: organization.name,
				description: organization.description,
			});
		}
	}, [organization, form]);

	const onSubmit = async (data: OrganizationSettingsFormValues) => {
		setIsSubmitting(true);
		try {
			const changedFields: Partial<OrganizationSettingsFormValues> = {};

			if (data.name !== organization.name) {
				changedFields.name = data.name;
			}

			if (data.description !== organization.description) {
				changedFields.description = data.description;
			}

			if (Object.keys(changedFields).length > 0) {
				const response = await updateOrganization(changedFields);

				if (response.success) {
					queryClient.invalidateQueries({ queryKey: ["organizations"] });
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
		} finally {
			setIsSubmitting(false);
		}
	};

	const nameChanged = form.watch("name") !== organization.name;
	const descriptionValue = form.watch("description");
	const descriptionChanged =
		descriptionValue !== "" && descriptionValue !== organization.description;

	const isFormChanged = nameChanged || descriptionChanged;

	if (!organization) return;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="font-medium text-zinc-300">
									Organization Name
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={isFetching || isSubmitting}
										className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
										placeholder="Your organization name"
									/>
								</FormControl>
								<FormMessage className="text-red-400" />
							</FormItem>
						)}
					/>

					<div className="md:col-span-2">
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-zinc-300">
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={3}
											value={field.value || ""}
											disabled={isFetching || isSubmitting}
											className="resize-none border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
											placeholder="Brief description of your organization"
										/>
									</FormControl>
									<FormMessage className="text-red-400" />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="flex justify-end pt-4">
					<Button
						type="submit"
						variant="default"
						disabled={!isFormChanged || isFetching || isSubmitting}
						className="bg-[#4F46E5] text-white transition-all duration-200 hover:bg-[#4338CA] disabled:bg-[#232323] disabled:text-zinc-500"
					>
						{isSubmitting ? (
							<div className="flex items-center">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								<span>Saving...</span>
							</div>
						) : (
							<div className="flex items-center">
								<Save className="mr-2 h-4 w-4" />
								<span>Save Changes</span>
							</div>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
