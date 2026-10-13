import { isoCBOR } from "@simplewebauthn/server/helpers";
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";

// 独立测试认证器：使用真正的 P-256 密钥、CBOR 和签名，服务端验证不打桩。
// 不调用系统钥匙串，也不会给开发或生产账户注册通行密钥。
export function testAuthenticator(origin: string) {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = publicKey.export({ format: "jwk" });
  const credential = randomBytes(32);
  const id = credential.toString("base64url");
  const rpHash = createHash("sha256").update(new URL(origin).hostname).digest();
  const cose = isoCBOR.encode(
    new Map<number, number | Uint8Array>([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, Buffer.from(jwk.x!, "base64url")],
      [-3, Buffer.from(jwk.y!, "base64url")],
    ]),
  );
  const clientData = (type: string, challenge: string, requestOrigin = origin) =>
    Buffer.from(JSON.stringify({ type, challenge, origin: requestOrigin, crossOrigin: false }));
  return {
    id,
    registration(challenge: string, uv = true) {
      const credentialLength = Buffer.alloc(2);
      credentialLength.writeUInt16BE(credential.length);
      const authData = Buffer.concat([
        rpHash,
        Buffer.from([uv ? 0x45 : 0x41]),
        Buffer.alloc(4),
        Buffer.alloc(16),
        credentialLength,
        credential,
        cose,
      ]);
      const attestation = isoCBOR.encode(
        new Map<string, string | Map<string, never> | Uint8Array>([
          ["fmt", "none"],
          ["attStmt", new Map<string, never>()],
          ["authData", authData],
        ]),
      );
      return {
        id,
        rawId: id,
        type: "public-key",
        authenticatorAttachment: "platform",
        clientExtensionResults: { credProps: { rk: true } },
        response: {
          clientDataJSON: clientData("webauthn.create", challenge).toString("base64url"),
          attestationObject: Buffer.from(attestation).toString("base64url"),
          transports: ["internal"],
        },
      };
    },
    authentication(
      challenge: string,
      counter: number,
      options: { uv?: boolean; origin?: string; rpHash?: Buffer } = {},
    ) {
      const count = Buffer.alloc(4);
      count.writeUInt32BE(counter);
      const authenticatorData = Buffer.concat([
        options.rpHash ?? rpHash,
        Buffer.from([options.uv === false ? 1 : 5]),
        count,
      ]);
      const data = clientData("webauthn.get", challenge, options.origin);
      const signature = sign(
        "sha256",
        Buffer.concat([authenticatorData, createHash("sha256").update(data).digest()]),
        privateKey,
      );
      return {
        id,
        rawId: id,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: data.toString("base64url"),
          authenticatorData: authenticatorData.toString("base64url"),
          signature: signature.toString("base64url"),
          userHandle: null,
        },
      };
    },
  };
}
