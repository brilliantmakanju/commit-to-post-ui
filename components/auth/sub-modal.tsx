'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ViewType = 'login' | 'signup' | 'forgot';

interface FormProps {
	setView: (view: ViewType) => void;
}

const SubAuthPage = () => {
	const [view, setView] = useState<ViewType>('login');
	const router = useRouter();

	const handleSetView = (newView: ViewType) => {
		setView(newView);
		globalThis.window.history.pushState(undefined, '', `/auth?view=${newView}`);
		if (newView === 'forgot') {
			const modalOverlay = globalThis.document.querySelector(
				'[data-state="open"]',
			) as HTMLElement;
			if (modalOverlay) {
				modalOverlay.click(); // This simulates the click on the modal overlay
			}
			router.push(`/auth?view=${newView}`);
		}
	};

	const slideVariants = {
		enterLeft: { x: '-100%', opacity: 0 },
		enterRight: { x: '100%', opacity: 0 },
		center: { x: '0%', opacity: 1 },
		exitLeft: { x: '-100%', opacity: 0 },
		exitRight: { x: '100%', opacity: 0 },
	};

	return (
		<div className="flex h-[600px] w-full flex-col bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB] md:flex-row">
			<AnimatePresence initial={false} mode="wait">
				{view === 'signup' ? (
					<>
						<motion.div
							key="signup-form"
							variants={slideVariants}
							initial="enterLeft"
							animate="center"
							exit="exitLeft"
							transition={{ duration: 0.5 }}
							className="relative flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:w-1/2"
						>
							<SignupForm setView={handleSetView} />
						</motion.div>
						<motion.div
							key="signup-image"
							className="relative hidden w-1/2 md:block"
							initial={{ x: '100%' }}
							animate={{ x: '0%' }}
							exit={{ x: '100%' }}
							transition={{ duration: 0.5 }}
						>
							<div className="absolute inset-0 bg-[#3B82F6] opacity-100 dark:bg-[#60A5FA]" />
							<div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#F97316]" />
						</motion.div>
					</>
				) : (
					<>
						<motion.div
							key="login-image"
							className="relative hidden w-1/2 md:block"
							initial={{ x: '-100%' }}
							animate={{ x: '0%' }}
							exit={{ x: '-100%' }}
							transition={{ duration: 0.5 }}
						>
							<div className="absolute inset-0 bg-[#3B82F6] opacity-100 dark:bg-[#60A5FA]" />
							<div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#F97316]" />
						</motion.div>
						<motion.div
							key="login-form"
							variants={slideVariants}
							initial="enterRight"
							animate="center"
							exit="exitRight"
							transition={{ duration: 0.5 }}
							className="relative flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:w-1/2"
						>
							{view === 'login' && <LoginForm setView={handleSetView} />}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

const LoginForm = ({ setView }: FormProps) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Log In
		</h2>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
		>
			<FaGoogle className="mr-2" /> Continue with Google
		</Button>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
		>
			<FaGithub className="mr-2" /> Continue with GitHub
		</Button>
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t border-[#4B5563] dark:border-[#E5E7EB]" />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="bg-[#F0F4F8] px-2 text-[#4B5563] dark:bg-[#1E3A8A] dark:text-[#E5E7EB]">
					Or continue with
				</span>
			</div>
		</div>
		<form onSubmit={event_ => event_.preventDefault()}>
			<Input
				type="email"
				name="email"
				placeholder="Email"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Input
				type="password"
				name="password"
				placeholder="Password"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Button
				type="submit"
				className="w-full bg-[#3B82F6] text-white hover:bg-[#60A5FA]"
			>
				Log In
			</Button>
		</form>
		<div className="text-center">
			<button
				onClick={() => setView('forgot')}
				className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
			>
				Forgot password?
			</button>
		</div>
		<div className="text-center">
			<span className="text-sm">Don&#39;t have an account? </span>
			<button
				onClick={() => setView('signup')}
				className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
			>
				Sign up
			</button>
		</div>
	</div>
);

const SignupForm = ({ setView }: FormProps) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Sign Up
		</h2>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
		>
			<FaGoogle className="mr-2" /> Continue with Google
		</Button>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
		>
			<FaGithub className="mr-2" /> Continue with GitHub
		</Button>
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t border-[#4B5563] dark:border-[#E5E7EB]" />
			</div>
			<div className="relative flex justify-center text-xs uppercase">
				<span className="bg-[#F0F4F8] px-2 text-[#4B5563] dark:bg-[#1E3A8A] dark:text-[#E5E7EB]">
					Or continue with
				</span>
			</div>
		</div>
		<form onSubmit={event_ => event_.preventDefault()}>
			<Input
				type="text"
				name="name"
				placeholder="Full Name"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Input
				type="email"
				name="email"
				placeholder="Email"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Input
				type="password"
				name="password"
				placeholder="Password"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Button
				type="submit"
				className="w-full bg-[#3B82F6] text-white hover:bg-[#60A5FA]"
			>
				Sign Up
			</Button>
		</form>
		<div className="text-center">
			<span className="text-sm">Already have an account? </span>
			<button
				onClick={() => setView('login')}
				className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
			>
				Log in
			</button>
		</div>
	</div>
);

export default SubAuthPage;
