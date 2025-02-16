"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
				// Sign out from NextAuth
				await clearCookies(); // Clear all cookies
				userStore.clearUser(); // Clear user information from Zustand store
				organizationStore.clearOrganization();
				await signOut();
				router.push("/auth");
			} else {
				toast.error("Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to change password. Please try again.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="mb-6 flex items-center justify-between">
				{authenticationType === "email_password" && (
					<Button
						variant="secondary"
						onClick={() => setIsPasswordModalOpen(true)}
					>
						Change Password
					</Button>
				)}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-white">First Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										className="border-gray-200 bg-transparent"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-white">Last Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										className="border-gray-200 bg-transparent"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						disabled={form.formState.isSubmitting || !isDirty()}
					>
						{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</form>
			</Form>

			<Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change Password</DialogTitle>
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
										<FormLabel>Current Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={passwordForm.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={passwordForm.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm New Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={passwordForm.formState.isSubmitting}
							>
								{passwordForm.formState.isSubmitting
									? "Changing Password..."
									: "Change Password"}
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
