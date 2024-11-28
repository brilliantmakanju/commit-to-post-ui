'use client';

import AuthModal from '@/components/auth/modal';
import { Button } from '@/components/ui/button';

const AuthButtons = () => {
	return (
		<div className="flex space-x-4">
			<AuthModal trigger={<Button variant="secondary">Sign In</Button>} />
		</div>
	);
};

export default AuthButtons;
