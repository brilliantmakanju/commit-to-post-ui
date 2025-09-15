import {
	FaBolt,
	FaBook,
	FaCube,
	FaMagic,
	FaPaintBrush,
	FaSquare,
	FaTint,
	FaTv,
} from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/zustand/chat-store";

const imageStyles = [
	{
		id: "Studio Ghibli Animation" as const,
		name: "Studio Ghibli",
		icon: FaMagic,
	},
	{
		id: "Pixar 3D Animation" as const,
		name: "Pixar 3D",
		icon: FaCube,
	},
	{
		id: "Classic Disney Hand-Drawn" as const,
		name: "Disney Hand-Drawn",
		icon: FaPaintBrush,
	},
	{
		id: "Modern Flat Design" as const,
		name: "Flat Design",
		icon: FaSquare,
	},
	{
		id: "Manga/Anime Style" as const,
		name: "Manga/Anime",
		icon: FaBolt,
	},
	{
		id: "Retro 80s/90s Computer Graphics" as const,
		name: "Retro Computer",
		icon: FaTv,
	},
	{
		id: "Watercolor Illustration" as const,
		name: "Watercolor",
		icon: FaTint,
	},
	{
		id: "Comic Book/Pop Art" as const,
		name: "Comic Book",
		icon: FaBook,
	},
];

export function ImageStyleModal() {
	const {
		isImageModalOpen,
		selectedImageStyle,
		setImageModalOpen,
		setSelectedMode,
		setSelectedImageStyle,
	} = useChatStore();

	const handleStyleSelect = (styleId: (typeof imageStyles)[number]["id"]) => {
		// setSelectedImageStyle(styleId);
		setImageModalOpen(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setImageModalOpen(false);
			if (!selectedImageStyle) {
				setSelectedMode(undefined);
			}
		}
	};

	return (
		<Dialog open={isImageModalOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-lg border-gray-300 bg-white shadow-lg">
				<DialogHeader className="pb-6">
					<DialogTitle className="text-center text-xl font-semibold text-gray-900">
						Choose Image Style
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3 pb-2">
					{imageStyles.map(style => {
						const Icon = style.icon;
						// const isSelected = selectedImageStyle === style.id;
						const isSelected = false;
						return (
							<Button
								key={style.id}
								variant="ghost"
								className={`h-24 flex-col gap-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
									isSelected
										? "border-gray-900 bg-gray-100 text-gray-900 shadow-md"
										: "border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
								} `}
								onClick={() => handleStyleSelect(style.id)}
							>
								<Icon className="h-6 w-6" />
								<span className="px-1 text-center text-xs font-medium">
									{style.name}
								</span>
							</Button>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
