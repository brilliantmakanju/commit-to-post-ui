import { FaDiscord, FaLinkedin } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/zustand/chat-store";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const platforms = [
	{ id: "linkedin" as const, name: "LinkedIn", icon: FaLinkedin },
	{ id: "twitter" as const, name: "Twitter", icon: XIcon },
	{ id: "discord" as const, name: "Discord", icon: FaDiscord },
];

export function PlatformModal() {
	const {
		isPostModalOpen,
		selectedPlatform,
		setPostModalOpen,
		setSelectedMode,
		setSelectedPlatform,
	} = useChatStore();

	const handlePlatformSelect = (platformId: (typeof platforms)[0]["id"]) => {
		setSelectedPlatform(platformId);
		setPostModalOpen(false);
		// Keep the mode as "post" when closing the modal
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setPostModalOpen(false);
			// If no platform was selected, clear the mode
			if (!selectedPlatform) {
				setSelectedMode(undefined);
			}
		}
	};

	return (
		<Dialog open={isPostModalOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Select Platform</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-3 py-4">
					{platforms.map(platform => {
						const Icon = platform.icon;
						const isSelected = selectedPlatform === platform.id;
						return (
							<Button
								key={platform.id}
								variant={isSelected ? "default" : "outline"}
								className="h-12 justify-start text-left"
								onClick={() => handlePlatformSelect(platform.id)}
							>
								<Icon className="mr-3 h-5 w-5" />
								<span className="font-medium">{platform.name}</span>
							</Button>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
