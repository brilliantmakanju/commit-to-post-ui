// Transform backend ChatLog format to frontend ChatMessage format
export const transformChatData = (backendChatLogs: any[]) => {
	const messages: any[] = [];

	backendChatLogs.forEach(log => {
		// Add user message
		messages.push(
			{
				id: `user-${log.id}`,
				content: log.user_input,
				type: "post" as const, // Since you're only handling post generation
				timestamp: log.user_timestamp,
				isUser: true,
				platform: log.platform,
			},
			{
				id: `ai-${log.id}`,
				content: log.ai_response,
				type: "post" as const,
				timestamp: log.ai_timestamp,
				isUser: false,
				platform: log.platform,
				error: log.generation_successful ? undefined : log.error_message,
			},
		);
	});

	// Sort by timestamp to maintain chronological order
	return messages.sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);
};
