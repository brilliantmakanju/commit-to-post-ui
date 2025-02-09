import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
	id: string;
	name: string;
	domains: string;
	description?: string;
	is_owner?: boolean;
}

interface OrganizationState {
	organization: Organization;
}

interface OrganizationActions {
	clearOrganization: () => void;
	setOrganization: (organization: Organization) => void;
}

const useOrganizationStore = create<OrganizationState & OrganizationActions>()(
	persist(
		set => ({
			organization: {
				id: "",
				name: "",
				domains: "",
				description: "",
				is_owner: false,
			},
			clearOrganization: () =>
				set({
					organization: {
						id: "",
						name: "",
						domains: "",
						description: "",
						is_owner: false,
					},
				}),
			setOrganization: organization =>
				set({
					organization,
				}),
		}),
		{
			name: "organization-storage",
		},
	),
);

export default useOrganizationStore;
