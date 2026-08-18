export function decodeBase64(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const bytes = Uint8Array.from(atob(base64), (char) =>
    char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
};