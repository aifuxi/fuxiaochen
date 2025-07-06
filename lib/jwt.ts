import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
  email: string;
  role: string;
}

// TODO: 提取到env文件中
const secret = "3GZa3nKE7xLOjUUmQtC0xA41dwkmNKdhMBmF0WL3LJs=";

export function createToken(payload: Payload) {
  return jwt.sign(
    {
      data: payload,
    },
    secret,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, secret);
    return Boolean(decoded);
  } catch (err) {
    console.log("[verifyToken] error:", err);
    return false;
  }
}
