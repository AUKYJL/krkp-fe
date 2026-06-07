import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys, getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";

export type DriverTaxiParkStatusTone = "default" | "accent" | "muted";

export type DriverTaxiParkMembership = {
  id?: string;
  name: string;
  directorName?: string;
  directorContact?: string;
  city?: string;
  statusLabel: string;
  statusTone: DriverTaxiParkStatusTone;
  joinedAt?: string;
  createdAt?: string;
  carsCount?: number;
};

export type DriverInvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type DriverTaxiParkInvitation = {
  id: string;
  parkName: string;
  address?: string;
  createdAt?: string;
  status: DriverInvitationStatus;
  statusLabel: string;
  statusTone: DriverTaxiParkStatusTone;
  isPending: boolean;
};

type DriverTaxiParkPageData = {
  membership: DriverTaxiParkMembership | null;
  invitations: DriverTaxiParkInvitation[];
  activeInvitations: DriverTaxiParkInvitation[];
  activeInvitationsCount: number;
};

type DriverProfileResponse = unknown;
type MyInvitationItem = components["schemas"]["MyInvitationItemDto"];

const driverTaxiParkQueryKeys = {
  driverProfile: ["get", "/api/drivers/me"] as const,
  currentTaxiPark: ["get", "/api/taxi-parks/me"] as const,
  invitations: ["get", "/api/invitations/my"] as const,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getPathValue = (value: unknown, path: string) => {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[segment];
  }, value);
};

const pickFirst = <T,>(
  value: unknown,
  paths: string[],
  matcher: (candidate: unknown) => candidate is T,
) => {
  for (const path of paths) {
    const candidate = getPathValue(value, path);

    if (matcher(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const pickString = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );
};

const pickNumber = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is number =>
      typeof candidate === "number" && Number.isFinite(candidate),
  );
};

const pickRecord = (value: unknown, paths: string[]) => {
  return pickFirst(value, paths, isRecord);
};

const pickArray = (value: unknown, paths: string[]) => {
  return pickFirst(
    value,
    paths,
    (candidate): candidate is unknown[] => Array.isArray(candidate),
  );
};

const isNotFoundError = (error: unknown) => {
  if (!isRecord(error)) {
    return false;
  }

  return error.statusCode === 404;
};

const normalizeMembershipStatus = (
  value: string | undefined,
): Pick<DriverTaxiParkMembership, "statusLabel" | "statusTone"> => {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized &&
    ["active", "активен", "активный", "member"].includes(normalized)
  ) {
    return {
      statusLabel: "Активен",
      statusTone: "default",
    };
  }

  if (
    normalized &&
    [
      "pending",
      "awaiting_confirmation",
      "awaiting-confirmation",
      "waiting",
      "invited",
      "ожидает подтверждения",
      "ожидает",
    ].includes(normalized)
  ) {
    return {
      statusLabel: "Ожидает подтверждения",
      statusTone: "accent",
    };
  }

  if (
    normalized &&
    ["suspended", "paused", "inactive", "приостановлен", "на паузе"].includes(
      normalized,
    )
  ) {
    return {
      statusLabel: "Приостановлен",
      statusTone: "muted",
    };
  }

  return {
    statusLabel: value?.trim() || "Не указан",
    statusTone: "muted",
  };
};

const normalizeInvitationStatus = (
  value: MyInvitationItem["status"] | string | undefined,
): Pick<
  DriverTaxiParkInvitation,
  "status" | "statusLabel" | "statusTone" | "isPending"
> => {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "accepted") {
    return {
      status: "accepted",
      statusLabel: "Принято",
      statusTone: "default",
      isPending: false,
    };
  }

  if (normalized === "rejected" || normalized === "declined") {
    return {
      status: "rejected",
      statusLabel: "Отклонено",
      statusTone: "muted",
      isPending: false,
    };
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return {
      status: "cancelled",
      statusLabel: "Отменено",
      statusTone: "muted",
      isPending: false,
    };
  }

  return {
    status: "pending",
    statusLabel: "Ожидает ответа",
    statusTone: "accent",
    isPending: true,
  };
};

