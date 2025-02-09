import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaMagic } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { magicLinkSchema } from "@/resolvers/auth-resolvers";

type MagicLinkFormProps = {
	onSubmit: (values: { email: string }) => void;
};

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onSubmit }) => {
	const form = useForm({
		resolver: zodResolver(magicLinkSchema),
		defaultValues: {
			email: "",
		},
	});

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type="email"
										placeholder="Enter your email"
										className="bg-neutral-100 pl-10 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
										{...field}
									/>
									<FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500" />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full bg-neutral-700 text-neutral-100 hover:bg-neutral-600 dark:bg-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-400"
				>
					<FaMagic className="mr-2" />
					Send Magic Link
				</Button>
			</form>
		</Form>
	);
};

export default MagicLinkForm;
