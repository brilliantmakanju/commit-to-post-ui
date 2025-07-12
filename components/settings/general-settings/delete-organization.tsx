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
import { deleteCookie } from "@/lib/cookies/create-cookies";
import {
	type DeleteOrganizationFormValues,
	deleteOrganizationSchema,
} from "@/resolvers/organizations/organization-settings-schema";
import { deleteOrganization } from "@/server-actions/organizations/delete-organization";
import useOrganizationStore from "@/zustand/useorganization-store";

export function DeleteOrganization() {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { organization } = useOrganizationStore();
	const queryClient = useQueryClient();
	const { organizations, setOrganization } = useOrganizationStore();
	const isOnlyOrganization = organizations.length === 1 ? true : false;

	const form = useForm<DeleteOrganizationFormValues>({
		resolver: zodResolver(deleteOrganizationSchema),
		defaultValues: {
			organizationName: "",
		},
	});

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
					setOrganization({
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
								{isOnlyOrganization ? (
									<DialogDescription className="text-zinc-400">
										You cannot delete your only organization. Please create
										another organization first before deleting this one.
									</DialogDescription>
								) : (
									<DialogDescription className="text-zinc-400">
										This action cannot be undone. Please type{" "}
										<strong className="font-mono font-semibold text-white">
											{organization?.name}
										</strong>{" "}
										to confirm.
									</DialogDescription>
								)}
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
																className="border-[#232323] bg-[#121212] font-mono text-white focus:border-red-900/50 focus:ring-red-900/20"
															/>
														</FormControl>
														<FormMessage className="text-red-400" />
													</FormItem>
												)}
											/>
											<DialogFooter>
												<Button
													type="submit"
													variant="destructive"
													className="border border-red-900/50 bg-red-900/50 text-white hover:bg-red-900 disabled:border-[#232323] disabled:bg-[#232323] disabled:text-zinc-500"
													disabled={
														form.watch("organizationName") !==
															organization?.name || isDeleting
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
								)
							)}
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	);
}
