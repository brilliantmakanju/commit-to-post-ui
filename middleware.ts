export { auth as middleware } from "@/auth";

export const config = {
	matcher: [String.raw`/((?!api|_next/static|_next/image|.*\.png$).*)`],
};
