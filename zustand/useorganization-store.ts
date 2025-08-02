import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
	id: string;
	name: string;
	domains: string;
	is_owner?: boolean;
	description?: string;
	github_installation_id?: string;
	github_installation_status?: string;
}

interface OrganizationState {
	organization: Organization; // for backward compatibility
	organizations: Organization[];
	currentOrganization: Organization | undefined;
	favoriteOrganizationId: string | undefined;
}

interface OrganizationActions {
	clearOrganization: () => void;
	setOrganization: (organization: Organization) => void; // legacy setter

	reset: () => void;
	setOrganizations: (orgs: Organization[]) => void;
	setFavoriteOrganization: (orgId: string) => void;
	setCurrentOrganization: (org: Organization) => void;

	updateInstallationStatus: (
		orgId: string,
		status: string,
		installation_id: string,
	) => void;
}

const useOrganizationStore = create<OrganizationState & OrganizationActions>()(
	persist(
		(set, get) => ({
			organization: {
				id: "",
				name: "",
				domains: "",
				description: "",
				is_owner: false,
				github_installation_status: "unknown",
				github_installation_id: undefined,
			},
			organizations: [],
			currentOrganization: undefined,
			favoriteOrganizationId: undefined,

			setOrganization: organization => {
				set({ organization, currentOrganization: organization });
			},

			clearOrganization: () =>
				set({
					organization: {
						id: "",
						name: "",
						domains: "",
						description: "",
						is_owner: false,
						github_installation_status: "unknown",
						github_installation_id: undefined,
					},
					currentOrganization: undefined,
					favoriteOrganizationId: undefined,
					organizations: [],
				}),

			setOrganizations: orgs => {
				set({ organizations: orgs });

				// Set as current if not already set
				if (!get().currentOrganization && orgs.length > 0) {
					set({ currentOrganization: orgs[0], organization: orgs[0] });
				}
			},

			setCurrentOrganization: org => {
				set({ currentOrganization: org, organization: org });
			},

			setFavoriteOrganization: orgId => {
				const found = get().organizations.find(org => org.id === orgId);
				if (found) {
					set({ favoriteOrganizationId: orgId });
				}
			},

			reset: () => {
				set({
					organization: {
						id: "",
						name: "",
						domains: "",
						description: "",
						is_owner: false,
						github_installation_status: "unknown",
						github_installation_id: undefined,
					},
					currentOrganization: undefined,
					favoriteOrganizationId: undefined,
					organizations: [],
				});
			},

			updateInstallationStatus: (orgId, status, installation_id) => {
				const state = get();

				const updateOrg = (org: Organization) =>
					org.id === orgId
						? {
								...org,
								github_installation_id: installation_id,
								github_installation_status: status,
							}
						: org;

				set({
					organization:
						state.organization?.id === orgId
							? updateOrg(state.organization)
							: state.organization,

					currentOrganization:
						state.currentOrganization?.id === orgId
							? updateOrg(state.currentOrganization)
							: state.currentOrganization,

					organizations: state.organizations.map(updateOrg),
				});
			},
		}),
		{
			name: "organization-storage",
		},
	),
);

export default useOrganizationStore;
