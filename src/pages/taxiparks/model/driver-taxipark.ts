import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys, getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";

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

export type DriverTaxiParkInvitation = {
  id: string;
  parkName: string;
  directorName?: string;
  invitedAt?: string;
  statusLabel?: string;
};

type DriverTaxiParkPageData = {
  membership: DriverTaxiParkMembership | null;
  invitation: DriverTaxiParkInvitation | null;
};

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

const pickFirst = <T>(
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

const normalizeStatus = (
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

const normalizeInvitationStatus = (value: string | undefined) => {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized &&
    ["pending", "new", "sent", "invited", "ожидает", "ожидает ответа"].includes(
      normalized,
    )
  ) {
    return "Ожидает ответа";
  }

  return value?.trim();
};

const isInvitationActive = (value: unknown) => {
  const status = pickString(value, [
    "status",
    "invitationStatus",
    "state",
    "meta.status",
  ]);

  if (!status) {
    return true;
  }

  const normalized = status.trim().toLowerCase();

  return !["accepted", "rejected", "declined", "cancelled", "canceled"].includes(
    normalized,
  );
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
    ]) ?? null;

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

  const { statusLabel, statusTone } = normalizeStatus(rawStatus);

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

const normalizeInvitation = (invitations: unknown): DriverTaxiParkInvitation | null => {
  const invitationItems = Array.isArray(invitations)
    ? invitations
    : pickArray(invitations, ["items", "data", "results", "invitations"]);

  const invitationSource = invitationItems?.find(isInvitationActive);

  if (!isRecord(invitationSource)) {
    return null;
  }

  const parkSource =
    pickRecord(invitationSource, ["taxiPark", "park", "fleet"]) ??
    invitationSource;

  const parkName =
    pickString(parkSource, ["name", "title"]) ??
    pickString(invitationSource, ["taxiParkName", "parkName"]);
  const invitationId = pickString(invitationSource, ["id"]);

  if (!parkName || !invitationId) {
    return null;
  }

  return {
    id: invitationId,
    parkName,
    directorName:
      pickString(parkSource, [
        "director.fullName",
        "director.name",
        "directorName",
        "owner.fullName",
        "owner.name",
        "manager.fullName",
        "manager.name",
      ]) ?? pickString(invitationSource, ["directorName"]),
    invitedAt: pickString(invitationSource, [
      "createdAt",
      "invitedAt",
      "sentAt",
      "updatedAt",
    ]),
    statusLabel: normalizeInvitationStatus(
      pickString(invitationSource, ["status", "state", "invitationStatus"]),
    ),
  };
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
  return getResponseData(fetchClient.GET("/api/invitations/my"));
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
  });

  const currentTaxiParkQuery = useQuery({
    queryKey: driverTaxiParkQueryKeys.currentTaxiPark,
    queryFn: getCurrentTaxiPark,
  });

  const invitationsQuery = useQuery({
    queryKey: driverTaxiParkQueryKeys.invitations,
    queryFn: getMyInvitations,
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
      driverProfileQuery.data,
      currentTaxiParkQuery.data,
    ),
    invitation: normalizeInvitation(invitationsQuery.data),
  };

  const pageError =
    currentTaxiParkQuery.error ??
    invitationsQuery.error ??
    acceptMutation.error ??
    rejectMutation.error;

  return {
    ...pageData,
    isLoading: currentTaxiParkQuery.isLoading || invitationsQuery.isLoading,
    error: pageError,
    errorMessage: getApiErrorMessage(pageError),
    isAcceptPending: acceptMutation.isPending,
    isRejectPending: rejectMutation.isPending,
    acceptInvitation: acceptMutation.mutateAsync,
    rejectInvitation: rejectMutation.mutateAsync,
    refetch: async () => {
      await Promise.all([
        driverProfileQuery.refetch(),
        currentTaxiParkQuery.refetch(),
        invitationsQuery.refetch(),
      ]);
    },
  };
};
