/* eslint-disable import/no-unresolved */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Clock, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PaymentCreation } from "@/server-actions/auth/subscribe";

import { GlobalCountdownTimer } from "../landing/pricing/v3/countdown";

// Define the form schema using Zod
const formSchema = z.object({
	transactionRef: z.string().min(1, "Transaction reference is required"),
	additionalNote: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
	selectedPlan: "free" | "pro" | "lifetime";
	billingCycle: "monthly" | "annual";
}

function newFunction() {
	return "lifetime-deal";
}

export function PaymentForm({ selectedPlan, billingCycle }: PaymentFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>();
	const [responseMessage, setResponseMessage] = useState<{
		type: "success" | "error";
		message: string;
	} | null>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			transactionRef: "",
			additionalNote: "",
		},
	});

	// Get plan details
	const getPlanDetails = () => {
		let planName = "Pro Plan";
		let planPrice = "$12/month";

		switch (selectedPlan) {
			case "free": {
				planName = "Free Plan";
				planPrice = "$0";

				break;
			}
			case "pro": {
				planName = "Pro Plan";
				planPrice = billingCycle === "monthly" ? "$5/month" : "$50/year";

				break;
			}
			case newFunction(): {
				planName = "Lifetime Deal";
				planPrice = "$79 (one-time)";

				break;
			}
			// No default
		}

		return { planName, planPrice };
	};

	const { planName, planPrice } = getPlanDetails();

	// Handle file selection
	const handleFileChange = (event_: React.ChangeEvent<HTMLInputElement>) => {
		const file = event_.target.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	// Handle drag events
	const handleDragOver = (event_: React.DragEvent<HTMLDivElement>) => {
		event_.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (event_: React.DragEvent<HTMLDivElement>) => {
		event_.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (event_: React.DragEvent<HTMLDivElement>) => {
		event_.preventDefault();
		setIsDragging(false);

		const file = event_.dataTransfer.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	// Process the selected file - returns a Promise for better async handling
	const processFile = (file: File): Promise<void> => {
		// Check if file is an image
		if (!file.type.startsWith("image/")) {
			setResponseMessage({
				type: "error",
				message: "Please upload an image file (JPEG, PNG, etc.)",
			});
			return Promise.reject("Invalid file type");
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setResponseMessage({
				type: "error",
				message: "File size should be less than 5MB",
			});
			return Promise.reject("File too large");
		}

		// Simulate upload progress
		setUploadProgress(0);
		const interval = setInterval(() => {
			setUploadProgress(previous => {
				if (previous >= 100) {
					clearInterval(interval);
					return 100;
				}
				return previous + 10;
			});
		}, 100);

		// Convert to base64
		return new Promise<void>((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", event => {
				const base64 = event.target?.result as string;
				setImagePreview(base64);
				clearInterval(interval);
				setUploadProgress(100);
				resolve();
			});
			// eslint-disable-next-line unicorn/prefer-add-event-listener
			reader.onerror = () => {
				clearInterval(interval);
				reject("Error reading file");
			};
			reader.readAsDataURL(file);
		});
	};

	// Handle form submission
	const onSubmit = async (data: FormValues) => {
		if (!imagePreview) {
			setResponseMessage({
				type: "error",
				message: "Please upload proof of payment",
			});
			return;
		}

		setIsSubmitting(true);
		setResponseMessage(undefined);

		try {
			// Call the server action with the correct parameters
			const result = await PaymentCreation({
				plan: selectedPlan,
				period: billingCycle,
				trancantRef: data.transactionRef,
				paymentProof: imagePreview,
				additionalNote: data.additionalNote || "",
			});

			if (result.success) {
				setResponseMessage({
					type: "success",
					message: result.message,
				});

				// Reset form
				reset();
				setImagePreview(undefined);
				setUploadProgress(0);
			} else {
				setResponseMessage({
					type: "error",
					message: result.message,
				});
			}
		} catch (error) {
			console.error("Submission error:", error);
			setResponseMessage({
				type: "error",
				message: "An unexpected error occurred. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Remove the selected image
	const removeImage = () => {
		setImagePreview(undefined);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<CardHeader>
				<CardTitle>Payment Proof</CardTitle>
				<CardDescription>
					Upload proof of your payment to complete your subscription
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="space-y-6">
					{/* Response Message */}
					{responseMessage && (
						<Alert
							variant={
								responseMessage.type === "success" ? "default" : "destructive"
							}
						>
							{responseMessage.type === "success" ? (
								<Check className="h-4 w-4" />
							) : (
								<AlertCircle className="h-4 w-4" />
							)}
							<AlertTitle>
								{responseMessage.type === "success" ? "Success" : "Error"}
							</AlertTitle>
							<AlertDescription>{responseMessage.message}</AlertDescription>
						</Alert>
					)}

					{/* Global Countdown Banner */}
					<div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
						<div className="mb-3 flex items-center justify-center">
							<Clock className="mr-2 h-5 w-5 text-zinc-800 dark:text-zinc-200" />
							<h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
								Limited Time Offer
							</h3>
						</div>
						<p className="mb-4 text-zinc-600 dark:text-zinc-400">
							All plans are available at a special launch price. Offer ends in:
						</p>
						<div className="inline-flex items-center justify-center rounded-md bg-white px-4 py-3 shadow-sm dark:bg-zinc-800">
							<GlobalCountdownTimer
								showLabels={true}
								showIcon={false}
								className="text-zinc-800 dark:text-zinc-200"
							/>
						</div>
						<div className="mt-4 flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-500">
							<AlertCircle className="mr-1 h-3 w-3" />
							<span>After this period, prices will increase</span>
						</div>
					</div>

					{/* Plan Summary */}
					<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
						<div className="flex justify-between">
							<div>
								<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
									Selected Plan
								</p>
								<p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
									{planName}
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
									Price
								</p>
								<p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
									{planPrice}
								</p>
							</div>
						</div>
					</div>

					{/* Transaction Reference */}
					<div className="space-y-2">
						<Label htmlFor="transactionRef">Transaction Reference</Label>
						<Input
							disabled={isSubmitting}
							id="transactionRef"
							placeholder="Enter your transaction reference or ID"
							{...register("transactionRef")}
						/>
						{errors.transactionRef && (
							<p className="text-sm text-destructive">
								{errors.transactionRef.message}
							</p>
						)}
					</div>

					{/* Proof of Payment Upload */}
					<div className="space-y-2">
						<Label>Proof of Payment</Label>
						<div
							className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
								isDragging
									? "border-primary bg-primary/10"
									: imagePreview
										? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20"
										: "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								type="file"
								ref={fileInputRef}
								disabled={isSubmitting}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>

							{imagePreview ? (
								<div className="space-y-4">
									<div className="relative mx-auto h-48 w-full">
										<Image
											src={imagePreview || "/placeholder.svg"}
											alt="Payment proof"
											fill
											className="rounded-md object-contain"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											disabled={isSubmitting}
											className="absolute right-2 top-2 h-8 w-8"
											onClick={event_ => {
												event_.stopPropagation();
												removeImage();
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{uploadProgress < 100 && (
										<div className="space-y-2">
											<Progress value={uploadProgress} className="h-2 w-full" />
											<p className="text-sm text-zinc-500 dark:text-zinc-400">
												Uploading: {uploadProgress}%
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="space-y-2">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
										<Upload className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
											Drag and drop or click to upload
										</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											Supports JPG, PNG, GIF (Max 5MB)
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Additional Notes */}
					<div className="space-y-2">
						<Label htmlFor="additionalNote">Additional Notes (Optional)</Label>
						<Textarea
							id="additionalNote"
							disabled={isSubmitting}
							placeholder="Any additional information about your payment"
							{...register("additionalNote")}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
						disabled={
							isSubmitting || (uploadProgress < 100 && imagePreview !== null)
						}
					>
						{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
						{isSubmitting ? "Processing..." : "Submit Payment Proof"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
