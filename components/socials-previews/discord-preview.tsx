"use client";
import { Download, FileText } from "lucide-react";
import Image from "next/image";
import React from "react";

// Types
export interface DiscordUser {
	name: string;
	avatar: string;
	bot?: boolean;
	app?: boolean;
	verified?: boolean;
}

export interface DiscordEmbed {
	title?: string;
	description?: string;
	url?: string;
	color?: string;
	image?: string;
	thumbnail?: string;
	author?: {
		name: string;
		icon?: string;
		url?: string;
	};
	footer?: {
		text: string;
		icon?: string;
	};
	timestamp?: string;
	fields?: Array<{
		name: string;
		value: string;
		inline?: boolean;
	}>;
}

interface DiscordAttachment {
	url: string;
	filename: string;
	size: number;
	type: "image" | "video" | "audio" | "file";
	width?: number;
	height?: number;
}

interface DiscordReaction {
	emoji: string;
	count: number;
	reacted?: boolean;
}

interface DiscordPreviewProps {
	content: string;
	user: DiscordUser;
	timestamp?: string;
	attachments?: DiscordAttachment[];
	embeds?: DiscordEmbed[];
	reactions?: DiscordReaction[];
	repliedTo?: {
		user: DiscordUser;
		content: string;
	};
	edited?: boolean;
	pinned?: boolean;
	thread?: boolean;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
	const sizes = ["B", "KB", "MB", "GB"];
	if (bytes === 0) return "0 B";
	const index = Math.floor(Math.log(bytes) / Math.log(1024));
	return (
		Math.round((bytes / Math.pow(1024, index)) * 100) / 100 + " " + sizes[index]
	);
};

const formatTimestamp = (timestamp?: string): string => {
	if (!timestamp) {
		const now = new Date();
		return `Today at ${now.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})}`;
	}
	const date = new Date(timestamp);
	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();

	if (isToday) {
		return `Today at ${date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})}`;
	}

	return date.toLocaleDateString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	});
};

const parseLinks = (text: string) => {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.split(urlRegex).map((part, index) => {
		if (urlRegex.test(part)) {
			return (
				<a
					key={index}
					href={part}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-400 hover:underline"
				>
					{part}
				</a>
			);
		}
		return part;
	});
};

// Components
const DiscordAvatar: React.FC<{ user: DiscordUser; size?: number }> = ({
	user,
	size = 40,
}) => (
	<div
		className="flex-shrink-0 overflow-hidden rounded-full"
		style={{ width: size, height: size }}
	>
		<Image
			width={999}
			height={999}
			src={user.avatar}
			alt={`${user.name}'s avatar`}
			className="h-full w-full object-cover"
			onError={event_ => {
				const target = event_.target as HTMLImageElement;
				target.style.display = "none";
				target.parentElement!.innerHTML = `
          <div class="flex h-full w-full items-center justify-center bg-blue-600 text-white text-sm font-medium">
            ${user.name.charAt(0).toUpperCase()}
          </div>
        `;
			}}
		/>
	</div>
);

