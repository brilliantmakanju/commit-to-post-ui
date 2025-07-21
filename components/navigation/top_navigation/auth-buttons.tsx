"use client";

// import Link from "next/link";

// import AuthModal from "@/components/auth/modal";
import { Button } from "@/components/ui/button";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

const AuthButtons = () => {
	const openModal = useAuthModalStore(state => state.openModal);
	return (
		<div className="flex w-full space-x-4">
			{/* Previous modal implementation */}
			{/* <AuthModal /> */}

			{/* <Link href="/auth"> */}
			<NavbarButton className="w-full" variant="secondary">
				<Button className="w-full" onClick={() => openModal("login")}>
					Sign In
				</Button>
			</NavbarButton>
			{/* </Link> */}
		</div>
	);
};

export default AuthButtons;
