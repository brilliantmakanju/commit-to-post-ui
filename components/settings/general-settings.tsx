// Minimalist General Settings Layout
import { AlertTriangle } from "lucide-react";

import { DeleteOrganization } from "@/components/settings/general-settings/delete-organization";

import { GeneralSettingsForm } from "./general-settings/general-settings-form";
import { SocialConnectionSettings } from "./general-settings/social-connection";

export default function GeneralSettings() {
	return (
		<div className="space-y-8">
			<GeneralSettingsForm isFetching={false} />
			<SocialConnectionSettings />

			{/* Danger Zone */}
			<div className="group relative overflow-hidden rounded-2xl border border-red-900/30 bg-red-950/20 backdrop-blur-xl transition-all duration-300 hover:border-red-800/40 hover:bg-red-950/30">
				<div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-950/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				<div className="relative p-8">
					<div className="mb-6 flex items-center gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-400" />
						<div>
							<h3 className="text-lg font-medium text-zinc-100">Danger Zone</h3>
							<p className="text-sm text-zinc-400">Irreversible actions</p>
						</div>
					</div>
					<DeleteOrganization />
				</div>
			</div>
		</div>
	);
}
