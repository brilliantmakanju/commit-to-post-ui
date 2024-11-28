'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useUser } from '@auth0/nextjs-auth0/client'

type ViewType = 'login' | 'signup' | 'forgot';

interface FormProps {
	setView: (view: ViewType) => void;
}

const AuthPage = () => {
	const [view, setView] = useState<ViewType>('login');
	const searchParams = useSearchParams();
	const router = useRouter();
	// const { user, error, isLoading } = useUser()

	// useEffect(() => {
	//     if (user) {
	//         router.push('/dashboard')
	//     }
	// }, [user, router])

	useEffect(() => {
		const viewParameter = searchParams.get('view') as ViewType;
		if (
			viewParameter &&
			['login', 'signup', 'forgot'].includes(viewParameter)
		) {
			setView(viewParameter);
		}
	}, [searchParams]);

	const handleSetView = (newView: ViewType) => {
		setView(newView);
		globalThis.globalThis.window.history.pushState(
			undefined,
			'',
			`/auth?view=${newView}`,
		);
	};

	// if (isLoading) return <div>Loading...</div>
	// if (error) return <div>{error.message}</div>

	const slideVariants = {
		enterLeft: { x: '-100%', opacity: 0 },
		enterRight: { x: '100%', opacity: 0 },
		center: { x: '0%', opacity: 1 },
		exitLeft: { x: '-100%', opacity: 0 },
		exitRight: { x: '100%', opacity: 0 },
	};

	return (
		<Suspense fallback={<div>Loading</div>}>
			<div className="flex h-screen flex-col overflow-hidden bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB] md:flex-row">
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
								className="absolute bottom-0 left-0 top-0 z-10 flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:relative md:w-1/2"
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
								<Image
									src={'/Anime-Girl1.png'}
									alt={'signup-image'}
									fill
									className={'object-cover'}
								/>
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
								className="absolute bottom-0 right-0 top-0 z-10 flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:relative md:w-1/2"
							>
								{view === 'login' && <LoginForm setView={handleSetView} />}
								{view === 'forgot' && (
									<ForgotPasswordForm setView={handleSetView} />
								)}
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* Mobile background image */}
				<div className="fixed inset-0 z-0 md:hidden">
					<div className="absolute inset-0 bg-[#3B82F6] opacity-70 dark:bg-[#60A5FA]" />
				</div>
			</div>
		</Suspense>
	);
};

const LoginForm: React.FC<FormProps> = ({ setView }) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Log In
		</h2>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
			onClick={() =>
				(globalThis.window.location.href =
					'/api/auth/login?connection=google-oauth2')
			}
		>
			<FaGoogle className="mr-2" /> Continue with Google
		</Button>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
			onClick={() =>
				(globalThis.window.location.href = '/api/auth/login?connection=github')
			}
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
		<form action="/api/auth/login" method="POST">
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

const SignupForm: React.FC<FormProps> = ({ setView }) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Sign Up
		</h2>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
			onClick={() =>
				(globalThis.window.location.href =
					'/api/auth/login?connection=google-oauth2')
			}
		>
			<FaGoogle className="mr-2" /> Continue with Google
		</Button>
		<Button
			className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
			variant="outline"
			onClick={() =>
				(globalThis.window.location.href = '/api/auth/login?connection=github')
			}
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
		<form action="/api/auth/signup" method="POST">
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

const ForgotPasswordForm: React.FC<FormProps> = ({ setView }) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Forgot Password
		</h2>
		<p className="text-center text-sm text-[#4B5563] dark:text-[#E5E7EB]">
			Enter your email address and we&#39;ll send you a link to reset your
			password.
		</p>
		<form action="/api/auth/forgot-password" method="POST">
			<Input
				type="email"
				name="email"
				placeholder="Email"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Button
				type="submit"
				className="w-full bg-[#3B82F6] text-white hover:bg-[#60A5FA]"
			>
				Send Reset Link
			</Button>
		</form>
		<div className="text-center">
			<button
				onClick={() => setView('login')}
				className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
			>
				Back to Log In
			</button>
		</div>
	</div>
);

export default AuthPage;
