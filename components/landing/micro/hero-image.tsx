'use client';

import Image from 'next/image';

interface HeroImageProps {
	src: string;
	alt: string;
	height?: number;
	width?: number;
	className?: string;
}

const HeroImage: React.FC<HeroImageProps> = ({
	src,
	alt,
	height = 720,
	width = 1280,
	className = '',
}) => {
	return (
		<div className="mx-auto mt-8 w-full max-w-5xl">
			<Image
				src={src}
				alt={alt}
				height={height}
				width={width}
				priority={true}
				className={`aspect-video w-full overflow-hidden rounded-xl object-cover object-center ${className}`}
			/>
		</div>
	);
};

export default HeroImage;
