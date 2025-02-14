"use client";

import { DeleteOrganization } from "@/components/settings/general-settings/delete-organization";
import { WebHookSettings } from "@/components/settings/general-settings/web-hooks";
import { Separator } from "@/components/ui/separator";

import { GeneralSettingsForm } from "./general-settings/general-settings-form";
import { SocialConnectionSettings } from "./general-settings/social-connection";

export default function GeneralSettings() {
	return (
		<div className="flex w-full flex-grow flex-col gap-8 pb-8">
			<div className="w-full space-y-6">
				<div className="mb-6 mt-5 flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-xl font-semibold">Organization Settings</h2>
				</div>

				<GeneralSettingsForm isFetching={false} />
			</div>

			<Separator />
			<SocialConnectionSettings />
			<Separator />

			<WebHookSettings />

			<Separator />
			<DeleteOrganization />
		</div>
	);
}
