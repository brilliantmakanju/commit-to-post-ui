import React from "react";
// eslint-disable-next-line import/named
import { FieldErrors, UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
	register: UseFormRegister<{
		fullName: string;
	}>;
	errors: FieldErrors<{
		fullName: string;
	}>;
	onSubmit: (event_: React.FormEvent<HTMLFormElement>) => void;
	isSubmitting: boolean;
}

const ProfileForm = ({
	register,
	errors,
	onSubmit,
	isSubmitting,
}: ProfileFormProps) => {
	return (
		<form onSubmit={onSubmit} className="flex flex-col space-y-6">
			<div className="space-y-2">
				<Label htmlFor="fullName" className="text-neutral-700">
					Full Name
				</Label>
				<Input
					id="fullName"
					placeholder="e.g. John Smith"
					className="border-neutral-200 bg-white"
					disabled={isSubmitting}
					{...register("fullName")}
				/>
				{errors.fullName && (
					<span className="text-xs text-red-500">
						{errors.fullName.message}
					</span>
				)}
			</div>

			<Button
				type="submit"
				className="w-full bg-neutral-800 text-white hover:bg-neutral-700"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Saving..." : "Save Profile"}
			</Button>
		</form>
	);
};

export default ProfileForm;
