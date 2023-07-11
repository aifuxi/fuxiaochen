import { checkPermission } from './auth';
import { isNil, isNull, isUndefined } from './check';
import {
  cn,
  createFailResponse,
  createSuccessResponse,
  createSuccessTotalResponse,
  generatePageTitle,
  getBaseURL,
  isDev,
  isProduction,
  isServer,
} from './helper';
import { numberFormatter } from './number';
import { formatToDate, formatToDateTime } from './time';
import { obj2QueryString } from './url';

export {
  cn,
  createSuccessResponse,
  createSuccessTotalResponse,
  createFailResponse,
  isServer,
  getBaseURL,
  isProduction,
  isDev,
  generatePageTitle,
  numberFormatter,
  obj2QueryString,
  formatToDate,
  formatToDateTime,
  isUndefined,
  isNull,
  isNil,
  checkPermission,
};
