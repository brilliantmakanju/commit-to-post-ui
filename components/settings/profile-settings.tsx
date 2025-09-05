"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Save, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaBell, FaUser } from "react-icons/fa";
import { toast } from "sonner";
import type * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
	passwordFormSchema,
	profileFormSchema,
} from "@/resolvers/auth-resolvers";
import {
	getNotificationStatus,
	toggleEmailNotifications,
} from "@/server-actions/emails/resubscribe";
import { updateProfileSetup } from "@/server-actions/onboarding/update-profile";
import { changePassword } from "@/server-actions/profile/updated-password";
import useUserStore from "@/zustand/useuser-store";

import { useSessionManager } from "../tracker/auth-tracker";

export default function ProfileSettings() {
	const { data } = useSession();
	const userStore = useUserStore();
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
		useState(false);
	const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
	const [isToggling, setIsToggling] = useState(false);

	// Split full name into first and last name if available
	const [firstNameFromFull, lastNameFromFull] = userStore.full_name
		? userStore.full_name.split(" ")
		: ["", ""];

	// Use Zustand values if justUpdated is true, otherwise fallback to data values
	const firstName = userStore.justUpdated
		? firstNameFromFull
		: userStore.full_name
			? firstNameFromFull
			: data?.user?.first_name || "";
	const lastName = userStore.justUpdated
		? lastNameFromFull
		: userStore.full_name
			? lastNameFromFull
			: data?.user?.last_name || "";
	const authenticationType = data?.user?.type || "email_password";

	const form = useForm<z.infer<typeof profileFormSchema>>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
		},
	});

	const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	// Load notification status on component mount
	useEffect(() => {
		const loadNotificationStatus = async () => {
			try {
				const response = await getNotificationStatus();
				if (response.success) {
					setEmailNotificationsEnabled(response.subscribed);
				}
			} catch (error) {
				console.error("Failed to load notification status:", error);
			} finally {
				setIsLoadingNotifications(false);
			}
		};

		loadNotificationStatus();
	}, []);

	// Update form when data changes
	useEffect(() => {
		form.reset({
			firstName: firstName || "",
			lastName: lastName || "",
		});
	}, [firstName, lastName, form]);

	const { logout } = useSessionManager();

	// Check if form values are different from initial values
	const isDirty = () => {
		const formValues = form.getValues();
		return (
			formValues.firstName !== (firstName || "") ||
			formValues.lastName !== (lastName || "")
		);
	};

	const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
		try {
			const fullName = `${values.firstName} ${values.lastName}`.trim();
			const apiRequest = await updateProfileSetup({
				fullName,
			});

			if (apiRequest.success === true) {
				userStore.clearUser();
				userStore.setUser({
					full_name: apiRequest.data.user.full_name,
					bio: apiRequest.data.user.bio,
					email: apiRequest.data.user.email,
					preferences: apiRequest.data.user.preferences,
					stripe_subscription_id: apiRequest.data.user.stripe_subscription_id,
					github_connected: apiRequest.data.user.github_connected,
					google_connected: apiRequest.data.user.google_connected,
					hasHydratedUser: true,
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
				passwordForm.reset();
				toast.success("Password changed successfully!");
				await logout();
			} else {
				toast.error("Something went wrong. Please try again.");
			}
		} catch {
			toast.error("Failed to change password. Please try again.");
		}
	};

	const handleNotificationToggle = async () => {
		setIsToggling(true);
		try {
			const action = emailNotificationsEnabled ? "unsubscribe" : "subscribe";
			const response = await toggleEmailNotifications(action);

			if (response.success) {
				setEmailNotificationsEnabled(response.subscribed);
				toast.success(response.message);
			}
		} catch {
			toast.error(
				"Failed to update notification preferences. Please try again.",
			);
		} finally {
			setIsToggling(false);
		}
	};

	return (
		<div className="w-full space-y-6 sm:space-y-8">
			{/* Profile Information Card */}
			<div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative w-full p-4 sm:p-6 lg:p-8">
					<div className="mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center">
						<div className="rounded-full bg-zinc-800/30 p-2">
							<FaUser className="h-4 w-4 text-zinc-300 sm:h-5 sm:w-5" />
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-lg font-medium text-zinc-100 sm:text-xl">
								Profile Information
							</h2>
							<p className="text-xs text-zinc-400 sm:text-sm">
								Update your personal details
							</p>
						</div>
					</div>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="w-full space-y-4 sm:space-y-6"
						>
							<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem className="w-full space-y-2">
											<FormLabel className="text-sm font-medium text-zinc-300">
												First Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="w-full border-zinc-800/50 bg-zinc-900/30 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-900/40 focus:ring-1 focus:ring-zinc-600/20"
													placeholder="Enter your first name"
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
										<FormItem className="w-full space-y-2">
											<FormLabel className="text-sm font-medium text-zinc-300">
												Last Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="w-full border-zinc-800/50 bg-zinc-900/30 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-900/40 focus:ring-1 focus:ring-zinc-600/20"
													placeholder="Enter your last name"
												/>
											</FormControl>
											<FormMessage className="text-red-400" />
										</FormItem>
									)}
								/>
							</div>

							{/* Email Display */}
							<div className="w-full space-y-2">
								<FormLabel className="text-sm font-medium text-zinc-300">
									Email Address
								</FormLabel>
								<div className="relative w-full">
									<Input
										value={data?.user?.email || ""}
										disabled
										className="w-full cursor-not-allowed border-zinc-800/30 bg-zinc-900/20 text-zinc-400"
										placeholder="No email available"
									/>
									<Badge
										variant="outline"
										className="absolute right-2 top-1/2 -translate-y-1/2 border-zinc-600/50 bg-zinc-900/40 text-xs text-zinc-300"
									>
										{authenticationType === "google"
											? "Google"
											: authenticationType === "github"
												? "GitHub"
												: "Email"}
									</Badge>
								</div>
							</div>

							{/* Save Button */}
							<div className="flex w-full flex-col justify-end gap-3 pt-4 sm:flex-row">
								<Button
									type="submit"
									disabled={form.formState.isSubmitting || !isDirty()}
									className="w-full border-zinc-700 bg-zinc-800 text-white transition-all duration-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
								>
									{form.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Save className="mr-2 h-4 w-4" />
											Save Changes
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>

			{/* Security Settings Card */}
			<div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative w-full p-4 sm:p-6 lg:p-8">
					<div className="mb-4 flex items-center gap-3 sm:mb-6">
						<div className="rounded-full bg-zinc-800/30 p-2">
							<Shield className="h-4 w-4 text-zinc-300 sm:h-5 sm:w-5" />
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-base font-medium text-zinc-100 sm:text-lg lg:text-xl">
								Security Settings
							</h2>
							<p className="text-xs text-zinc-400 sm:text-sm">
								Manage your account security
							</p>
						</div>
					</div>

					<div className="w-full space-y-3 sm:space-y-4">
						{/* Password Change - Only show for email/password auth */}
						{authenticationType === "email_password" && (
							<div className="w-full rounded-xl border border-zinc-800/30 bg-zinc-900/20 p-3 sm:p-4">
								<div className="flex items-start gap-3 sm:items-center">
									<div className="mt-0.5 rounded-full bg-zinc-800/30 p-2 sm:mt-0">
										<KeyRound className="h-3.5 w-3.5 text-zinc-300 sm:h-4 sm:w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="text-sm font-medium text-zinc-100">
											Change Password
										</h3>
										<p className="text-xs text-zinc-400 sm:text-sm">
											Update your account password
										</p>
										<div className="mt-3 sm:mt-0 sm:hidden">
											<Button
												onClick={() => setIsPasswordModalOpen(true)}
												variant="outline"
												size="sm"
												className="w-full border-zinc-700/50 bg-zinc-900/30 text-zinc-200 hover:border-zinc-600/60 hover:bg-zinc-800/40"
											>
												Change Password
											</Button>
										</div>
									</div>
									<div className="hidden sm:block">
										<Button
											onClick={() => setIsPasswordModalOpen(true)}
											variant="outline"
											size="sm"
											className="border-zinc-700/50 bg-zinc-900/30 text-zinc-200 hover:border-zinc-600/60 hover:bg-zinc-800/40"
										>
											Change Password
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Email Notifications */}
						<div className="w-full rounded-xl border border-zinc-800/30 bg-zinc-900/20 p-3 sm:p-4">
							<div className="flex items-start gap-3 sm:items-center">
								<div className="mt-0.5 rounded-full bg-zinc-800/30 p-2 sm:mt-0">
									<FaBell className="h-3.5 w-3.5 text-zinc-300 sm:h-4 sm:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-sm font-medium text-zinc-100">
										Email Notifications
									</h3>
									<p className="text-xs text-zinc-400 sm:text-sm">
										Receive updates and alerts via email
									</p>
								</div>
								<div className="ml-auto flex items-center">
									{isLoadingNotifications ? (
										<Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
									) : (
										<Switch
											checked={emailNotificationsEnabled}
											onCheckedChange={handleNotificationToggle}
											disabled={isToggling}
											className="data-[state=checked]:bg-zinc-600"
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Password Change Modal */}
			<Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
				<DialogContent className="w-full border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl">
					<DialogHeader>
						<DialogTitle className="text-zinc-100">Change Password</DialogTitle>
					</DialogHeader>

					<Form {...passwordForm}>
						<form
							onSubmit={passwordForm.handleSubmit(onPasswordChange)}
							className="w-full space-y-4"
						>
							<FormField
								control={passwordForm.control}
								name="oldPassword"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel className="text-zinc-300">
											Current Password
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												disabled={passwordForm.formState.isSubmitting}
												className="w-full border-zinc-800/50 bg-zinc-900/30 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600/20"
												placeholder="Enter current password"
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
									<FormItem className="w-full">
										<FormLabel className="text-zinc-300">
											New Password
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												disabled={passwordForm.formState.isSubmitting}
												className="w-full border-zinc-800/50 bg-zinc-900/30 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600/20"
												placeholder="Enter new password"
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
									<FormItem className="w-full">
										<FormLabel className="text-zinc-300">
											Confirm New Password
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												disabled={passwordForm.formState.isSubmitting}
												className="w-full border-zinc-800/50 bg-zinc-900/30 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600/20"
												placeholder="Confirm new password"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<div className="flex w-full flex-col-reverse gap-3 pt-4 sm:flex-row">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsPasswordModalOpen(false)}
									disabled={passwordForm.formState.isSubmitting}
									// className="w-full border-zinc-700/50 text-zinc-200 hover:bg-zinc-900/30 sm:w-auto"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={passwordForm.formState.isSubmitting}
									className="w-full bg-zinc-800 text-white hover:bg-zinc-700 sm:w-auto"
								>
									{passwordForm.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Changing...
										</>
									) : (
										"Change Password"
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
