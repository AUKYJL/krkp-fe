import { AlertCircle, Building2, Phone, UserRound } from "lucide-react";
import { useState } from "react";

import { formatDateDots } from "@/shared/lib/format-date";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/utils";

import { PageHeader } from "@/features/page-header/page-header";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";

import {
  type DriverTaxiParkMembership,
  type DriverTaxiParkStatusTone,
  useDriverTaxiParkPageData,
} from "../model/driver-taxipark";

const formatDisplayDate = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatDateDots(date);
};

const DriverTaxiParkStatusBadge = ({
  label,
  tone,
}: {
  label: string;
  tone: DriverTaxiParkStatusTone;
}) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold",
        tone === "default" && "bg-accent-primary-soft text-text-primary",
        tone === "accent" && "bg-dark-primary-soft text-text-primary",
        tone === "muted" &&
          "border border-border-default bg-background-page text-text-secondary",
      )}
    >
      {label}
    </span>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => {
  if (value == null || value === "") {
    return null;
  }

  return (
    <div className="bg-background-page flex items-center justify-between gap-4 rounded-[12px] px-4 py-3">
      <AppText className="text-text-secondary text-sm font-medium">
        {label}
      </AppText>
      <AppText className="text-text-primary text-right text-sm font-semibold">
        {value}
      </AppText>
    </div>
  );
};

const MembershipCard = ({ membership }: { membership: DriverTaxiParkMembership }) => {
  return (
    <CardSurface className="gap-5 rounded-[24px] p-6 md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="bg-accent-primary-soft text-accent-primary flex size-14 shrink-0 items-center justify-center rounded-[18px]">
            <Building2 className="size-7" />
          </div>

          <div className="min-w-0">
            <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
              Мой таксопарк
            </AppText>
            <AppText
              tag={TAG.h2}
              size={TEXT_SIZES_VARIABLES.medium}
              className="text-text-primary mt-2 font-bold"
            >
              {membership.name}
            </AppText>
            {membership.directorName ? (
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                Директор: {membership.directorName}
              </AppText>
            ) : null}
          </div>
        </div>

        <DriverTaxiParkStatusBadge
          label={membership.statusLabel}
          tone={membership.statusTone}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoRow label="Название" value={membership.name} />
        <InfoRow label="Статус" value={membership.statusLabel} />
        <InfoRow label="Директор" value={membership.directorName} />
        <InfoRow
          label="Дата вступления"
          value={formatDisplayDate(membership.joinedAt)}
        />
        <InfoRow label="Контакт директора" value={membership.directorContact} />
        <InfoRow label="Город" value={membership.city} />
        <InfoRow
          label="Дата создания"
          value={formatDisplayDate(membership.createdAt)}
        />
        <InfoRow label="Автомобилей в таксопарке" value={membership.carsCount} />
      </div>
    </CardSurface>
  );
};

