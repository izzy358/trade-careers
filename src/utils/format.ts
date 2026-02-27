type PayType = 'hourly' | 'salary' | 'per-job' | string | null | undefined;

function formatSalary(value: number) {
  const inThousands = value / 1000;
  const normalized = Number.isInteger(inThousands) ? inThousands.toString() : inThousands.toFixed(1).replace(/\.0$/, '');
  return `$${normalized}K`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export function formatPay(min: number, max: number, payType: PayType) {
  if (payType === 'salary') {
    return `${formatSalary(min)}-${formatSalary(max)}/yr`;
  }

  if (payType === 'per-job') {
    return `${formatCurrency(min)}-${formatCurrency(max)}/job`;
  }

  return `$${min}-${max}/hr`;
}
