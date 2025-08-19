"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	OrganizationFormValues,
	organizationSchema,
} from "@/resolvers/organizations/organization-schema";
import { createOrganization } from "@/server-actions/organizations/create-organization";

import { Span } from "../general/micro/typography";
import { Textarea } from "../ui/textarea";

interface CreateOrganizationModalProps {
	open: boolean;
	onSuccess?: () => void;
	onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationModal({
	open,
	onOpenChange,
	onSuccess,
}: CreateOrganizationModalProps) {
	const queryClient = useQueryClient();

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const { isSubmitting } = form.formState;

	async function onSubmit(values: OrganizationFormValues) {
		try {
			const response = await createOrganization(values);

			if (response.success) {
				toast.success("Organization created successfully!");
				onOpenChange(false);
				form.reset();
				onSuccess?.();

				// Function to invalidate organizations query
				queryClient.invalidateQueries({ queryKey: ["organizations"] });
			} else {
				toast.error(
					response.error.details?.non_field_errors?.[0] ??
						response.error.message,
				);
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(`Error: ${error.message}`);
			} else {
				toast.error("An error occurred while creating the organization.");
			}
		}
	}

	if (!open) return;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-2 border-gray-200 bg-white p-0 shadow-lg sm:max-w-lg">
				<div className="border-b-2 border-gray-200 px-8 py-6">
					<DialogHeader className="space-y-2">
						<DialogTitle className="text-2xl font-light text-arch-black">
							Create Workspace
						</DialogTitle>
						<DialogDescription className="text-base text-gray-600">
							Set up a new workspace for your projects
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="px-8 py-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-base font-medium text-arch-black">
											Workspace Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter workspace name"
												{...field}
												disabled={isSubmitting}
												className="border-2 border-gray-300 bg-transparent px-4 py-3 text-arch-dark transition-colors"
											/>
										</FormControl>
										<FormMessage className="text-sm text-red-500" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-base font-medium text-arch-black">
											Description
											<Span className="pl-1 text-[11px] text-gray-600">
												(Optnional)
											</Span>
										</FormLabel>
										<FormControl>
											<Textarea
												rows={4}
												{...field}
												disabled={isSubmitting}
												placeholder="Describe what this workspace will be used for"
												className="resize-none border-2 border-gray-300 bg-transparent px-4 py-3 text-arch-dark transition-colors"
											/>
										</FormControl>
										<FormMessage className="text-sm text-red-500" />
									</FormItem>
								)}
							/>

							<div className="flex justify-end space-x-4 pt-4">
								<Button
									type="button"
									variant="ghost"
									disabled={isSubmitting}
									onClick={() => onOpenChange(false)}
									className="px-6 py-2 text-arch-dark"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									className="border-2 border-arch-black bg-arch-black px-8 py-2 text-white transition-colors disabled:opacity-50"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										"Create Workspace"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
