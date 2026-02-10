import config from "@/config";

const normalizeSiteUrl = (value) => {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
};

const isLocalUrl = (value) =>
  typeof value === "string" &&
  (value.includes("://localhost") || value.includes("://127.0.0.1"));

export const getSiteUrl = () => {
  const envSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  const normalizedEnvSiteUrl = normalizeSiteUrl(envSiteUrl);
  const normalizedNextAuthUrl = normalizeSiteUrl(process.env.NEXTAUTH_URL);

  return (
    normalizedEnvSiteUrl ||
    (!isLocalUrl(normalizedNextAuthUrl) ? normalizedNextAuthUrl : null) ||
    normalizeSiteUrl(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `https://${config.domainName}`
    )
  );
};
