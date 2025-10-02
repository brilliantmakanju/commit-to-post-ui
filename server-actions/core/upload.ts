"use server";

// eslint-disable-next-line import/no-unresolved
import cloudinary from "@/lib/cloudinary";

interface UploadResponse {
	success: boolean;
	data?: {
		url: string;
		public_id: string;
		width: number;
		height: number;
		format: string;
		bytes: number;
	};
	error?: string;
}

export async function uploadToCloudinary(
	file: File,
	versionId?: string,
): Promise<UploadResponse> {
	try {
		if (!file) {
			return { success: false, error: "No file provided" };
		}

		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		];
		if (!allowedTypes.includes(file.type)) {
			return { success: false, error: "Invalid file type" };
		}

		if (file.size > 10 * 1024 * 1024) {
			return { success: false, error: "File too large (max 10MB)" };
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const timestamp = Date.now();
		const publicId = `post_${versionId || "draft"}_${timestamp}`;

		const result = await new Promise<any>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
						public_id: publicId,
						folder: "social_media_posts",
						transformation: [
							{
								width: 1200,
								height: 1200,
								crop: "limit",
								quality: "auto:good",
								fetch_format: "auto",
							},
						],
						...(file.type === "image/gif" && {
							format: "gif",
							flags: "animated",
						}),
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					},
				)
				.end(buffer);
		});

		return {
			success: true,
			data: {
				url: result.secure_url,
				public_id: result.public_id,
				width: result.width,
				height: result.height,
				format: result.format,
				bytes: result.bytes,
			},
		};
	} catch (error: any) {
		return { success: false, error: error.message || "Upload failed" };
	}
}

export async function deleteFromCloudinary(publicId: string) {
	try {
		if (!publicId) throw new Error("No public_id provided");
		const result = await cloudinary.uploader.destroy(publicId);
		return { success: true, result };
	} catch (error: any) {
		return { success: false, error: error.message || "Delete failed" };
	}
}
