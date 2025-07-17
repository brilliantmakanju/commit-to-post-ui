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
import {
	type OrganizationSettingsFormValues,
	organizationSettingsSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { updateOrganization } from "@/server-actions/organizations/update-organization";
import useOrganizationStore from "@/zustand/useorganization-store";

// Minimalist General Settings Form
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
		<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
			<div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			<div className="relative p-8">
				<div className="mb-6">
					<h3 className="text-lg font-medium text-zinc-100">
						Organization Details
					</h3>
					<p className="text-sm text-zinc-400">
						Update your organization information
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-zinc-300">
											Organization Name
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isFetching || isSubmitting}
												className="border-zinc-700/50 bg-zinc-800/30 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-800/50 focus:ring-1 focus:ring-zinc-500/20"
												placeholder="Enter organization name"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-zinc-300">
											Description
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={3}
												value={field.value || ""}
												disabled={isFetching || isSubmitting}
												className="resize-none border-zinc-700/50 bg-zinc-800/30 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-800/50 focus:ring-1 focus:ring-zinc-500/20"
												placeholder="Brief description of your organization"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end pt-4">
							<Button
								type="submit"
								variant="default"
								disabled={!isFormChanged || isFetching || isSubmitting}
								className="bg-zinc-100 font-medium text-zinc-900 transition-all duration-200 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500"
							>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Saving...</span>
									</div>
								) : (
									<div className="flex items-center gap-2">
										<Save className="h-4 w-4" />
										<span>Save Changes</span>
									</div>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
