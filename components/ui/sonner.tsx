"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			position="top-right"
			expand={false}
			visibleToasts={5}
			closeButton={true}
			richColors={false}
			toastOptions={{
				duration: 4000,
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-100 group-[.toaster]:border group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-h-[60px] group-[.toaster]:max-w-[400px]",

					description:
						"group-[.toast]:text-zinc-400 group-[.toast]:text-sm group-[.toast]:leading-relaxed group-[.toast]:mt-1",

					title:
						"group-[.toast]:text-zinc-100 group-[.toast]:font-medium group-[.toast]:text-sm group-[.toast]:leading-tight",

					actionButton:
						"group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:hover:bg-zinc-200 group-[.toast]:border-0 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:ml-auto",

					cancelButton:
						"group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 group-[.toast]:hover:bg-zinc-700 group-[.toast]:hover:text-zinc-200 group-[.toast]:border-0 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors",

					closeButton:
						"group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 group-[.toast]:hover:bg-zinc-700 group-[.toast]:hover:text-zinc-200 group-[.toast]:border-0 group-[.toast]:rounded-md group-[.toast]:w-6 group-[.toast]:h-6 group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center group-[.toast]:absolute group-[.toast]:top-2 group-[.toast]:right-2 group-[.toast]:transition-colors",

					success:
						"group-[.toast]:bg-zinc-900 group-[.toast]:border-zinc-700 group-[.toast]:text-zinc-100",

					error:
						"group-[.toast]:bg-zinc-900 group-[.toast]:border-red-900/50 group-[.toast]:text-zinc-100",

					warning:
						"group-[.toast]:bg-zinc-900 group-[.toast]:border-zinc-700 group-[.toast]:text-zinc-100",

					info: "group-[.toast]:bg-zinc-900 group-[.toast]:border-zinc-700 group-[.toast]:text-zinc-100",

					loading:
						"group-[.toast]:bg-zinc-900 group-[.toast]:border-zinc-700 group-[.toast]:text-zinc-100",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
