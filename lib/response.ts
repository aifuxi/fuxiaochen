import { NextResponse } from "next/server";

// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface ResponseData {
  code: number;
  message: string;
  data?: any;
  timestamp: string;
}

export function success(data: any) {
  return NextResponse.json({
    code: 0,
    message: "ok",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function businessError(msg: string) {
  return NextResponse.json(
    {
      code: -1,
      message: msg,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

export function paramError(msg: string) {
  return NextResponse.json(
    {
      code: 1001,
      message: msg,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  );
}

export function unauthorized(msg: string = "Unauthorized") {
  return NextResponse.json(
    {
      code: 401,
      message: msg,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 401 },
  );
}

export function forbidden(msg: string = "Forbidden") {
  return NextResponse.json(
    {
      code: 403,
      message: msg,
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 403 },
  );
}
