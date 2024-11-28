import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EmailSignupForm: React.FC = () => {
	return (
		<div className="flex w-full flex-col items-start justify-center md:w-full lg:w-[400px]">
			<form className="flex w-full flex-col gap-2">
				<Input
					type="email"
					name="email"
					placeholder="Enter your email"
					required
					className="w-full border-none bg-white p-4 text-lg text-slate-900 focus:ring-2 focus:ring-white"
				/>
				<Button
					type="submit"
					className="w-full bg-emerald-800 text-white hover:bg-emerald-600 lg:w-[120px]"
				>
					Join Waitlist
				</Button>
			</form>
		</div>
	);
};
