import ResetPasswordPageClient from "@/components/auth/reset/reset-password-page-client";

interface PageProps {
	uid: string;
	token: string;
}

export default async function ResetPasswordPage({
	params,
}: {
	params: Promise<PageProps>;
}) {
	const { uid, token } = await params;
	return <ResetPasswordPageClient uid={uid} token={token} />;
}
