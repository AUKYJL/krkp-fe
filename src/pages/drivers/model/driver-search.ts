import { useMutation, useQuery } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { formatDate } from "@/shared/lib/format-date";

export type DriverSearchItem = components["schemas"]["DriverSearchItemDto"];
export type DriverInvitationItem =
  components["schemas"]["CreateDriverInvitationDto"];

export type DriverSearchFilter = "all" | "in_park" | "not_in_park";

export type InviteTaxiParkOption = {
  taxiParkId: string;
  name: string;
};

type DirectorAnalyticsResponse =
  components["schemas"]["GetTaxiParksAnalyticsResponseDto"];

const DEFAULT_PERIOD_DAYS = 30;

const driverSearchQueryKeys = {
  drivers: (search: string, filter: DriverSearchFilter) =>
    ["drivers", "search", search, filter] as const,
  inviteTaxiParks: ["drivers", "invite-taxi-parks"] as const,
};

const getResponseData = async <T,>(
  request: Promise<{ data?: T; error?: unknown }>,
) => {
  const response = await request;

  if (response.error) {
    throw response.error;
  }

  return response.data;
};

const getDefaultPeriod = () => {
  const today = new Date();
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() - (DEFAULT_PERIOD_DAYS - 1),
  );

  return {
    from: formatDate(startDate),
    to: formatDate(endDate),
  };
};

const mapMembershipFilterToQuery = (filter: DriverSearchFilter) => {
  if (filter === "in_park") {
    return true;
  }

  if (filter === "not_in_park") {
    return false;
  }

  return undefined;
};

const getDriverSearchResults = async ({
  search,
  filter,
}: {
  search: string;
  filter: DriverSearchFilter;
}) => {
  const fullName = search.trim();

  return (
    (await getResponseData(
      fetchClient.GET("/api/drivers/search", {
        params: {
          query: {
            fullName: fullName.length > 0 ? fullName : undefined,
            inTaxiPark: mapMembershipFilterToQuery(filter),
          },
        },
      }),
    )) ?? []
  );
};

const getInviteTaxiParks = async () => {
  const period = getDefaultPeriod();
  const response = await getResponseData(
    fetchClient.GET("/api/taxi-parks/analytics", {
      params: {
        query: {
          from: period.from,
          to: period.to,
        },
      },
    }),
  );

  const data = response as DirectorAnalyticsResponse;

  return data.taxiParks.map((item) => ({
    taxiParkId: item.taxiParkId,
    name: item.name,
  }));
};

const createDriverInvitation = async ({
  taxiParkId,
  driverId,
}: {
  taxiParkId: string;
  driverId: string;
}) => {
  await getResponseData(
    fetchClient.POST("/api/taxi-parks/{taxiParkId}/invitations", {
      params: {
        path: { taxiParkId },
      },
      body: {
        driverId,
      },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

export const useDriverSearchPageData = ({
  search,
  filter,
}: {
  search: string;
  filter: DriverSearchFilter;
}) => {
  const driversQuery = useQuery({
    queryKey: driverSearchQueryKeys.drivers(search.trim(), filter),
    queryFn: () => getDriverSearchResults({ search, filter }),
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  const taxiParksQuery = useQuery({
    queryKey: driverSearchQueryKeys.inviteTaxiParks,
    queryFn: getInviteTaxiParks,
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: createDriverInvitation,
  });

  return {
    drivers: driversQuery.data ?? [],
    driversError: driversQuery.error,
    driversErrorMessage: getApiErrorMessage(driversQuery.error),
    isDriversLoading: driversQuery.isLoading,
    isDriversFetching: driversQuery.isFetching,
    refetchDrivers: driversQuery.refetch,
    taxiParks: taxiParksQuery.data ?? [],
    taxiParksError: taxiParksQuery.error,
    taxiParksErrorMessage: getApiErrorMessage(taxiParksQuery.error),
    isTaxiParksLoading: taxiParksQuery.isLoading,
    refetchTaxiParks: taxiParksQuery.refetch,
    inviteDriver: inviteMutation.mutateAsync,
    inviteErrorMessage: getApiErrorMessage(inviteMutation.error),
    isInvitePending: inviteMutation.isPending,
    pendingInviteDriverId: inviteMutation.variables?.driverId,
    pendingInviteTaxiParkId: inviteMutation.variables?.taxiParkId,
  };
};