const normalizeMembership = (
  driverProfile: unknown,
  currentTaxiPark: unknown,
): DriverTaxiParkMembership | null => {
  const membershipSource =
    pickRecord(currentTaxiPark, [
      "membership",
      "taxiParkMembership",
      "currentMembership",
      "driverTaxiPark",
      "parkMembership",
    ]) ??
    pickRecord(driverProfile, [
      "taxiParkMembership",
      "membership",
      "currentMembership",
      "driverTaxiPark",
      "parkMembership",
    ]) ??
    null;

  const parkSource =
    pickRecord(membershipSource, ["taxiPark", "park"]) ??
    pickRecord(currentTaxiPark, [
      "taxiPark",
      "park",
      "currentTaxiPark",
      "currentPark",
      "fleet",
    ]) ??
    (isRecord(currentTaxiPark) ? currentTaxiPark : null) ??
    pickRecord(driverProfile, [
      "taxiPark",
      "park",
      "currentTaxiPark",
      "currentPark",
      "fleet",
    ]) ??
    null;

  const parkName =
    pickString(parkSource, ["name", "title"]) ??
    pickString(membershipSource, ["taxiParkName", "parkName"]);

  if (!parkName) {
    return null;
  }

  const rawStatus =
    pickString(membershipSource, ["status", "membershipStatus", "state"]) ??
    pickString(parkSource, ["status", "state"]);

  const directorName =
    pickString(parkSource, [
      "director.fullName",
      "director.name",
      "directorName",
      "owner.fullName",
      "owner.name",
      "manager.fullName",
      "manager.name",
    ]) ?? pickString(membershipSource, ["directorName"]);

  const directorContact =
    pickString(parkSource, [
      "director.phone",
      "director.email",
      "contactPhone",
      "contactEmail",
      "directorContact",
      "phone",
      "email",
    ]) ?? pickString(membershipSource, ["directorContact"]);

  const city =
    pickString(parkSource, ["city", "address.city"]) ??
    pickString(membershipSource, ["city"]);

  const carsCount =
    pickNumber(parkSource, ["carsCount", "carCount", "vehiclesCount"]) ??
    pickArray(parkSource, ["cars", "vehicles"])?.length;

  const { statusLabel, statusTone } = normalizeMembershipStatus(rawStatus);

  return {
    id:
      pickString(parkSource, ["id"]) ?? pickString(membershipSource, ["taxiParkId"]),
    name: parkName,
    directorName,
    directorContact,
    city,
    statusLabel,
    statusTone,
    joinedAt:
      pickString(membershipSource, [
        "joinedAt",
        "createdAt",
        "startDate",
        "acceptedAt",
      ]) ?? pickString(parkSource, ["joinedAt"]),
    createdAt: pickString(parkSource, ["createdAt"]),
    carsCount,
  };
};

