"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const deleteSchema = z.object({
	password: z.string().min(1, "Password is required"),
});

type TeamMember = {
	id: string;
	name: string;
	role: string;
	joinedDate: Date;
};

export function TeamMembers() {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
		{
			id: "1",
			name: "John Doe",
			role: "Admin",
			joinedDate: new Date("2022-01-01"),
		},
		{
			id: "2",
			name: "Jane Smith",
			role: "Member",
			joinedDate: new Date("2022-06-15"),
		},
	]);
	const [editingMember, setEditingMember] = useState<string | null>();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [memberToDelete, setMemberToDelete] = useState<string | null>();
	const [useRelativeDates, setUseRelativeDates] = useState(true);

	const deleteForm = useForm<z.infer<typeof deleteSchema>>({
		resolver: zodResolver(deleteSchema),
	});

	const formatDate = (date: Date) => {
		if (useRelativeDates) {
			const now = new Date();
			const diffTime = Math.abs(now.getTime() - date.getTime());
			const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
			const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

			if (diffYears > 0) {
				return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
			} else if (diffMonths > 0) {
				return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
			} else {
				return "Less than a month ago";
			}
		} else {
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		}
	};

	const handleRoleChange = (memberId: string, newRole: string) => {
		setTeamMembers(members =>
			members.map(member =>
				member.id === memberId ? { ...member, role: newRole } : member,
			),
		);
	};

	const handleDeleteMember = (memberId: string) => {
		setMemberToDelete(memberId);
		setIsDeleteDialogOpen(true);
	};

	const onConfirmDelete = (values: z.infer<typeof deleteSchema>) => {
		// TODO: Implement the actual delete logic here
		setTeamMembers(members =>
			members.filter(member => member.id !== memberToDelete),
		);
		setIsDeleteDialogOpen(false);
		setMemberToDelete(undefined);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-end space-x-2">
				<span className="text-sm text-gray-500">
					{useRelativeDates ? "Relative" : "Absolute"} dates
				</span>
				<Switch
					checked={useRelativeDates}
					onCheckedChange={setUseRelativeDates}
					aria-label="Toggle date format"
				/>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{teamMembers.map(member => (
						<TableRow key={member.id}>
							<TableCell>{member.name}</TableCell>
							<TableCell>
								{editingMember === member.id ? (
									<Select
										onValueChange={value => handleRoleChange(member.id, value)}
										defaultValue={member.role}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Admin">Admin</SelectItem>
											<SelectItem value="Member">Member</SelectItem>
										</SelectContent>
									</Select>
								) : (
									member.role
								)}
							</TableCell>
							<TableCell>{formatDate(member.joinedDate)}</TableCell>
							<TableCell>
								{editingMember === member.id ? (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setEditingMember(undefined)}
									>
										<X className="h-4 w-4" />
									</Button>
								) : (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setEditingMember(member.id)}
									>
										<Pencil className="h-4 w-4" />
									</Button>
								)}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeleteMember(member.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Are you sure you want to delete this team member?
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Please enter your password to
							confirm.
						</DialogDescription>
					</DialogHeader>
					<Form {...deleteForm}>
						<form
							onSubmit={deleteForm.handleSubmit(onConfirmDelete)}
							className="space-y-4"
						>
							<FormField
								control={deleteForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit" variant="destructive">
									Confirm Delete
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
