/* eslint-disable import/no-unresolved */
"use client";
import { Check, Github, Twitter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { logout, signOut } from "@/server-actions/auth/signout";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

export default function SuccessPage() {
	const router = useRouter();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();

	const logoutClient = async () => {
		try {
			// Set logout state to true immediately to prevent UI flickering
			logoutStore.setLogout(true);

			// Call the API to invalidate the user's session (blacklist token)
			const { success } = await logout();

			// Clear all client-side data regardless of server response
			userStore.clearUser();
			organizationStore.clearOrganization();

			// Clear cookies
			await clearCookies();

			// Sign out from NextAuth with no redirect
			await signOut({ redirect: false });

			// Navigate to home page
			router.push("/");

			// Display success/error message
			if (!success) {
				toast.warning(
					"Server logout had issues, but you've been logged out locally",
				);
			}
		} catch {
			// Even if there's an error, ensure user is logged out locally
			toast.error(
				"Logout encountered an error, but you've been logged out locally",
			);

			// Force a router refresh to update UI state
			router.refresh();
		}
	};
	return (
		<section className="relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden px-1 py-12 font-sans md:px-0 md:py-0 md:pt-12 lg:py-20 lg:pl-12">
			<div className="flex items-center justify-center">
				<Card className="w-full max-w-md border-black/10 shadow-sm">
					<CardHeader className="pb-4">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black">
							<Check className="h-6 w-6 text-white" />
						</div>
						<h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
							Subscription Successful
						</h1>
					</CardHeader>
					<CardContent className="text-center text-zinc-600">
						<p className="mb-6">
							You&lsquo;ve successfully subscribed to Push to Post. Your Git
							commits will now be automatically converted to social media posts.
						</p>

						<div className="mb-6 flex items-center justify-center space-x-6">
							<div className="flex flex-col items-center">
								<Github className="h-8 w-8 text-black" />
								<div className="mt-2 text-xs font-medium">Git</div>
							</div>

							<div className="text-2xl font-light text-zinc-400">→</div>

							<div className="flex flex-col items-center">
								<Twitter className="h-8 w-8 text-black" />
								<div className="mt-2 text-xs font-medium">Social</div>
							</div>
						</div>

						<div className="rounded-md bg-zinc-50 p-3 text-sm">
							<p className="font-mono text-xs text-zinc-600">
								<span className="text-zinc-400">$</span> git commit -m
								&ldquo;Update landing page&ldquo;
							</p>
							<div className="mt-2 h-px w-full bg-zinc-200"></div>
							<p className="mt-2 text-xs text-zinc-600">
								Just updated our landing page with new features! #development
								#webdev
							</p>
						</div>

						<div className="mt-6 rounded-md border border-black/10 bg-zinc-50 p-4">
							<div className="flex items-center justify-center">
								<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-black">
									<Check className="h-4 w-4 text-white" />
								</div>
								<h3 className="font-medium text-black">Important Next Step</h3>
							</div>
							<p className="mt-2 text-sm">
								Please{" "}
								<span className="font-semibold">log out and log back in</span>{" "}
								to fully activate your subscription and see all features.
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-3 pt-2">
						<Button
							onClick={() => logoutClient()}
							className="w-full bg-black text-white hover:bg-black/90"
						>
							Log Out
						</Button>
						<Button
							variant="outline"
							className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50"
						>
							<Link href="/dashboard">Go to Dashboard</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
}
