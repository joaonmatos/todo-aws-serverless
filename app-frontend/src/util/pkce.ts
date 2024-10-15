/**
 * @file
 * copied from https://github.com/crouchcd/pkce-challenge
 * original author https://github.com/crouchcd
 * original license MIT
 */

/**
 * Creates an array of length `size` of random bytes
 * @param size
 * @returns Array of random ints (0 to 255)
 */
function getRandomValues(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

/** Generate cryptographically strong random string
 * @param size The desired length of the string
 * @returns The random string
 */
export function random(size: number): string {
  const mask =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  let result = "";
  const randomUints = getRandomValues(size);
  for (let i = 0; i < size; i++) {
    // cap the value of the randomIndex to mask.length - 1
    const randomIndex = randomUints[i] % mask.length;
    result += mask[randomIndex];
  }
  return result;
}

function encode(input: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(input);
}

async function sha256(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  return await crypto.subtle.digest("SHA-256", buffer);
}

function urlBase64(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "");
}

/** Generate a PKCE code challenge from a code verifier
 * @param code_verifier
 * @returns The base64 url encoded code challenge
 */
async function generateChallenge(code_verifier: string): Promise<string> {
  const encodedVerifier = encode(code_verifier);
  const hash = await sha256(encodedVerifier);
  return urlBase64(hash);
}

export type PkceChallengePair = {
  code_verifier: string;
  code_challenge: string;
};

/** Generate a PKCE challenge pair
 * @param length Length of the verifer (between 43-128). Defaults to 43.
 * @returns PKCE challenge pair
 */
export default async function pkceChallenge(
  length?: number
): Promise<PkceChallengePair> {
  if (!length) length = 43;

  if (length < 43 || length > 128) {
    throw `Expected a length between 43 and 128. Received ${length}.`;
  }

  const verifier = random(length);
  const challenge = await generateChallenge(verifier);

  return {
    code_verifier: verifier,
    code_challenge: challenge,
  };
}