const normalizeInvitations = (invitations: unknown): DriverTaxiParkInvitation[] => {
  const invitationItems = Array.isArray(invitations)
    ? invitations
    : pickArray(invitations, ["items", "data", "results", "invitations"]);

  if (!invitationItems) {
    return [];
  }

  return invitationItems.reduce<DriverTaxiParkInvitation[]>((result, item) => {
    if (!isRecord(item)) {
      return result;
    }

    const parkSource = pickRecord(item, ["taxiPark", "park", "fleet"]) ?? item;
    const parkName =
      pickString(parkSource, ["name", "title"]) ??
      pickString(item, ["taxiParkName", "parkName"]);
    const invitationId =
      pickString(item, ["invitationId", "id"]) ??
      pickString(parkSource, ["invitationId"]);

    if (!parkName || !invitationId) {
      return result;
    }

    const status = normalizeInvitationStatus(
      pickString(item, ["status", "state", "invitationStatus"]),
    );

    result.push({
      id: invitationId,
      parkName,
      address:
        pickString(parkSource, ["address", "location"]) ??
        pickString(item, ["taxiParkAddress", "address"]),
      createdAt: pickString(item, [
        "createdAt",
        "invitedAt",
        "sentAt",
        "updatedAt",
      ]),
      ...status,
    });

    return result;
  }, []);
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

const getDriverProfile = async () => {
  return getResponseData(fetchClient.GET("/api/drivers/me"));
};

const getCurrentTaxiPark = async () => {
  const response = (await fetchClient.GET("/api/taxi-parks/me")) as {
    data?: unknown;
    error?: unknown;
  };

  if (response.error) {
    if (isNotFoundError(response.error)) {
      return null;
    }

    throw response.error;
  }

  return response.data ?? null;
};

const getMyInvitations = async () => {
  return (await getResponseData(fetchClient.GET("/api/invitations/my"))) ?? [];
};

const acceptInvitation = async (id: string) => {
  await getResponseData(
    fetchClient.PATCH("/api/invitations/{id}/accept", {
      params: { path: { id } },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const rejectInvitation = async (id: string) => {
  await getResponseData(
    fetchClient.PATCH("/api/invitations/{id}/reject", {
      params: { path: { id } },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

export const useDriverTaxiParkPageData = () => {
  const queryClient = useQueryClient();

  const driverProfileQuery = useQuery({
    queryKey: driverTaxiParkQueryKeys.driverProfile,
    queryFn: getDriverProfile,
    retry: false,
  });

  const currentTaxiParkQuery = useQuery({
    queryKey: driverTaxiParkQueryKeys.currentTaxiPark,
    queryFn: getCurrentTaxiPark,
    retry: false,
  });

  const invitationsQuery = useQuery({
    queryKey: driverTaxiParkQueryKeys.invitations,
    queryFn: getMyInvitations,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.driverProfile,
        }),
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.currentTaxiPark,
        }),
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.invitations,
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser }),
      ]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.driverProfile,
        }),
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.currentTaxiPark,
        }),
        queryClient.invalidateQueries({
          queryKey: driverTaxiParkQueryKeys.invitations,
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser }),
      ]);
    },
  });

  const pageData: DriverTaxiParkPageData = {
    membership: normalizeMembership(
      driverProfileQuery.data as DriverProfileResponse,
      currentTaxiParkQuery.data,
    ),
    invitations: normalizeInvitations(invitationsQuery.data),
    activeInvitations: [],
    activeInvitationsCount: 0,
  };

  pageData.activeInvitations = pageData.invitations.filter(
    (invitation) => invitation.isPending,
  );
  pageData.activeInvitationsCount = pageData.activeInvitations.length;

  const membershipError =
    currentTaxiParkQuery.error ??
    (pageData.membership ? null : driverProfileQuery.error);

  return {
    ...pageData,
    isLoading:
      driverProfileQuery.isLoading ||
      currentTaxiParkQuery.isLoading ||
      invitationsQuery.isLoading,
    membershipError,
    membershipErrorMessage: getApiErrorMessage(membershipError),
    invitationsError: invitationsQuery.error,
    invitationsErrorMessage: getApiErrorMessage(invitationsQuery.error),
    acceptInvitation: acceptMutation.mutateAsync,
    rejectInvitation: rejectMutation.mutateAsync,
    isAcceptPending: acceptMutation.isPending,
    isRejectPending: rejectMutation.isPending,
    acceptingInvitationId: acceptMutation.variables,
    rejectingInvitationId: rejectMutation.variables,
    refetchMembership: async () => {
      await Promise.all([driverProfileQuery.refetch(), currentTaxiParkQuery.refetch()]);
    },
    refetchInvitations: invitationsQuery.refetch,
    refetch: async () => {
      await Promise.all([
        driverProfileQuery.refetch(),
        currentTaxiParkQuery.refetch(),
        invitationsQuery.refetch(),
      ]);
    },
  };
};
