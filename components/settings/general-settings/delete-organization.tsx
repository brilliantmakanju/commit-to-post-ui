"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	createEncryptedCookie,
	deleteCookie,
} from "@/lib/cookies/create-cookies";
import {
	type DeleteOrganizationFormValues,
	deleteOrganizationSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { deleteOrganization } from "@/server-actions/organizations/delete-organization";
import useOrganizationStore, {
	Organization,
} from "@/zustand/useorganization-store";

export function DeleteOrganization() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const {
		currentOrganization,
		organizations,
		removeOrganization,
		updateOrganizations,
	} = useOrganizationStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const isOnlyOrganization = organizations.length === 1;

	const form = useForm<DeleteOrganizationFormValues>({
		resolver: zodResolver(deleteOrganizationSchema),
		defaultValues: {
			organizationName: "",
		},
	});

	const handleOrganizationSwitch = async (
		nextOrg: Organization | undefined,
	) => {
		if (nextOrg) {
			// Update the cookie with the new organization
			await createEncryptedCookie("organization", nextOrg);

			// Invalidate and refetch queries that depend on the organization
			await queryClient.invalidateQueries({
				predicate: query => {
					const queryKey = query.queryKey;
					return (
						Array.isArray(queryKey) &&
						(queryKey.includes("organizations") ||
							queryKey.includes("organization") ||
							queryKey.some(
								key => typeof key === "string" && key.includes("org"),
							))
					);
				},
			});

			toast.success(`Switched to ${nextOrg.name}`);
		} else {
			// No organizations left, clear cookie and redirect
			await deleteCookie("organization");
			toast.error(
				"No organizations remaining. Please create a new organization.",
			);
			// Redirect to create organization page or wherever appropriate
			globalThis.window.location.href = "/create-organization";
		}
	};

	const onSubmit = async (data: DeleteOrganizationFormValues) => {
		if (data.organizationName !== currentOrganization?.name) {
			form.setError("organizationName", {
				type: "manual",
				message: "Organization name doesn't match",
			});
			return;
		}

		try {
			setIsDeleting(true);

			// Delete the organization
			const response = await deleteOrganization();

			if (response.success) {
				toast.success(response.message || "Organization deleted successfully");

				// Remove the organization from the store and get the next available org
				const nextOrg = removeOrganization(currentOrganization!.id);

				// Update organizations list from server to ensure consistency
				try {
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

					if (updatedOrganizations) {
						// Convert the domains format if needed (your store expects string, API returns array)
						const formattedOrgs = updatedOrganizations.map(org => ({
							...org,
							domains: Array.isArray(org.domains)
								? org.domains[0] || ""
								: org.domains,
						}));

						updateOrganizations(formattedOrgs);
					}
				} catch {
					// Continue with local state management if server sync fails
				}

				// Handle organization switching
				await handleOrganizationSwitch(nextOrg);

				// Reset form and close dialog
				form.reset({ organizationName: "" });
				setOpen(false);
			} else {
				toast.error(response.message || "Failed to delete organization");
			}
		} catch {
			toast.error("Failed to delete organization");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Card className="border-[#232323] bg-[#121212]">
			<CardContent className="p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 className="mb-1 text-lg font-medium text-white">
							Delete Organization
						</h3>
						<p className="text-sm text-zinc-400">
							Permanently delete this organization and all associated data. This
							action cannot be undone.
						</p>
					</div>

					<Dialog
						open={open}
						onOpenChange={newOpen => {
							setOpen(newOpen);
							if (!newOpen) {
								form.reset({ organizationName: "" });
							}
						}}
					>
						{isOnlyOrganization ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button
											variant="destructive"
											disabled
											className="cursor-not-allowed border border-red-900/30 bg-red-900/20 text-white opacity-60"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete Organization
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top" className="max-w-xs text-xs">
									You cannot delete your only organization. Please create
									another first.
								</TooltipContent>
							</Tooltip>
						) : (
							<DialogTrigger asChild>
								<Button
									variant="destructive"
									className="border border-red-900/50 bg-red-900/50 text-white hover:bg-red-900"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Organization
								</Button>
							</DialogTrigger>
						)}

						<DialogContent className="border border-[#232323] bg-[#121212] text-white">
							<DialogHeader>
								<DialogTitle className="flex items-center">
									<Trash2 className="mr-2 h-5 w-5 text-red-500" />
									Delete Organization
								</DialogTitle>
								<DialogDescription className="text-zinc-400">
									This action cannot be undone. Please type{" "}
									<strong className="font-mono font-semibold text-white">
										{currentOrganization?.name}
									</strong>{" "}
									to confirm.
								</DialogDescription>
							</DialogHeader>

							{isDeleting ? (
								<div className="flex h-32 items-center justify-center">
									<div className="relative">
										<Loader2 className="h-8 w-8 animate-spin text-red-500" />
										<div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-red-500/20"></div>
									</div>
									<span className="ml-3 text-zinc-400">
										Deleting organization...
									</span>
								</div>
							) : (
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
															className="border-[#232323] bg-[#121212] font-mono text-white focus:border-red-900/50 focus:ring-red-900/20"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
										<DialogFooter>
											<Button
												type="button"
												variant="outline"
												onClick={() => setOpen(false)}
												disabled={isDeleting}
												className="border-[#232323] bg-transparent text-zinc-400 hover:bg-[#232323] hover:text-white"
											>
												Cancel
											</Button>
											<Button
												type="submit"
												variant="destructive"
												className="border border-red-900/50 bg-red-900/50 text-white hover:bg-red-900 disabled:border-[#232323] disabled:bg-[#232323] disabled:text-zinc-500"
												disabled={
													form.watch("organizationName") !==
														currentOrganization?.name || isDeleting
												}
											>
												{isDeleting ? (
													<div className="flex items-center">
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														<span>Deleting...</span>
													</div>
												) : (
													<div className="flex items-center">
														<Trash2 className="mr-2 h-4 w-4" />
														<span>Delete Organization</span>
													</div>
												)}
											</Button>
										</DialogFooter>
									</form>
								</Form>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	);
}
