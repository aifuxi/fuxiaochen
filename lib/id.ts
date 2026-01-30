import Snowflakify from "snowflakify";

const snowflakify = new Snowflakify();

export function generateId(): bigint {
  const id = snowflakify.nextId();
  return BigInt(id);
}
