import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Organization {
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
	updateOrganizations: (orgs: Organization[]) => void; // New method for updating organizations list
	removeOrganization: (orgId: string) => Organization | undefined; // New method for removing an organization
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

			// New method: Update organizations list and handle current organization switching
			updateOrganizations: orgs => {
				const state = get();
				set({ organizations: orgs });

				// If current organization is not in the new list, switch to the first available one
				const currentOrgStillExists = orgs.some(
					org => org.id === state.currentOrganization?.id,
				);

				if (!currentOrgStillExists && orgs.length > 0) {
					// Current org was removed, switch to first available
					const newCurrentOrg = orgs[0];
					set({
						currentOrganization: newCurrentOrg,
						organization: newCurrentOrg,
					});
				} else if (!currentOrgStillExists && orgs.length === 0) {
					// No organizations left, clear everything
					set({
						currentOrganization: undefined,
						organization: {
							id: "",
							name: "",
							domains: "",
							description: "",
							is_owner: false,
							github_installation_status: "unknown",
							github_installation_id: undefined,
						},
						favoriteOrganizationId: undefined,
					});
				}
			},

			// New method: Remove a specific organization and return the next available one
			removeOrganization: orgId => {
				const state = get();
				const updatedOrganizations = state.organizations.filter(
					org => org.id !== orgId,
				);

				// Update the organizations list
				set({ organizations: updatedOrganizations });

				// If we removed the current organization, switch to another one
				if (state.currentOrganization?.id === orgId) {
					if (updatedOrganizations.length > 0) {
						const nextOrg = updatedOrganizations[0];
						set({
							currentOrganization: nextOrg,
							organization: nextOrg,
						});
						return nextOrg; // Return the org we switched to
					} else {
						// No organizations left
						set({
							currentOrganization: undefined,
							organization: {
								id: "",
								name: "",
								domains: "",
								description: "",
								is_owner: false,
								github_installation_status: "unknown",
								github_installation_id: undefined,
							},
						});
						return;
					}
				}

				// If we didn't remove the current org, return the current one
				return state.currentOrganization;
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
