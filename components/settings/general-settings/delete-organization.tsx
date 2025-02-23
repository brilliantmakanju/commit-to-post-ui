"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteCookie } from "@/lib/cookies/create-cookies";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import {
	type DeleteOrganizationFormValues,
	deleteOrganizationSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { deleteOrganization } from "@/server-actions/organizations/delete-organization";

export function DeleteOrganization() {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { organization } = useOrganizationStore();
	const queryClient = useQueryClient();
	const organizationStore = useOrganizationStore();
	const [isOnlyOrganization, setIsOnlyOrganization] = useState(false);

	const form = useForm<DeleteOrganizationFormValues>({
		resolver: zodResolver(deleteOrganizationSchema),
		defaultValues: {
			organizationName: "",
		},
	});

	const checkOrganizationCount = async () => {
		const organizations = await queryClient.fetchQuery<
			{
				id: string;
				name: string;
				description: string;
				domains: string[];
			}[]
		>({
			queryKey: ["organizations"],
		});
		setIsOnlyOrganization(organizations.length === 1);
	};

	const onSubmit = async (data: DeleteOrganizationFormValues) => {
		if (data.organizationName !== organization?.name) {
			return;
		}

		try {
			setIsDeleting(true);
			const response = await deleteOrganization();
			if (response.success) {
				toast.success(response.message || "Organization deleted successfully");
				await deleteCookie("organization");

				await queryClient.invalidateQueries({ queryKey: ["organizations"] });

				const updatedOrganizations = await queryClient.fetchQuery<
					{
						id: string;
						name: string;
						description: string;
						domains: string[];
					}[]
				>({
					queryKey: ["organizations"],
				});

				if (updatedOrganizations && updatedOrganizations.length > 0) {
					organizationStore.setOrganization({
						...updatedOrganizations[0],
						domains: updatedOrganizations[0].domains[0],
					});
				}

				form.reset({
					organizationName: "",
				});
			} else {
				toast.error(response.message || "Failed to delete organization");
			}
			setOpen(false);
		} catch {
			toast.error("Failed to delete organization");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={newOpen => {
				if (newOpen) {
					checkOrganizationCount();
				}
				setOpen(newOpen);
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="destructive"
					className="w-full gap-2 bg-opacity-80 text-white sm:w-auto"
				>
					<Trash2 className="h-4 w-4" />
					Delete Organization
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-white">
				<DialogHeader>
					<DialogTitle>Delete Organization</DialogTitle>
					{isOnlyOrganization ? (
						<DialogDescription className="text-gray-600">
							You cannot delete your only organization. Please create another
							organization first before deleting this one.
						</DialogDescription>
					) : (
						<DialogDescription className="text-gray-600">
							This action cannot be undone. Please type{" "}
							<strong className="font-semibold text-gray-900">
								{organization?.name}
							</strong>{" "}
							to confirm.
						</DialogDescription>
					)}
				</DialogHeader>
				{isDeleting ? (
					<div className="flex h-32 items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-gray-600" />
						<span className="ml-2 text-gray-600">Deleting organization...</span>
					</div>
				) : (
					!isOnlyOrganization && (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="organizationName"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													{...field}
													placeholder="Enter organization name"
													disabled={isDeleting}
													className="border-gray-200 bg-white focus:border-gray-900 focus:ring-gray-900"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="submit"
										variant="outline"
										className="border-gray-200 bg-black text-white hover:bg-gray-800 disabled:bg-gray-200"
										disabled={
											form.watch("organizationName") !== organization?.name ||
											isDeleting
										}
									>
										{isDeleting && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										{isDeleting ? "Deleting..." : "Delete Organization"}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					)
				)}
			</DialogContent>
		</Dialog>
	);
}
