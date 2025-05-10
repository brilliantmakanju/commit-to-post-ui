"use client";

// import Link from "next/link";

// import AuthModal from "@/components/auth/modal";
import { Button } from "@/components/ui/button";
import useAuthModalStore from "@/lib/zustand/auth/use-auth-modal";

const AuthButtons = () => {
	const openModal = useAuthModalStore(state => state.openModal);
	return (
		<div className="flex space-x-4">
			{/* Previous modal implementation */}
			{/* <AuthModal /> */}

			{/* <Link href="/auth"> */}
			<Button onClick={() => openModal("login")}>Sign In</Button>
			{/* </Link> */}
		</div>
	);
};

export default AuthButtons;
