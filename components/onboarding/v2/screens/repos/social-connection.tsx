import React from "react";
import { FaDiscord, FaLinkedinIn, FaSlack, FaTimes } from "react-icons/fa";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const getIcon = (iconName: string) => {
	switch (iconName) {
		case "linkedin": {
			return <FaLinkedinIn className="h-5 w-5 text-gray-600" />;
		}
		case "x-twitter": {
			return <XIcon className="h-5 w-5 text-gray-600" />;
		}
		case "slack": {
			return <FaSlack className="h-5 w-5 text-gray-600" />;
		}
		case "discord": {
			return <FaDiscord className="h-5 w-5 text-gray-600" />;
		}
		default: {
			return <FaLinkedinIn className="h-5 w-5 text-gray-600" />;
		}
	}
};

interface SocialConnectionProps {
	socials: any[];
	onRemoveSocial: (index: number) => void;
}

export const SocialConnection: React.FC<SocialConnectionProps> = ({
	socials,
	onRemoveSocial,
}) => {
	return (
		<div className="w-full">
			<div className="mb-2 flex items-center justify-between">
				<h4 className="text-sm font-medium text-gray-700">
					Connected Accounts
				</h4>
				<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
					{socials?.length || 0} account{socials && socials.length > 1 && "s"}
				</span>
			</div>
			{!socials || socials.length === 0 ? (
				<div className="px-3 py-2 text-center">
					<p className="text-sm text-gray-500">No accounts connected yet</p>
				</div>
			) : (
				<div className="flex w-full flex-wrap gap-2">
					{socials.map((social, index) => (
						<div
							key={`${social.platform}-${social.name}-${index}`}
							className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 py-1 pl-1 pr-2 transition-colors hover:border-gray-400"
						>
							<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 bg-white p-2">
								{getIcon(social.platform)}
							</div>
							<span className="text-sm">
								{social.handle &&
								!["null", "undefined", ""].includes(social.handle)
									? social.handle
									: social.name}
							</span>
							<button
								onClick={() => onRemoveSocial(index)}
								className="p-1 text-gray-400 transition-colors hover:text-gray-600"
							>
								<FaTimes className="h-4 w-4" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
