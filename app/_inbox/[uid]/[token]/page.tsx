// eslint-disable-next-line import/no-unresolved
import VerifyEmailPageComponent from "@/components/auth/inbox";

interface PageProps {
	uid: string;
	token: string;
}

export default async function VerifyEmailPage({
	params,
}: {
	params: Promise<PageProps>;
}) {
	const { uid, token } = await params;

	return <VerifyEmailPageComponent uid={uid} token={token} />;
}
