'use client';

import Logo from './logo';

const AuthTopNavigation = () => {
	return (
		<header className="absolute top-0 z-[20] w-full bg-[#FAFBFF]/80 backdrop-blur-xl dark:bg-slate-700/80">
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-4">
					{/* Left Section: Logo */}
					<div className="flex items-center space-x-4">
						<Logo />
					</div>
				</div>
			</div>
		</header>
	);
};

export default AuthTopNavigation;
