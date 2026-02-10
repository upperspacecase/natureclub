import { Inter, Libre_Baskerville } from "next/font/google";
import { headers } from "next/headers";
import { getSEOTags } from "@/libs/seo";
import { getSiteUrl } from "@/libs/site-url";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const libre = Libre_Baskerville({
	subsets: ["latin"],
	weight: ["400", "700"],
	style: ["normal", "italic"],
	variable: "--font-libre",
});

export const viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// The metadata base is resolved from the incoming request host so OG URLs match the actual domain.
export async function generateMetadata() {
  const defaultMetadata = getSEOTags();
  const fallbackBase = new URL(`${getSiteUrl()}/`);

  try {
    const requestHeaders = await headers();
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const host = forwardedHost || requestHeaders.get("host");

    if (!host) {
      return {
        ...defaultMetadata,
        metadataBase: fallbackBase,
      };
    }

    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const protocol =
      forwardedProto ||
      (host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https");

    return {
      ...defaultMetadata,
      metadataBase: new URL(`${protocol}://${host}/`),
    };
  } catch {
    return {
      ...defaultMetadata,
      metadataBase: fallbackBase,
    };
  }
}

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={`${inter.className} ${inter.variable} ${libre.variable}`}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