const InvitationCard = ({
  invitation,
  isAcceptPending,
  isRejectPending,
  onAccept,
  onReject,
}: {
  invitation: NonNullable<ReturnType<typeof useDriverTaxiParkPageData>["invitation"]>;
  isAcceptPending: boolean;
  isRejectPending: boolean;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) => {
  const isPending = isAcceptPending || isRejectPending;

  return (
    <CardSurface className="gap-5 rounded-[24px] p-6 md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="bg-dark-primary-soft text-text-primary flex size-14 shrink-0 items-center justify-center rounded-[18px]">
            <Building2 className="size-7" />
          </div>

          <div className="min-w-0">
            <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
              Приглашение
            </AppText>
            <AppText
              tag={TAG.h2}
              size={TEXT_SIZES_VARIABLES.medium}
              className="text-text-primary mt-2 font-bold"
            >
              Вас пригласили в таксопарк “{invitation.parkName}”
            </AppText>
            <AppText className="text-text-secondary mt-1 text-sm font-medium">
              Примите приглашение, чтобы связать аккаунт водителя с текущим таксопарком.
            </AppText>
          </div>
        </div>

        {invitation.statusLabel ? (
          <DriverTaxiParkStatusBadge label={invitation.statusLabel} tone="accent" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoRow label="Таксопарк" value={invitation.parkName} />
        <InfoRow label="Директор" value={invitation.directorName} />
        <InfoRow
          label="Дата приглашения"
          value={formatDisplayDate(invitation.invitedAt)}
        />
        <InfoRow label="Статус приглашения" value={invitation.statusLabel} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="sm:min-w-[168px]"
          disabled={isPending}
          onClick={() => {
            void onAccept();
          }}
        >
          {isAcceptPending ? <Spinner className="size-4 min-h-0" /> : null}
          Принять
        </Button>
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          className="sm:min-w-[168px]"
          disabled={isPending}
          onClick={() => {
            void onReject();
          }}
        >
          {isRejectPending ? <Spinner className="size-4 min-h-0" /> : null}
          Отклонить
        </Button>
      </div>
    </CardSurface>
  );
};

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) => {
  return (
    <CardSurface className="items-center gap-4 rounded-[24px] px-6 py-12 text-center">
      <div className="bg-dark-primary-soft text-text-primary flex size-14 items-center justify-center rounded-full">
        <AlertCircle className="size-7" />
      </div>
      <div className="flex max-w-[480px] flex-col gap-2">
        <AppText
          tag={TAG.h2}
          size={TEXT_SIZES_VARIABLES.medium}
          className="text-text-primary font-semibold"
        >
          Не удалось загрузить данные
        </AppText>
        <AppText className="text-text-secondary text-sm font-medium">
          {message}
        </AppText>
      </div>
      <Button
        type="button"
        variant={BUTTON_VARIANTS_VARIABLES.secondary}
        onClick={() => {
          void onRetry();
        }}
      >
        Повторить
      </Button>
    </CardSurface>
  );
};

const EmptyState = () => {
  return (
    <CardSurface className="items-center gap-4 rounded-[24px] px-6 py-12 text-center">
      <div className="bg-background-page text-text-secondary flex size-14 items-center justify-center rounded-full">
        <UserRound className="size-7" />
      </div>
      <div className="flex max-w-[480px] flex-col gap-2">
        <AppText
          tag={TAG.h2}
          size={TEXT_SIZES_VARIABLES.medium}
          className="text-text-primary font-semibold"
        >
          Вы пока не состоите в таксопарке
        </AppText>
        <AppText className="text-text-secondary text-sm font-medium">
          Когда директор отправит вам приглашение, оно появится на этой странице.
        </AppText>
      </div>
    </CardSurface>
  );
};

export const DriverTaxiparkPage = () => {
  const {
    membership,
    invitation,
    isLoading,
    error,
    errorMessage,
    isAcceptPending,
    isRejectPending,
    acceptInvitation,
    rejectInvitation,
    refetch,
  } = useDriverTaxiParkPageData();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async () => {
    setActionError(null);

    try {
      await acceptInvitation(invitation?.id ?? "");
    } catch {
      setActionError("Не удалось принять приглашение. Попробуйте еще раз.");
    }
  };

  const handleReject = async () => {
    setActionError(null);

    try {
      await rejectInvitation(invitation?.id ?? "");
    } catch {
      setActionError("Не удалось отклонить приглашение. Попробуйте еще раз.");
    }
  };

  if (isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Таксопарк"
        description="Информация о вашем таксопарке и приглашениях"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label },
        ]}
      />

      {error && !invitation && !membership ? (
        <ErrorState message={errorMessage} onRetry={refetch} />
      ) : null}

      {actionError ? (
        <CardSurface className="gap-3 rounded-[20px] border border-status-error/20 bg-status-error/5 p-4">
          <div className="flex items-start gap-3">
            <div className="text-status-error flex size-9 shrink-0 items-center justify-center rounded-full bg-status-error/10">
              <AlertCircle className="size-5" />
            </div>
            <div className="min-w-0">
              <AppText className="text-text-primary text-sm font-semibold">
                Действие не выполнено
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {actionError}
              </AppText>
            </div>
          </div>
        </CardSurface>
      ) : null}

      {invitation ? (
        <InvitationCard
          invitation={invitation}
          isAcceptPending={isAcceptPending}
          isRejectPending={isRejectPending}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ) : null}

      {membership ? <MembershipCard membership={membership} /> : null}

      {!invitation && !membership && !error ? <EmptyState /> : null}

      {error && (invitation || membership) ? (
        <CardSurface className="gap-3 rounded-[20px] border border-border-default bg-background-card p-4">
          <div className="flex items-start gap-3">
            <div className="bg-background-page text-text-secondary flex size-9 shrink-0 items-center justify-center rounded-full">
              <Phone className="size-5" />
            </div>
            <div className="min-w-0">
              <AppText className="text-text-primary text-sm font-semibold">
                Часть данных может быть неактуальной
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {errorMessage}
              </AppText>
            </div>
          </div>
        </CardSurface>
      ) : null}
    </main>
  );
};
