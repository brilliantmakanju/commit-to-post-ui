"use client";
// eslint-disable-next-line import/no-unresolved
import { Plus } from "lucide-react";
import { useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { AddRepositoryModal } from "@/components/repositories/add-repo";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	return (
		<>
			{isAddModalOpen && (
				<AddRepositoryModal
					onSuccess={() => {}}
					open={isAddModalOpen}
					onOpenChange={setIsAddModalOpen}
				/>
			)}
			<div className="flex items-center justify-between">
				{/* <h1 className="text-xl font-semibold">{greeting}</h1> */}
				<h1 className="text-xl font-semibold">Dashboard</h1>

				<Button
					onClick={() => setIsAddModalOpen(true)}
					className="bg-white text-black transition-colors hover:bg-zinc-200"
				>
					<Plus className="mr-2 h-4 w-4" />
					Add Repository
				</Button>
			</div>
		</>
	);
}
