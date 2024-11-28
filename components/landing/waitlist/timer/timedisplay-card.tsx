import Image from 'next/image';

export const TimeDisplayCard: React.FC = () => {
	return (
		<div className="relative h-full w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
			<Image
				src="/Anime-Girl1.png"
				alt="Platform preview"
				layout="fill"
				objectFit="cover"
			/>
		</div>
	);
};
