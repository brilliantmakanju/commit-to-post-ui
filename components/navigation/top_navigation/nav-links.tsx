"use client";
import Link from "next/link";
import React, { useState } from "react";

import { links } from "./data";

const NavLinks = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// const [darkMode, setDarkMode] = useState(false);

	// useEffect(() => {
	// 	const root = globalThis.window.document.documentElement;
	// 	root.classList.toggle("dark", darkMode);
	// }, [darkMode]);

	return (
		<nav className={`${isMenuOpen ? "block" : "hidden"} md:block`}>
			{/*<Button*/}
			{/*	variant="ghost"*/}
			{/*	size="icon"*/}
			{/*	onClick={() => setDarkMode(!darkMode)}*/}
			{/*	className="rounded-full"*/}
			{/*>*/}
			{/*	{darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}*/}
			{/*</Button>*/}
			<ul className="flex flex-col space-y-4 text-sm font-medium text-slate-700 dark:text-slate-200 md:flex-row md:space-x-8 md:space-y-0">
				{links.map((link, index) => (
					<li key={index}>
						{link.href.startsWith("mailto:") ? (
							<Link
								href={link.href}
								className="group relative hover:text-emerald-500"
							>
								{link.name}
								<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-500 transition-all group-hover:w-full"></span>
							</Link>
						) : (
							<Link
								href={link.href}
								// onClick={event_ => handleScroll(event_, link.href)}
								className="group relative cursor-pointer hover:text-emerald-500"
							>
								{link.name}
								<span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-emerald-500 transition-all group-hover:w-full"></span>
							</Link>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
};

export default NavLinks;
