"use client";

import { AlertTriangle, Building2, Link } from "lucide-react";

import { DeleteOrganization } from "@/components/settings/general-settings/delete-organization";
import { WebHookSettings } from "@/components/settings/general-settings/web-hooks";
import { Separator } from "@/components/ui/separator";

import { GeneralSettingsForm } from "./general-settings/general-settings-form";
import { SocialConnectionSettings } from "./general-settings/social-connection";

export default function GeneralSettings() {
	return (
		<div className="flex w-full flex-grow flex-col gap-8 py-6">
			<div className="w-full space-y-6">
				<div className="mb-6 flex flex-wrap items-center gap-2">
					<Building2 className="h-5 w-5 text-[#4F46E5]" />
					<h2 className="text-xl font-semibold text-white">
						Organization Details
					</h2>
				</div>

				<GeneralSettingsForm isFetching={false} />
			</div>

			<Separator className="bg-[#232323]" />

			<div className="mb-2 flex items-center gap-2">
				<Link className="h-5 w-5 text-[#4F46E5]" />
				<h2 className="text-xl font-semibold text-white">Connected Accounts</h2>
			</div>
			<SocialConnectionSettings />

			<Separator className="bg-[#232323]" />

			<WebHookSettings />

			{/* <Separator className="bg-[#232323]" />

			<div className="mb-2 flex items-center gap-2">
				<AlertTriangle className="h-5 w-5 text-amber-500" />
				<h2 className="text-xl font-semibold text-white">Danger Zone</h2>
			</div>
			<DeleteOrganization /> */}
		</div>
	);
}
