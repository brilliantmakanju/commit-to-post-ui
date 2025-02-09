"use client";

import { useState } from "react";

import MagicLinkForm from "./magic-link-form";
import PasswordLoginForm from "./password-login-form";

interface LoginFormProps {
	setView: (view: "login" | "signup" | "forgot") => void;
}

const LoginForm = ({ setView }: LoginFormProps) => {
	const [isMagicLink, setIsMagicLink] = useState(true);

	const toggleForm = () => {
		setIsMagicLink(!isMagicLink);
	};

	const handleForgotPassword = () => {
		setView("forgot");
	};

	return (
		<div className="w-full max-w-md space-y-4 p-8">
			{isMagicLink ? (
				<MagicLinkForm onToggleForm={toggleForm} />
			) : (
				<PasswordLoginForm
					onToggleForm={toggleForm}
					onForgotPassword={handleForgotPassword}
				/>
			)}
		</div>
	);
};

export default LoginForm;

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { FaGithub, FaGoogle, FaEnvelope, FaLock, FaMagic } from "react-icons/fa";
// import { toast } from "sonner";
// import { z } from "zod";
// import { useState } from "react";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";

// // Define your schemas here
// const loginSchema = z.object({
//   email: z
//     .string({ required_error: "Email is required." })
//     .min(1, "Email is required.")
//     .email("Invalid email format."),
//   password: z
//     .string({ required_error: "Password is required." })
//     .min(8, "Password must be more than 8 characters.")
//     .max(32, "Password must be less than 32 characters."),
// });

// const magicLinkSchema = z.object({
//   email: z
//     .string({ required_error: "Email is required." })
//     .min(1, "Email is required.")
//     .email("Invalid email format."),
// });

// type ViewType = "login" | "signup" | "forgot";

// interface FormProps {
//   setView: (view: ViewType) => void;
// }

// const LoginForm: React.FC<FormProps> = ({ setView }) => {
//   const [isMagicLink, setIsMagicLink] = useState<boolean>(false);
//   const router = useRouter();

//   const emailPasswordForm = useForm<z.infer<typeof loginSchema>>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
//     resolver: zodResolver(magicLinkSchema),
//     defaultValues: {
//       email: "",
//     },
//   });

//   const handleEmailPasswordSubmit = async (values: z.infer<typeof loginSchema>) => {
//     // Implement login with email and password here
//   };

//   const handleMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
//     // Implement magic link login logic here
//     toast.success("Magic link sent to your email!");
//   };

//   return (
//     <div className="w-full max-w-md space-y-4 p-8">

//       <div className="flex justify-center space-x-4">
//         <Button
//           variant={isMagicLink ? "outline" : "default"}
//           onClick={() => setIsMagicLink(false)}
//         >
//           <FaEnvelope className="mr-2" /> Email & Password
//         </Button>
//         <Button
//           variant={isMagicLink ? "default" : "outline"}
//           onClick={() => setIsMagicLink(true)}
//         >
//           <FaMagic className="mr-2" /> Magic Link
//         </Button>
//       </div>

//       {/* Magic Link Form */}
//       {isMagicLink ? (
//         <Form {...magicLinkForm}>
//           <form
//             className="space-y-6"
//             onSubmit={magicLinkForm.handleSubmit(handleMagicLinkSubmit)}
//           >
//             <FormField
//               name="email"
//               control={magicLinkForm.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <Input
//                         type="email"
//                         autoComplete="off"
//                         placeholder="Enter your email"
//                         className="pl-10 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" className="w-full">
//               Send Magic Link
//             </Button>
//           </form>
//         </Form>
//       ) : (
//         // Email & Password Login Form
//         <Form {...emailPasswordForm}>
//           <form
//             className="space-y-6"
//             onSubmit={emailPasswordForm.handleSubmit(handleEmailPasswordSubmit)}
//           >
//             <FormField
//               name="email"
//               control={emailPasswordForm.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <Input
//                         type="email"
//                         autoComplete="off"
//                         placeholder="Enter your email"
//                         className="pl-10 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               name="password"
//               control={emailPasswordForm.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <Input
//                         type="password"
//                         autoComplete="off"
//                         placeholder="Enter your password"
//                         className="pl-10 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" className="w-full">
//               Login
//             </Button>
//           </form>
//         </Form>
//       )}

//       {/* Forgot password link (only shown in Email & Password form) */}
//       {!isMagicLink && (
//         <div className="text-center">
//           <button
//             onClick={() => setView("forgot")}
//             className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
//           >
//             Forgot password?
//           </button>
//         </div>
//       )}

//       {/* Sign up link (only shown in Email & Password form) */}
//       {!isMagicLink && (
//         <div className="text-center">
//           <span className="text-sm">Don't have an account? </span>
//           <button
//             onClick={() => setView("signup")}
//             className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
//           >
//             Sign up
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginForm;
