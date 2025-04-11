import "@/styles/globals.css";

export { metadata } from "@/metadata";

import { AppProvider } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { inter as fontSans } from "@/styles/fonts";

/**
 * @param layoutPros - The root layout component props
 * @param layoutPros.children - The layout children
 * @returns The root layout component
 */
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<AppProvider>
				<body
					className={cn(
						"min-h-screen bg-background font-sans antialiased",
						fontSans.className,
					)}
				>
					{children}
				</body>
			</AppProvider>
		</html>
	);
}
