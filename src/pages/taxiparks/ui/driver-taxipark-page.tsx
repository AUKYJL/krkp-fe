import { AlertCircle, Building2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/features/page-header/page-header";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { formatDateDots } from "@/shared/lib/format-date";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/utils";

import {
  type DriverTaxiParkInvitation,
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

const SectionErrorState = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => Promise<unknown>;
}) => {
  return (
    <CardSurface className="items-center gap-4 rounded-[24px] px-6 py-10 text-center">
      <div className="bg-dark-primary-soft text-text-primary flex size-14 items-center justify-center rounded-full">
        <AlertCircle className="size-7" />
      </div>
      <div className="flex max-w-[480px] flex-col gap-2">
        <AppText
          tag={TAG.h2}
          size={TEXT_SIZES_VARIABLES.medium}
          className="text-text-primary font-semibold"
        >
          {title}
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
  actionError,
  onAccept,
  onReject,
}: {
  invitation: DriverTaxiParkInvitation;
  isAcceptPending: boolean;
  isRejectPending: boolean;
  actionError?: string;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) => {
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
              {invitation.parkName}
            </AppText>
            <AppText className="text-text-secondary mt-1 text-sm font-medium">
              Ожидает вашего решения. После принятия приглашение исчезнет из этого списка.
            </AppText>
          </div>
        </div>

        <DriverTaxiParkStatusBadge
          label={invitation.statusLabel}
          tone={invitation.statusTone}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoRow label="Таксопарк" value={invitation.parkName} />
        <InfoRow label="Статус приглашения" value={invitation.statusLabel} />
        <InfoRow label="Адрес" value={invitation.address} />
        <InfoRow
          label="Дата приглашения"
          value={formatDisplayDate(invitation.createdAt)}
        />
      </div>

      {invitation.isPending ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="sm:min-w-[168px]"
              disabled={isAcceptPending || isRejectPending}
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
              disabled={isAcceptPending || isRejectPending}
              onClick={() => {
                void onReject();
              }}
            >
              {isRejectPending ? <Spinner className="size-4 min-h-0" /> : null}
              Отклонить
            </Button>
          </div>

          {actionError ? (
            <AppText className="text-status-error text-sm font-medium">
              {actionError}
            </AppText>
          ) : null}
        </div>
      ) : null}
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
          Пока нет активного таксопарка и ожидающих приглашений
        </AppText>
        <AppText className="text-text-secondary text-sm font-medium">
          Когда появится членство или новое приглашение, оно отобразится здесь.
        </AppText>
      </div>
    </CardSurface>
  );
};

