import Image from "next/image";
import React from "react";

type CoreFeatureItemProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
	points: string[];
	imagePosition?: string;
	imageURL: string;
};

const CoreFeatureItem = ({
	icon,
	title,
	description,
	points,
	imagePosition = "right",
	imageURL,
}: CoreFeatureItemProps) => {
	return (
		<div
			className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2 ${imagePosition === "left" ? "" : ""}`}
		>
			{imagePosition === "left" && (
				<div className="relative order-2 aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-lg md:order-1">
					<Image
						src={imageURL}
						alt={title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLUEwLi0tLTAtQFBGPzpQRT4tLS9gVkVMS1BJTTYyU15CTUVNTUz/2wBDARUXFx4aHR4eHUxCQU1MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
					/>
				</div>
			)}

			<div
				className={`space-y-6 ${imagePosition === "left" ? "order-1 md:order-2" : ""}`}
			>
				<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
					{icon}
				</div>
				<h2 className="text-2xl font-semibold text-[#8B4513]">{title}</h2>
				<div className="space-y-4">
					<p className="text-[#666666]">{description}</p>
					<ul className="space-y-2">
						{points.map((point, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-[#666666]"
							>
								<div className="h-1.5 w-1.5 rounded-full bg-[#D35400]" />
								{point}
							</li>
						))}
					</ul>
				</div>
			</div>

			{imagePosition === "right" && (
				<div className="relative order-2 aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-lg md:order-1">
					<Image
						src={imageURL}
						alt={title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLUEwLi0tLTAtQFBGPzpQRT4tLS9gVkVMS1BJTTYyU15CTUVNTUz/2wBDARUXFx4aHR4eHUxCQU1MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
					/>
				</div>
			)}
		</div>
	);
};

export default CoreFeatureItem;
