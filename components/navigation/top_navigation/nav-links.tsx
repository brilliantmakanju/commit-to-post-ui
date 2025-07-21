"use client";
import Link from "next/link";

import { links } from "./data";

const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
	return (
		<nav className="hidden md:flex">
			<ul
				className={`flex ${isMobile ? "flex-col space-y-4" : "flex-row space-x-8"} font-mono text-sm font-medium`}
			>
				{links.map((link, index) => (
					<li key={index} className={isMobile ? "w-full" : ""}>
						{link.link.startsWith("mailto:") ? (
							<Link
								href={link.link}
								className="group relative inline-block py-2 text-gray-800 transition-colors duration-200 hover:text-black dark:text-gray-300 dark:hover:text-white"
							>
								<span className="relative flex items-center">
									{/* Left curly bracket */}
									<span className="mr-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
										{"{"}
									</span>

									{/* Link text */}
									<span className="relative">
										{link.name}
										{/* Underline that animates from right to left */}
										<span
											className="absolute -bottom-0.5 right-0 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full dark:bg-white"
											style={{ transformOrigin: "right" }}
										></span>
									</span>

									{/* Right curly bracket */}
									<span className="ml-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
										{"}"}
									</span>
								</span>
							</Link>
						) : (
							<Link
								href={link.link}
								className="group relative inline-block py-2 text-gray-800 transition-colors duration-200 hover:text-black dark:text-gray-300 dark:hover:text-white"
							>
								<span className="relative flex items-center">
									{/* Left curly bracket */}
									<span className="mr-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
										{"{"}
									</span>

									{/* Link text */}
									<span className="relative">
										{link.name}
										{/* Underline that animates from right to left */}
										<span
											className="absolute -bottom-0.5 right-0 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full dark:bg-white"
											style={{ transformOrigin: "right" }}
										></span>
									</span>

									{/* Right curly bracket */}
									<span className="ml-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
										{"}"}
									</span>
								</span>
							</Link>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
};

export default NavLinks;
