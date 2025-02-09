"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

// import AuthModal from "@/components/auth/modal";

const AuthButtons = () => {
	return (
		<div className="flex space-x-4">
			{/* Previous modal implementation */}
			{/* <AuthModal trigger={<Button variant="secondary">Sign In</Button>} /> */}

			<Link href="/auth">
				<Button variant="secondary">Sign In</Button>
			</Link>
		</div>
	);
};

export default AuthButtons;
