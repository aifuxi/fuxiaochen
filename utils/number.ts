import { toNumber } from 'lodash-es';

const formatDecimal = (n: number) => {
  let num = n.toString();
  const index = num.indexOf('.');
  if (index !== -1) {
    num = num.substring(0, 1 + index + 1);
  } else {
    num = num.substring(0);
  }
  return parseFloat(num).toFixed(1);
};

export const formatNum = (n?: number | string | null) => {
  if (!n) {
    return '0';
  }

  const num = toNumber(n);

  if (num < 10 ** 3) {
    return `${num}`;
  } else if (num >= 10 ** 3 && num < 10 ** 4) {
    return `${formatDecimal(num / 10 ** 3)}k`;
  } else if (num >= 10 ** 4 && num < 10 ** 8) {
    return `${formatDecimal(num / 10 ** 4)}w`;
  } else if (num >= 10 ** 8) {
    return `${formatDecimal(num / 10 ** 8)}亿`;
  }
};
