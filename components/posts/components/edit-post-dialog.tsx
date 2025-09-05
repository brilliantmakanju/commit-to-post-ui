/* eslint-disable import/no-unresolved */
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostItem } from "@/types";

interface EditPostDialogProps {
	editingPost: PostItem | undefined;
	editedContent: string;
	onContentChange: (content: string) => void;
	onClose: () => void;
	onSave: () => void;
	isLoading: boolean;
}

export default function EditPostDialog({
	editingPost,
	editedContent,
	onContentChange,
	onClose,
	onSave,
	isLoading,
}: EditPostDialogProps) {
	return (
		<Dialog open={!!editingPost} onOpenChange={open => !open && onClose()}>
			<DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-zinc-800/50 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm sm:w-full">
				<DialogHeader className="pb-6">
					<DialogTitle className="text-xl font-light text-zinc-100">
						Edit Post
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Make changes to your post content
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Label
						htmlFor="content"
						className="text-sm font-medium text-zinc-300"
					>
						Content
					</Label>
					<Textarea
						id="content"
						value={editedContent}
						onChange={event_ => onContentChange(event_.target.value)}
						rows={12}
						className="resize-none rounded-xl border-zinc-800/50 bg-zinc-800/30 text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:border-zinc-600/70 focus:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-600/30"
						placeholder="Write your post content here..."
					/>
				</div>
				<DialogFooter className="flex-col gap-3 sm:flex-row">
					<Button
						variant="outline"
						onClick={onClose}
						className="w-full border-zinc-700/50 bg-zinc-800/50 text-zinc-300 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-700/70 hover:text-zinc-100 sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={onSave}
						disabled={isLoading}
						className="w-full border-zinc-700/50 bg-zinc-700/50 text-zinc-100 transition-all duration-300 hover:border-zinc-600/70 hover:bg-zinc-600/70 hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 sm:w-auto"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save changes"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
