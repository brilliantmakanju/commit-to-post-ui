"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Save, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaBell, FaGlobe, FaLock, FaPalette, FaUser } from "react-icons/fa";
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
		<div className="w-full space-y-8 p-6">
			{/* Profile Information Card */}
			<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative p-8">
					<div className="mb-8 flex items-center gap-3">
						<div className="rounded-full bg-zinc-700/50 p-2">
							<FaUser className="h-5 w-5 text-zinc-300" />
						</div>
						<div>
							<h2 className="text-xl font-medium text-zinc-100">
								Profile Information
							</h2>
							<p className="text-sm text-zinc-400">
								Update your personal details
							</p>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-zinc-300">
												First Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="border-zinc-700/50 bg-zinc-900/50 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-900/70 focus:ring-1 focus:ring-zinc-500/20"
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
										<FormItem>
											<FormLabel className="text-sm font-medium text-zinc-300">
												Last Name
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													disabled={form.formState.isSubmitting}
													className="border-zinc-700/50 bg-zinc-900/50 text-zinc-100 transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-900/70 focus:ring-1 focus:ring-zinc-500/20"
													placeholder="Enter your last name"
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
									disabled={form.formState.isSubmitting || !isDirty()}
									className="relative overflow-hidden bg-zinc-100 font-medium text-zinc-900 transition-all duration-200 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
								>
									{form.formState.isSubmitting ? (
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

			{/* Notifications Card */}
			<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="rounded-full bg-zinc-700/50 p-2">
							<FaBell className="h-5 w-5 text-zinc-300" />
						</div>
						<div>
							<h2 className="text-xl font-medium text-zinc-100">
								Notifications
							</h2>
							<p className="text-sm text-zinc-400">
								Manage your notification preferences
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-4">
							<div>
								<h3 className="font-medium text-zinc-200">
									Email notifications
								</h3>
								<p className="text-sm text-zinc-400">
									Get notifications when posts are generated and posted to
									socials
								</p>
							</div>
							<div className="flex items-center gap-2">
								{isLoadingNotifications ? (
									<Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
								) : (
									<Switch
										disabled={isToggling}
										checked={emailNotificationsEnabled}
										onCheckedChange={handleNotificationToggle}
										className="data-[state=checked]:bg-zinc-700 data-[state=unchecked]:bg-zinc-100"
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Privacy & Security Card */}
			<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="rounded-full bg-zinc-700/50 p-2">
							<Shield className="h-5 w-5 text-zinc-300" />
						</div>
						<div>
							<h2 className="text-xl font-medium text-zinc-100">
								Privacy & Security
							</h2>
							<p className="text-sm text-zinc-400">
								Manage your account security and privacy settings
							</p>
						</div>
					</div>

					<div className="space-y-4">
						{authenticationType === "email_password" && (
							<div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-4">
								<div>
									<h3 className="font-medium text-zinc-200">Password</h3>
									<p className="text-sm text-zinc-400">
										Update your password to keep your account secure
									</p>
								</div>
								<Button
									variant="outline"
									onClick={() => setIsPasswordModalOpen(true)}
									className="border-zinc-700/50 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900/70 hover:text-zinc-100"
								>
									<KeyRound className="mr-2 h-4 w-4" />
									Change Password
								</Button>
							</div>
						)}

						<div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-zinc-200">
									Two-Factor Authentication
									<Badge
										variant="secondary"
										className="bg-zinc-700 text-xs text-zinc-300"
									>
										Coming Soon
									</Badge>
								</h3>
								<p className="text-sm text-zinc-400">
									Add an extra layer of security to your account
								</p>
							</div>
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed border-zinc-700/50 bg-zinc-900/50 text-zinc-500"
							>
								<FaLock className="mr-2 h-4 w-4" />
								Enable 2FA
							</Button>
						</div>

						{/* <div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-zinc-200">
									Data Export
									<Badge
										variant="secondary"
										className="bg-zinc-700 text-xs text-zinc-300"
									>
										Coming Soon
									</Badge>
								</h3>
								<p className="text-sm text-zinc-400">
									Download a copy of your account data
								</p>
							</div>
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed border-zinc-700/50 bg-zinc-900/50 text-zinc-500"
							>
								Export Data
							</Button>
						</div> */}
					</div>
				</div>
			</div>

			{/* Preferences Card */}
			{/* <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-800/90 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/95">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				<div className="relative p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="rounded-full bg-zinc-700/50 p-2">
							<FaPalette className="h-5 w-5 text-zinc-300" />
						</div>
						<div>
							<h2 className="text-xl font-medium text-zinc-100">Preferences</h2>
							<p className="text-sm text-zinc-400">
								Customize your experience and interface
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-4">
							<div>
								<h3 className="flex items-center gap-2 font-medium text-zinc-200">
									Theme Preferences
									<Badge
										variant="secondary"
										className="bg-zinc-700 text-xs text-zinc-300"
									>
										Coming Soon
									</Badge>
								</h3>
								<p className="text-sm text-zinc-400">
									Choose between light, dark, or system theme
								</p>
							</div>
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed border-zinc-700/50 bg-zinc-900/50 text-zinc-500"
							>
								Dark Mode
							</Button>
						</div>
					</div>
				</div>
			</div> */}

			{/* Password Change Modal */}
			<Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
				<DialogContent className="border border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-zinc-100">
							<KeyRound className="h-5 w-5 text-zinc-400" />
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
										<FormLabel className="text-sm font-medium text-zinc-300">
											Current Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-zinc-700/50 bg-zinc-800/50 text-zinc-100 focus:border-zinc-500 focus:bg-zinc-800/70 focus:ring-1 focus:ring-zinc-500/20"
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
										<FormLabel className="text-sm font-medium text-zinc-300">
											New Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-zinc-700/50 bg-zinc-800/50 text-zinc-100 focus:border-zinc-500 focus:bg-zinc-800/70 focus:ring-1 focus:ring-zinc-500/20"
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
										<FormLabel className="text-sm font-medium text-zinc-300">
											Confirm New Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												disabled={passwordForm.formState.isSubmitting}
												className="border-zinc-700/50 bg-zinc-800/50 text-zinc-100 focus:border-zinc-500 focus:bg-zinc-800/70 focus:ring-1 focus:ring-zinc-500/20"
											/>
										</FormControl>
										<FormMessage className="text-red-400" />
									</FormItem>
								)}
							/>

							<div className="flex justify-end pt-4">
								<Button
									type="submit"
									disabled={passwordForm.formState.isSubmitting}
									className="bg-zinc-100 font-medium text-zinc-900 hover:bg-zinc-200"
								>
									{passwordForm.formState.isSubmitting ? (
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>Changing Password...</span>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<KeyRound className="h-4 w-4" />
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
