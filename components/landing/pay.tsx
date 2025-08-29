/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable import/no-unresolved */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Upload, X } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { PaymentCreation } from "../../server-actions/auth/subscribe";

// Define the form schema using Zod
const formSchema = z.object({
	plan: z.enum(["basic", "pro", "lifetime"]),
	period: z.enum(["monthly", "annual"]),
	trancantRef: z.string().min(1, "Transaction reference is required"),
	additionalNote: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema> & {
	paymentProof?: string;
};

export function PaymentForm() {
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
		setValue,
		watch,
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			plan: "pro",
			period: "monthly",
			trancantRef: "",
			additionalNote: "",
		},
	});

	const selectedPlan = watch("plan");
	const selectedPeriod = watch("period");

	// Handle file selection
	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await processFile(file);
		}
	};

	// Handle drag events
	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			await processFile(file);
		}
	};

	// Process the selected file
	const processFile = async (file: File) => {
		// Check if file is an image
		if (!file.type.startsWith("image/")) {
			setResponseMessage({
				type: "error",
				message: "Please upload an image file (JPEG, PNG, etc.)",
			});
			return;
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setResponseMessage({
				type: "error",
				message: "File size should be less than 5MB",
			});
			return;
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
		return new Promise<void>(resolve => {
			const reader = new FileReader();
			reader.addEventListener("load", event => {
				const base64 = event.target?.result as string;
				setImagePreview(base64);
				// Make sure to set the value in the form
				setValue("paymentProof", base64);
				clearInterval(interval);
				setUploadProgress(100);
				resolve();
			});
			reader.readAsDataURL(file);
		});
	};

	// Handle form submission
	const onSubmit = async (data: FormValues) => {
		// Check if payment proof exists
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
			// Ensure we're using the imagePreview directly to guarantee we have the latest value
			const result = await PaymentCreation({
				plan: data.plan,
				period: data.period,
				trancantRef: data.trancantRef,
				paymentProof: imagePreview,
				additionalNote: data.additionalNote || "",
			});

			if (result.success) {
				setResponseMessage({
					type: "success",
					message: result.message,
				});
				reset();
				setImagePreview(undefined);
				setUploadProgress(0);
			} else {
				setResponseMessage({
					type: "error",
					message: result.message,
				});
			}
		} catch {
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
		setValue("paymentProof", undefined);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Payment Submission</CardTitle>
				<CardDescription>
					Complete your subscription by providing payment details
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

					{/* Plan Selection */}
					<div className="space-y-2">
						<Label>Select Plan</Label>
						<RadioGroup
							defaultValue={selectedPlan}
							onValueChange={value =>
								setValue("plan", value as "basic" | "pro" | "lifetime")
							}
							className="grid grid-cols-3 gap-4"
						>
							<Label
								htmlFor="plan-basic"
								className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
									selectedPlan === "basic" ? "border-primary" : ""
								}`}
							>
								<RadioGroupItem
									value="basic"
									id="plan-basic"
									className="sr-only"
								/>
								<span className="text-lg font-medium">Basic</span>
								<span className="text-sm text-muted-foreground">$0/mo</span>
							</Label>
							<Label
								htmlFor="plan-pro"
								className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
									selectedPlan === "pro" ? "border-primary" : ""
								}`}
							>
								<RadioGroupItem value="pro" id="plan-pro" className="sr-only" />
								<span className="text-lg font-medium">Pro</span>
								<span className="text-sm text-muted-foreground">
									{selectedPeriod === "monthly" ? "$12/mo" : "$120/yr"}
								</span>
							</Label>
							<Label
								htmlFor="plan-lifetime"
								className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
									selectedPlan === "lifetime" ? "border-primary" : ""
								}`}
							>
								<RadioGroupItem
									value="lifetime"
									id="plan-lifetime"
									className="sr-only"
								/>
								<span className="text-lg font-medium">Lifetime</span>
								<span className="text-sm text-muted-foreground">$199</span>
							</Label>
						</RadioGroup>
					</div>

					{/* Period Selection (only show for non-lifetime plans) */}
					{selectedPlan !== "lifetime" && (
						<div className="space-y-2">
							<Label>Billing Period</Label>
							<RadioGroup
								defaultValue={selectedPeriod}
								onValueChange={value =>
									setValue("period", value as "monthly" | "annual")
								}
								className="flex gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="monthly" id="period-monthly" />
									<Label htmlFor="period-monthly">Monthly</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="annual" id="period-annual" />
									<Label htmlFor="period-annual">Annual (Save 15%)</Label>
								</div>
							</RadioGroup>
						</div>
					)}

					{/* Transaction Reference */}
					<div className="space-y-2">
						<Label htmlFor="trancantRef">Transaction Reference</Label>
						<Input
							id="trancantRef"
							placeholder="Enter transaction reference"
							{...register("trancantRef")}
						/>
						{errors.trancantRef && (
							<p className="text-sm text-destructive">
								{errors.trancantRef.message}
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
										? "border-success bg-success/10"
										: "border-muted hover:border-primary/50 hover:bg-accent"
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								type="file"
								ref={fileInputRef}
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
											className="absolute right-2 top-2 h-8 w-8"
											onClick={e => {
												e.stopPropagation();
												removeImage();
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									{uploadProgress < 100 && (
										<div className="space-y-2">
											<Progress value={uploadProgress} className="h-2 w-full" />
											<p className="text-sm text-muted-foreground">
												Uploading: {uploadProgress}%
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="space-y-2">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<Upload className="h-6 w-6 text-primary" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium">
											Drag and drop or click to upload
										</p>
										<p className="text-xs text-muted-foreground">
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
							placeholder="Any additional information about your payment"
							{...register("additionalNote")}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						className="w-full"
						disabled={
							isSubmitting || (uploadProgress < 100 && imagePreview !== null)
						}
					>
						{isSubmitting ? "Processing..." : "Submit Payment"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
