import { FaDiscord, FaLinkedin, FaSlack } from "react-icons/fa";

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

export const getChannelIcon = (channel: string) => {
	const iconClass =
		"h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-all duration-200";
	switch (channel) {
		case "linkedin": {
			return <FaLinkedin className={`${iconClass} text-blue-300`} />;
		}
		case "twitter":
		case "x":
		case "x-twitter": {
			return <XIcon className={`${iconClass} text-arch-white`} />;
		}
		case "slack": {
			return <FaSlack className={`${iconClass} text-purple-300`} />;
		}
		case "discord": {
			return <FaDiscord className={`${iconClass} text-indigo-300`} />;
		}
		default: {
			return;
		}
	}
};

export const getPlatformIcon = (platform: string) => {
	const iconClass = "h-4 w-4";
	switch (platform) {
		case "linkedin": {
			return <FaLinkedin className={`${iconClass} text-blue-500`} />;
		}
		case "twitter":
		case "x":
		case "x-twitter": {
			return <XIcon className={`${iconClass} text-white`} />;
		}
		case "slack": {
			return <FaSlack className={`${iconClass} text-purple-500`} />;
		}
		case "discord": {
			return <FaDiscord className={`${iconClass} text-indigo-500`} />;
		}
		default: {
			return <div className="h-4 w-4 rounded bg-zinc-500" />;
		}
	}
};