export const DriverTaxiparkPage = () => {
  const {
    membership,
    invitations,
    activeInvitations,
    activeInvitationsCount,
    isLoading,
    membershipError,
    membershipErrorMessage,
    invitationsError,
    invitationsErrorMessage,
    isAcceptPending,
    isRejectPending,
    acceptingInvitationId,
    rejectingInvitationId,
    acceptInvitation,
    rejectInvitation,
    refetchMembership,
    refetchInvitations,
  } = useDriverTaxiParkPageData();
  const [isInvitationsDrawerOpen, setIsInvitationsDrawerOpen] = useState(false);
  const [drawerDirection, setDrawerDirection] = useState<"bottom" | "right">(
    "right",
  );
  const [actionErrors, setActionErrors] = useState<Record<string, string | undefined>>(
    {},
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateDirection = () => {
      setDrawerDirection(mediaQuery.matches ? "right" : "bottom");
    };

    updateDirection();
    mediaQuery.addEventListener("change", updateDirection);

    return () => {
      mediaQuery.removeEventListener("change", updateDirection);
    };
  }, []);

  const handleAccept = async (invitationId: string) => {
    setActionErrors((current) => ({ ...current, [invitationId]: undefined }));

    try {
      await acceptInvitation(invitationId);
    } catch {
      setActionErrors((current) => ({
        ...current,
        [invitationId]: "Не удалось принять приглашение. Попробуйте еще раз.",
      }));
    }
  };

  const handleReject = async (invitationId: string) => {
    setActionErrors((current) => ({ ...current, [invitationId]: undefined }));

    try {
      await rejectInvitation(invitationId);
    } catch {
      setActionErrors((current) => ({
        ...current,
        [invitationId]: "Не удалось отклонить приглашение. Попробуйте еще раз.",
      }));
    }
  };

  if (isLoading && !membership && invitations.length === 0) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  const hasContent = Boolean(membership) || activeInvitationsCount > 0;
  const invitationsHasError = Boolean(invitationsError);
  const showCompactInvitationError =
    invitationsHasError && !isInvitationsDrawerOpen && activeInvitationsCount === 0;

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label}
        description="Ваш текущий таксопарк и ожидающие приглашения."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <AppText className="text-text-primary text-lg font-semibold">
            Мой таксопарк
          </AppText>
          <AppText className="text-text-secondary text-sm font-medium">
            Текущая активная связь водителя с таксопарком.
          </AppText>
        </div>

        {membership ? (
          <MembershipCard membership={membership} />
        ) : membershipError ? (
          <SectionErrorState
            title="Не удалось загрузить информацию о таксопарке"
            message={membershipErrorMessage}
            onRetry={refetchMembership}
          />
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <AppText className="text-text-primary text-lg font-semibold">
              Приглашения
            </AppText>
            <AppText className="text-text-secondary text-sm font-medium">
              Ожидающие приглашения не мешают основному содержанию и открываются по запросу.
            </AppText>
          </div>

          <div className="bg-dark-primary-soft text-text-primary flex h-11 min-w-11 items-center justify-center rounded-[14px] px-3 text-sm font-bold">
            {activeInvitationsCount}
          </div>
        </div>

        {showCompactInvitationError ? (
          <SectionErrorState
            title="Не удалось загрузить приглашения"
            message={invitationsErrorMessage}
            onRetry={refetchInvitations}
          />
        ) : (
          <CardSurface className="flex flex-col gap-4 rounded-[24px] p-6 md:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <AppText className="text-text-primary text-base font-semibold">
                  {activeInvitationsCount > 0
                    ? `${activeInvitationsCount} ожидающих приглашений`
                    : "Ожидающих приглашений нет"}
                </AppText>
                <AppText className="text-text-secondary text-sm font-medium">
                  {activeInvitationsCount > 0
                    ? "Откройте список, чтобы принять или отклонить приглашения."
                    : "Новые приглашения появятся здесь, когда директор их отправит."}
                </AppText>
              </div>

              <Button
                type="button"
                variant={BUTTON_VARIANTS_VARIABLES.secondary}
                disabled={activeInvitationsCount === 0 && !invitationsError}
                onClick={() => {
                  setIsInvitationsDrawerOpen(true);
                }}
              >
                {activeInvitationsCount > 0 ? "Открыть список" : "Проверить позже"}
              </Button>
            </div>

            {activeInvitationsCount > 0 ? (
              <div className="text-text-secondary flex items-center gap-2 text-sm font-medium">
                <span className="bg-accent-primary-soft text-text-primary inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                  {activeInvitationsCount}
                </span>
                В списке учитываются только приглашения со статусом ожидания.
              </div>
            ) : null}
          </CardSurface>
        )}
      </section>

      {!hasContent && !membershipError && !invitationsError ? <EmptyState /> : null}

      <Drawer
        open={isInvitationsDrawerOpen}
        direction={drawerDirection}
        onOpenChange={setIsInvitationsDrawerOpen}
      >
        <DrawerContent showCloseButton className="max-h-[calc(100vh-1.5rem)]">
          <DrawerHeader>
            <DrawerTitle>Приглашения</DrawerTitle>
            <DrawerDescription>
              {activeInvitationsCount > 0
                ? "Показаны только ожидающие приглашения."
                : "Сюда попадут только активные приглашения со статусом ожидания."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6 md:px-7 md:pb-7">
            {invitationsError && activeInvitationsCount === 0 ? (
              <SectionErrorState
                title="Не удалось загрузить приглашения"
                message={invitationsErrorMessage}
                onRetry={refetchInvitations}
              />
            ) : activeInvitationsCount > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    actionError={actionErrors[invitation.id]}
                    isAcceptPending={
                      isAcceptPending && acceptingInvitationId === invitation.id
                    }
                    isRejectPending={
                      isRejectPending && rejectingInvitationId === invitation.id
                    }
                    onAccept={() => handleAccept(invitation.id)}
                    onReject={() => handleReject(invitation.id)}
                  />
                ))}
              </div>
            ) : (
              <CardSurface className="items-center gap-4 rounded-[24px] px-6 py-10 text-center">
                <div className="bg-background-page text-text-secondary flex size-14 items-center justify-center rounded-full">
                  <UserRound className="size-7" />
                </div>
                <div className="flex max-w-[480px] flex-col gap-2">
                  <AppText
                    tag={TAG.h2}
                    size={TEXT_SIZES_VARIABLES.medium}
                    className="text-text-primary font-semibold"
                  >
                    Пока нет активных приглашений
                  </AppText>
                  <AppText className="text-text-secondary text-sm font-medium">
                    Здесь появятся только приглашения, которые еще ждут вашего ответа.
                  </AppText>
                </div>
              </CardSurface>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};
