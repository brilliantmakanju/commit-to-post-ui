"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
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
import { clearCookies } from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import {
	passwordFormSchema,
	profileFormSchema,
} from "@/resolvers/auth-resolvers";
import { updateProfileSetup } from "@/server-actions/onboarding/update-profile";
import { changePassword } from "@/server-actions/profile/updated-password";

export default function ProfileSettings() {
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const { data } = useSession();
	const userStore = useUserStore();
	const router = useRouter();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();

	// Split full name into first and last name if available
	const [firstNameFromFull, lastNameFromFull] = userStore.full_name
		? userStore.full_name.split(" ")
		: ["", ""];

	// Use Zustand values if justUpdated is true, otherwise fallback to data values
	const firstName = userStore.justUpdated
		? firstNameFromFull
		: userStore.full_name
			? firstNameFromFull
			: data?.user?.first_name;
	const lastName = userStore.justUpdated
		? lastNameFromFull
		: userStore.full_name
			? lastNameFromFull
			: data?.user?.last_name;
	const authenticationType = data?.user?.type || "email_password";

	const form = useForm<z.infer<typeof profileFormSchema>>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName,
			lastName,
		},
	});

	const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
		resolver: zodResolver(passwordFormSchema),
	});

	// Check if form values are different from initial values
	const isDirty = () => {
		const formValues = form.getValues();
		const currentFirstName = userStore.justUpdated
			? firstNameFromFull
			: firstName;
		const currentLastName = userStore.justUpdated ? lastNameFromFull : lastName;
		return (
			formValues.firstName !== currentFirstName ||
			formValues.lastName !== currentLastName
		);
	};

	const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
		try {
			const fullName = `${values.firstName} ${values.lastName}`.trim();
			const apiRequest = await updateProfileSetup({
				fullName,
			});

			if (apiRequest.success == true) {
				userStore.clearUser(); // Clear user information from Zustand store
				userStore.setUser({
					full_name: apiRequest.data.user.full_name,
					bio: apiRequest.data.user.bio,
					email: apiRequest.data.user.email,
					preferences: apiRequest.data.user.preferences,
					stripe_subscription_id: apiRequest.data.user.stripe_subscription_id,
					github_connected: apiRequest.data.user.github_connected,
					google_connected: apiRequest.data.user.google_connected,
				});
				userStore.setJustUpdated(true);
				// Reset form with new values
				form.reset({
					firstName: values.firstName,
					lastName: values.lastName,
				});
				toast.success("Profile updated successfully!");
			} else {
				toast.error("Something went wrong, please try again");
			}
		} catch {
			toast.error("Failed to update profile. Please try again.");
		}
	};

	const onPasswordChange = async (
		values: z.infer<typeof passwordFormSchema>,
	) => {
		try {
			const response = await changePassword(values);

			if (response.success === true) {
				setIsPasswordModalOpen(false);
				passwordForm.resetField("confirmPassword");
				passwordForm.resetField("newPassword");
				passwordForm.resetField("oldPassword");
				toast.success("Password changed successfully!");
				logoutStore.setLogout(true);
				organizationStore.clearOrganization();
				userStore.clearUser(); // Clear user information from Zustand store
				await clearCookies(); // Clear all cookies
				// Sign out from NextAuth
				await signOut();
				logoutStore.setLogout(false);
				router.push("/");
			} else {
				toast.error("Something went wrong. Please try again.");
			}
		} catch {
			toast.error("Failed to change password. Please try again.");
		}
	};

	return (
		<div className="space-y-6 py-6">
			<div className="mb-4 flex items-center gap-2">
				<User className="h-5 w-5 text-[#4F46E5]" />
				<h2 className="text-xl font-semibold text-white">
					Profile Information
				</h2>
			</div>

			<Card className="border-[#232323] bg-[#121212]">
				<CardHeader>
					<CardTitle className="text-lg font-medium text-white">
						Personal Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-medium text-zinc-300">
												First Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
													placeholder="Your first name"
												/>
											</FormControl>
											<FormMessage className="text-red-400" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-medium text-zinc-300">
												Last Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
													placeholder="Your last name"
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
									disabled={form.formState.isSubmitting || !isDirty()}
									className="bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:bg-[#232323] disabled:text-zinc-500"
								>
									{form.formState.isSubmitting ? (
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
				</CardContent>
			</Card>

			{authenticationType === "email_password" && (
				<Card className="border-[#232323] bg-[#121212]">
					<CardHeader>
						<CardTitle className="text-lg font-medium text-white">
							Security
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-zinc-300">Password</h3>
								<p className="mt-1 text-xs text-zinc-500">
									Update your password to keep your account secure
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setIsPasswordModalOpen(true)}
								className="border-[#232323] bg-[#1A1A1A] text-white hover:bg-[#232323]"
							>
								<KeyRound className="mr-2 h-4 w-4" />
								Change Password
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
				<DialogContent className="border border-[#232323] bg-[#121212] text-white">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<KeyRound className="mr-2 h-5 w-5 text-[#4F46E5]" />
							Change Password
						</DialogTitle>
					</DialogHeader>
					<Form {...passwordForm}>
						<form
							onSubmit={passwordForm.handleSubmit(onPasswordChange)}
							className="space-y-4"
						>
							<FormField
								control={passwordForm.control}
								name="oldPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-medium text-zinc-300">
											Current Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={passwordForm.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-medium text-zinc-300">
											New Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<FormField
								control={passwordForm.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-medium text-zinc-300">
											Confirm New Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-[#232323] bg-[#121212] font-mono text-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<div className="flex justify-end pt-4">
								<Button
									type="submit"
									variant="default"
									disabled={passwordForm.formState.isSubmitting}
									className="bg-[#4F46E5] text-white hover:bg-[#4338CA]"
								>
									{passwordForm.formState.isSubmitting ? (
										<div className="flex items-center">
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											<span>Changing Password...</span>
										</div>
									) : (
										<div className="flex items-center">
											<KeyRound className="mr-2 h-4 w-4" />
											<span>Change Password</span>
										</div>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