const DiscordEmbed: React.FC<{ embed: DiscordEmbed }> = ({ embed }) => (
	<div
		className="mt-2 max-w-lg rounded bg-[#2f3136] p-4"
		style={{ borderLeft: `4px solid ${embed.color || "#202225"}` }}
	>
		{embed.author && (
			<div className="mb-2 flex items-center gap-2">
				{embed.author.icon && (
					<Image
						width={999}
						height={999}
						src={embed.author.icon}
						alt=""
						className="h-6 w-6 rounded-full"
					/>
				)}
				<span className="text-sm font-medium text-white">
					{embed.author.name}
				</span>
			</div>
		)}

		{embed.title && (
			<div className="mb-2">
				{embed.url ? (
					<a
						href={embed.url}
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-blue-400 hover:underline"
					>
						{embed.title}
					</a>
				) : (
					<div className="font-semibold text-white">{embed.title}</div>
				)}
			</div>
		)}

		{embed.description && (
			<div className="mb-2 text-sm leading-relaxed text-gray-300">
				{parseLinks(embed.description)}
			</div>
		)}

		{embed.fields && embed.fields.length > 0 && (
			<div
				className="mb-2 grid gap-2"
				style={{
					gridTemplateColumns: embed.fields.some(f => f.inline)
						? "repeat(auto-fit, minmax(150px, 1fr))"
						: "1fr",
				}}
			>
				{embed.fields.map((field, index) => (
					<div key={index} className={field.inline ? "" : "col-span-full"}>
						<div className="mb-1 text-sm font-semibold text-white">
							{field.name}
						</div>
						<div className="text-sm text-gray-300">
							{parseLinks(field.value)}
						</div>
					</div>
				))}
			</div>
		)}

		{embed.image && (
			<div className="mt-2">
				<Image
					width={999}
					height={999}
					src={embed.image}
					alt=""
					className="h-auto max-w-full rounded"
					style={{ maxHeight: "400px" }}
				/>
			</div>
		)}

		{embed.thumbnail && (
			<div className="float-right mb-2 ml-4">
				<Image
					width={999}
					height={999}
					src={embed.thumbnail}
					alt=""
					className="rounded"
					style={{ maxWidth: "80px", maxHeight: "80px" }}
				/>
			</div>
		)}

		{(embed.footer || embed.timestamp) && (
			<div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
				{embed.footer?.icon && (
					<Image
						width={999}
						height={999}
						src={embed.footer.icon}
						alt=""
						className="h-4 w-4 rounded-full"
					/>
				)}
				{embed.footer?.text}
				{embed.footer?.text && embed.timestamp && " • "}
				{embed.timestamp && formatTimestamp(embed.timestamp)}
			</div>
		)}
	</div>
);

const DiscordAttachment: React.FC<{ attachment: DiscordAttachment }> = ({
	attachment,
}) => {
	if (attachment.type === "image") {
		return (
			<div className="mt-2">
				<Image
					width={999}
					height={999}
					src={attachment.url}
					alt={attachment.filename}
					className="h-auto max-w-full cursor-pointer rounded transition-opacity hover:opacity-90"
					style={{ maxHeight: "400px" }}
					onClick={() => window.open(attachment.url, "_blank")}
				/>
			</div>
		);
	}

	if (attachment.type === "video") {
		return (
			<div className="relative mt-2">
				<video
					controls
					className="h-auto max-w-full rounded"
					style={{ maxHeight: "400px" }}
				>
					<source src={attachment.url} />
					Your browser does not support the video tag.
				</video>
			</div>
		);
	}

	return (
		<div className="mt-2 flex cursor-pointer items-center gap-3 rounded bg-[#2f3136] p-3 transition-colors hover:bg-[#36393f]">
			<div className="flex h-12 w-12 items-center justify-center rounded bg-[#4f545c]">
				<FileText className="h-6 w-6 text-gray-300" />
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium text-blue-400 hover:underline">
					{attachment.filename}
				</div>
				<div className="text-xs text-gray-400">
					{formatFileSize(attachment.size)}
				</div>
			</div>
			<Download className="h-5 w-5 text-gray-400 transition-colors hover:text-white" />
		</div>
	);
};

