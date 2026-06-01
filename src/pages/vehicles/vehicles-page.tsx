import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledSectionPage } from "@/features/titled-section-page";

export const VehiclesPage = () => {
  return <TitledSectionPage title={TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label} />;
};
