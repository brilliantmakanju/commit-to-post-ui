/* eslint-disable import/no-unresolved */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import ProfileForm from "@/components/onboarding/profile-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { setupFormSchema, SetupFormValues } from "@/resolvers/auth-resolvers";
import { updateProfileSetup } from "@/server-actions/onboarding/update-profile";
import useUserStore from "@/zustand/useuser-store";

const SetupPage = () => {
	const router = useRouter();
	const userStore = useUserStore();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SetupFormValues>({
		resolver: zodResolver(setupFormSchema),
	});

	const onSubmit = async (data: SetupFormValues) => {
		try {
			const apiRequest = await updateProfileSetup({
				fullName: data.fullName,
			});

			if (apiRequest.success == true) {
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

				toast.success("Profile updated successfully!");
				router.push("/dashboard");
			} else {
				toast.error("Something went wrong, please try again");
			}
		} catch {
			toast.error("Failed to update profile. Please try again.");
		}
	};

	return (
		<Card className="w-[400px] bg-neutral-100">
			<CardHeader>
				<CardTitle className="text-neutral-800">
					Complete Your Profile
				</CardTitle>
				<CardDescription className="text-neutral-600">
					Add your details to personalize your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ProfileForm
					register={register}
					errors={errors}
					onSubmit={handleSubmit(onSubmit)}
					isSubmitting={isSubmitting}
				/>
			</CardContent>
		</Card>
	);
};

export default SetupPage;