const DiscordReactions: React.FC<{ reactions: DiscordReaction[] }> = ({
	reactions,
}) => (
	<div className="mt-2 flex flex-wrap gap-1">
		{reactions.map((reaction, index) => (
			<div
				key={index}
				className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm transition-colors ${
					reaction.reacted
						? "border border-blue-600/50 bg-blue-600/20 text-blue-300"
						: "bg-[#2f3136] text-gray-300 hover:bg-[#36393f]"
				}`}
			>
				<span>{reaction.emoji}</span>
				<span className="text-xs">{reaction.count}</span>
			</div>
		))}
	</div>
);

// Main component
export const DiscordPreview: React.FC<DiscordPreviewProps> = ({
	content,
	user,
	timestamp,
	attachments = [],
	embeds = [],
	reactions = [],
	repliedTo,
	edited = false,
	pinned = false,
	thread = false,
}) => {
	return (
		<div className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg bg-[#36393f]">
			<div className="border-b border-gray-700 bg-[#2f3136] px-4 py-2">
				<div className="flex items-center gap-2 text-sm font-medium text-gray-300">
					<span className="text-gray-400">#</span>
					general
					{pinned && <span className="text-xs text-yellow-500">📌</span>}
					{thread && <span className="text-xs text-blue-400">🧵</span>}
				</div>
			</div>

			<div className="p-4">
				{repliedTo && (
					<div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
						<div className="flex h-4 w-6 items-center">
							<div className="h-px w-4 rounded bg-gray-600"></div>
							<div className="ml-1 h-2 w-px rounded bg-gray-600"></div>
						</div>
						<DiscordAvatar user={repliedTo.user} size={16} />
						<span className="cursor-pointer hover:text-white">
							{repliedTo.user.name}
						</span>
						<span className="max-w-xs truncate">{repliedTo.content}</span>
					</div>
				)}

				<div className="flex gap-4">
					<DiscordAvatar user={user} />

					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<span className="cursor-pointer font-semibold text-white hover:underline">
								{user.name}
							</span>
							{user.bot && (
								<span className="rounded bg-blue-600 px-1 py-0.5 text-xs font-bold text-white">
									BOT
								</span>
							)}
							{user.app && (
								<span className="rounded bg-blue-600 px-1 py-0.5 text-xs font-bold text-white">
									APP
								</span>
							)}
							{user.verified && (
								<span className="rounded bg-green-600 px-1 py-0.5 text-xs font-bold text-white">
									✓
								</span>
							)}
							<span className="text-xs text-gray-400 hover:text-gray-300">
								{formatTimestamp(timestamp)}
							</span>
							{edited && (
								<span className="text-xs text-gray-500">(edited)</span>
							)}
						</div>

						<div className="mb-1 text-sm leading-relaxed text-gray-100">
							{parseLinks(content)}
						</div>

						{attachments.map((attachment, index) => (
							<DiscordAttachment key={index} attachment={attachment} />
						))}

						{embeds.map((embed, index) => (
							<DiscordEmbed key={index} embed={embed} />
						))}

						{reactions.length > 0 && <DiscordReactions reactions={reactions} />}
					</div>
				</div>
			</div>
		</div>
	);
};

// // Example usage component
// const DiscordPreviewExample: React.FC = () => {
//   const sampleUser: DiscordUser = {
//     name: "Meltwater",
//     avatar: "/api/placeholder/40/40",
//     bot: true
//   };

//   const sampleEmbed: DiscordEmbed = {
//     title: "Meltwater Summit NYC 2024",
//     description: "Join us for the biggest marketing and communications event of the year!",
//     color: "#5865f2",
//     image: "/api/placeholder/400/200",
//     url: "https://meltwater.com/summit",
//     author: {
//       name: "Meltwater Events",
//       icon: "/api/placeholder/20/20"
//     },
//     footer: {
//       text: "Meltwater",
//       icon: "/api/placeholder/16/16"
//     },
//     timestamp: new Date().toISOString()
//   };

//   return (
//     <div className="space-y-6 p-6 bg-[#36393f] min-h-screen">
//       <h2 className="text-white text-xl font-semibold">Discord Preview Examples</h2>

//       {/* Simple message */}
//       <DiscordPreview
//         content="Let the countdown begin! A few more days left to save $200 and grab your early bird tickets for Meltwater Summit in NYC: https://bit.ly/3ppm"
//         user={sampleUser}
//       />

//       {/* Message with image attachment */}
//       <DiscordPreview
//         content="Check out this amazing venue for our upcoming event! 🎉"
//         user={sampleUser}
//         attachments={[{
//           url: "/api/placeholder/500/300",
//           filename: "venue.jpg",
//           size: 2048576,
//           type: "image",
//           width: 500,
//           height: 300
//         }]}
//         reactions={[
//           { emoji: "🔥", count: 12, reacted: true },
//           { emoji: "❤️", count: 8 },
//           { emoji: "🎉", count: 5 }
//         ]}
//       />

//       {/* Message with embed */}
//       <DiscordPreview
//         content="Don't miss out on our biggest event of the year!"
//         user={sampleUser}
//         embeds={[sampleEmbed]}
//       />
//     </div>
//   );
// };

// export default DiscordPreviewExample;
