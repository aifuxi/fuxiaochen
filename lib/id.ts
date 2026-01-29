// @ts-ignore
import Snowflake from "snowflake-id";

const snowflake = new Snowflake({
  mid: 1,
  offset: (2010 - 1970) * 31536000 * 1000,
});

export function generateId(): bigint {
  const id = snowflake.generate();
  return BigInt(id);
}
