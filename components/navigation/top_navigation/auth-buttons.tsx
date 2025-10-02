"use client";
import { FaArrowRight } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

const AuthButtons = () => {
	const openModal = useAuthModalStore(state => state.openModal);

	return (
		<div className="flex items-center space-x-6">
			{/* Sign In with underline animation */}
			<NavbarButton
				className="bg-transparent p-0 hover:bg-transparent"
				variant="secondary"
			>
				<Button
					variant={"secondary"}
					className="group relative px-4 py-2 text-sm font-medium text-arch-black shadow-none"
					onClick={() => openModal("login")}
				>
					<span className="relative bg-transparent">
						Sign In
						<span className="absolute bottom-0 left-0 block h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
					</span>
				</Button>
			</NavbarButton>

			{/* Get Started with morphing arrow */}
			<NavbarButton
				className="bg-transparent p-0 hover:bg-transparent"
				variant="primary"
			>
				<Button
					className="group relative h-auto w-[180px] overflow-hidden border border-white/20 bg-black px-6 py-2 text-sm font-medium text-gray-100 shadow-none transition-all duration-300 hover:w-[200px]"
					onClick={() => openModal("signup")}
				>
					<span className="flex items-center justify-center">
						<span className="transition-all duration-300">
							GET STARTED FREE
						</span>
						<span className="ml-0 flex w-0 overflow-hidden transition-all duration-500 ease-out group-hover:ml-2 group-hover:w-5">
							<FaArrowRight className="translate-x-4 scale-0 transform opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 group-hover:duration-500 group-hover:ease-out" />
						</span>
					</span>
				</Button>
			</NavbarButton>
		</div>
	);
};

export default AuthButtons;
