export const ERROR_NO_PERMISSION = new Error("无权限");

export const ERROR_CODES = {
  internalError: -1,
  ok: 0,
  badRequest: 100400,
  alreadyExist: 100001,
};

export const ERROR_INTERNAL: BaseResponse = {
  code: ERROR_CODES.internalError,
  message: "internal error",
};

export const ERROR_SUCCESS: BaseResponse = {
  code: ERROR_CODES.ok,
  message: "ok",
};

export const ERROR_BAD_REQUEST: BaseResponse = {
  code: ERROR_CODES.badRequest,
  message: "bad request",
};

export const ERROR_ALREADY_EXIST: BaseResponse = {
  code: ERROR_CODES.alreadyExist,
  message: "already exist",
};
