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
	DialogFooter,
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

import { Textarea } from "../ui/textarea";

interface CreateOrganizationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
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
				toast.error(response.error.details.non_field_errors[0]);
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
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Organization</DialogTitle>
					<DialogDescription>
						Create a new organization by providing a name and description.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter organization name"
											{...field}
											disabled={isSubmitting}
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter organization description"
											rows={5}
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
