import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CTAWaitlistFormProps = {
	onSubmit: (email: string) => void;
};

const CTAWaitlistForm = ({ onSubmit }: CTAWaitlistFormProps) => {
	const handleSubmit = (event_: React.FormEvent<HTMLFormElement>) => {
		event_.preventDefault();
		const email = (
			event_.currentTarget.elements.namedItem('email') as HTMLInputElement
		)?.value;
		if (email) {
			onSubmit(email);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-2">
			<Input
				name="email"
				type="email"
				placeholder="Enter your email"
				className="flex-1 border-[#D35400] bg-white focus:ring-2 focus:ring-[#D35400]"
			/>
			<Button
				type="submit"
				className="bg-[#8B4513] text-white shadow-lg transition-shadow hover:bg-[#6B3E0F] hover:shadow-xl"
			>
				Join Waitlist
			</Button>
		</form>
	);
};

export default CTAWaitlistForm;
