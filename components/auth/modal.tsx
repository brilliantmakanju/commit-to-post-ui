'use client';
import React from 'react';

import SubAuthPage from '@/components/auth/sub-modal';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { AuthModalProps } from '@/types';

const AuthModal = ({ trigger }: AuthModalProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="h-[470px] overflow-hidden p-0 sm:max-w-[800px] md:h-auto">
				<DialogHeader>
					<SubAuthPage />
				</DialogHeader>
			</DialogContent>
			<DialogTitle className={'dialog-title'}>Authentication Modal</DialogTitle>
		</Dialog>
	);
};

export default AuthModal;
