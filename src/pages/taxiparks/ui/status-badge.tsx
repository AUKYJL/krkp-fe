interface StatusBadgeProps {
  label: string;
}

export const StatusBadge = ({ label }: StatusBadgeProps) => {
  return (
    <span className="bg-accent-primary-soft text-text-primary inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold">
      {label}
    </span>
  );
};
