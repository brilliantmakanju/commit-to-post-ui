"use client";
// eslint-disable-next-line import/no-unresolved
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { AddRepositoryModal } from "@/components/repositories/add-repo";
// eslint-disable-next-line import/no-unresolved
import { Button } from "@/components/ui/button";
// eslint-disable-next-line import/no-unresolved
import { getDynamicGreeting } from "@/lib/get-dynamic-greeting";
// eslint-disable-next-line import/no-unresolved
import useUserStore from "@/zustand/useuser-store";

export function DashboardHeader() {
	const userStore = useUserStore();
	const { data, status } = useSession();
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [firstNameFromFull, lastNameFromFull] = userStore.full_name
		? userStore.full_name.split(" ")
		: ["", ""];
	// Use store data while loading, then use session data when available
	const userData = userStore.justUpdated
		? {
				firstName: firstNameFromFull || data?.user?.first_name || "",
				lastName: lastNameFromFull || data?.user?.last_name || "",
				email: userStore.email || data?.user?.email || "",
			}
		: status === "loading"
			? {
					firstName: firstNameFromFull || "",
					lastName: lastNameFromFull || "",
					email: userStore.email || "",
				}
			: data?.user?.type === "magic" && status === "authenticated"
				? {
						firstName: data?.user?.first_name || firstNameFromFull || "",
						lastName: data?.user?.last_name || lastNameFromFull || "",
						email: data?.user?.email || userStore.email || "",
					}
				: {
						firstName: firstNameFromFull || data?.user?.first_name || "",
						lastName: lastNameFromFull || data?.user?.last_name || "",
						email: userStore.email || data?.user?.email || "",
					};

	const firstName = userData.firstName;

	const greetingRef = useRef<string>(getDynamicGreeting(firstName));
	const greeting = greetingRef.current;
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
