const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("ru-RU");

export const formatMoney = (value?: number | null) => {
  if (value == null) {
    return "—";
  }

  return `${moneyFormatter.format(value)} ₽`;
};

export const formatPercent = (value?: number | null) => {
  if (value == null) {
    return "—";
  }

  return `${percentFormatter.format(value)}%`;
};

export const formatNumber = (value?: number | null) => {
  if (value == null) {
    return "—";
  }

  return numberFormatter.format(value);
};
