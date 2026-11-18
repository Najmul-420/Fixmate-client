import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixMate - Smart Device & Home Appliance Repair",
  description:
    "Connect with verified technicians for on-demand home appliance and device repairs.",
};

/**
 * Adaptive theme bootstrap.
 * Runs before first paint (no flash): applies the dark theme when the
 * screen/OS prefers dark, or follows a stored user choice, and keeps the
 * primary color tokens in sync automatically as the theme context changes.
 * A future theme toggle only needs to write "light"/"dark" to localStorage.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("fixmate-theme");
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var apply = function () {
      var dark = stored ? stored === "dark" : media.matches;
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    // Follow OS changes only while the user has not chosen a theme.
    media.addEventListener("change", function (event) {
      if (localStorage.getItem("fixmate-theme")) return;
      document.documentElement.classList.toggle("dark", event.matches);
    });
  } catch (error) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
