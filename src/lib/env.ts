export function getRequiredServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value || value === "re_mock" || value === "APP_USR-mock-token" || value === "mock-token") {
    throw new Error(`${name} is required and must not use a mock value.`);
  }

  return value;
}

export function getRequiredHttpsOrigin(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_SITE_URL must use https://.");
    }

    return url.origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute HTTPS URL.");
  }
}

export function isProductionLike(): boolean {
  return process.env.NODE_ENV === "production";
}
