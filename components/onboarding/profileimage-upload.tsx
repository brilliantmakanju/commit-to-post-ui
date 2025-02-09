import { Pencil, Upload } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
	// eslint-disable-next-line import/named
	FieldErrors,
	// eslint-disable-next-line import/named
	UseFormClearErrors,
	// eslint-disable-next-line import/named
	UseFormRegister,
	// eslint-disable-next-line import/named
	UseFormSetValue,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MAX_FILE_SIZE = 2.5 * 1024 * 1024; // 2.5MB
const ACCEPTED_IMAGE_TYPES = new Set([
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
]);

interface ProfileImageUploadProps {
	setImageFile: (file: File | null) => void;
	setValue: UseFormSetValue<{
		fullName: string;
		bio: string;
		profileImage: File;
	}>;
	clearErrors: UseFormClearErrors<{
		fullName: string;
		bio: string;
		profileImage: File;
	}>;
	register: UseFormRegister<{
		fullName: string;
		bio: string;
		profileImage: File;
	}>;
	errors: FieldErrors<{
		fullName: string;
		bio: string;
		profileImage: File;
	}>;
}

const ProfileImageUpload = ({
	setImageFile,
	setValue,
	clearErrors,
	register,
	errors,
}: ProfileImageUploadProps) => {
	const [imagePreview, setImagePreview] = useState<string | null>();
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (file) {
				try {
					// Validate file
					if (
						file.size > MAX_FILE_SIZE ||
						!ACCEPTED_IMAGE_TYPES.has(file.type)
					) {
						throw new Error("Invalid file type or size");
					}

					setImageFile(file);
					setValue("profileImage", file);

					const reader = new FileReader();
					reader.onloadend = () => {
						setImagePreview(reader.result as string);
						clearErrors("profileImage");
					};
					reader.readAsDataURL(file);

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
				} catch (error) {
					if (error instanceof Error) {
						toast.error(error.message);
					} else {
						toast.error("An unknown error occurred");
					}
				}
			}
		},
		[setValue, clearErrors, setImageFile],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".gif"],
		},
		multiple: false,
	});

	return (
		<div
			{...getRootProps()}
			className="relative h-24 w-24 cursor-pointer"
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-200">
				{imagePreview ? (
					<>
						<Image
							src={imagePreview}
							alt="Preview"
							className="h-full w-full object-cover"
						/>
						{isHovering && (
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
								<Pencil className="h-6 w-6 text-white" />
							</div>
						)}
					</>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<Upload className="h-8 w-8 text-neutral-400" />
					</div>
				)}
			</div>
			{uploadProgress > 0 && uploadProgress < 100 && (
				<div className="absolute -inset-1">
					<svg
						className="h-[calc(100%+8px)] w-[calc(100%+8px)]"
						viewBox="0 0 100 100"
					>
						<circle
							cx="50"
							cy="50"
							r="48"
							fill="none"
							stroke="#3b82f6"
							strokeWidth="4"
							strokeDasharray={`${uploadProgress * 3.14}, 314`}
							transform="rotate(-90 50 50)"
						/>
					</svg>
				</div>
			)}
			<input {...getInputProps()} />
			<span className="mt-1 text-xs text-neutral-500">Max size: 2.5MB</span>
			{errors.profileImage && (
				<span className="mt-1 text-xs text-red-500">
					{errors.profileImage.message}
				</span>
			)}
		</div>
	);
};

export default ProfileImageUpload;
