'use client';

import AuthButtons from './auth-buttons';
import Logo from './logo';
import NavLinks from './nav-links';

const TopNavigation = () => {
	return (
		<header className="sticky top-0 z-50 w-full bg-[#FAFBFF]/80 backdrop-blur-xl dark:bg-slate-700/80">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-4">
					{/* Left Section: Logo + Nav Links */}
					<div className="flex items-center space-x-4">
						<Logo />
					</div>
					<NavLinks />
					{/* Right Section: Auth Buttons */}
					<div className="flex items-center">
						<AuthButtons />
					</div>
				</div>
			</div>
		</header>
	);
};

export default TopNavigation;
