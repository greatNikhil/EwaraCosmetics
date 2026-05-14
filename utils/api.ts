const DEFAULT_API_ORIGIN = "http://localhost:5000";

const resolveApiOrigin = () => {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_ORIGIN;

  if (typeof window === "undefined") {
    return configuredOrigin;
  }

  try {
    const configuredUrl = new URL(configuredOrigin);
    const browserHost = window.location.hostname;

    // When the app is opened on localhost, prefer the local API even if a LAN IP
    // was left in env from a previous device test session.
    if (
      (browserHost === "localhost" || browserHost === "127.0.0.1") &&
      configuredUrl.hostname !== "localhost" &&
      configuredUrl.hostname !== "127.0.0.1"
    ) {
      return `${configuredUrl.protocol}//localhost:${configuredUrl.port || "5000"}`;
    }
  } catch {
    return DEFAULT_API_ORIGIN;
  }

  return configuredOrigin;
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiOrigin()}${normalizedPath}`;
};
