"use client";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useApp } from "@/context/AppContext";

const AppLayout: React.FC = () => {
	const { appState, qrCode, clientId } = useApp();

	return (
		<main className="min-h-screen flex flex-col">
			{/* STATE INFO */}
			<div className="font-semibold text-center p-4 text-sm text-muted-foreground flex flex-col gap-2">
				{[appState, qrCode, clientId].map((item) => (
					<div key={item} className="text-xs">
						{item}
					</div>
				))}
			</div>

			<div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col items-center justify-center">
				{appState === "landing" && <LandingPage />}

				{appState === "qrCode" && (
					<div className="text-center max-w-md space-y-4 animate-fade-in">
						<QRCodeScanner />
					</div>
				)}

				{appState === "dashboard" && <Dashboard />}
			</div>

			<footer className="border-t py-4 px-6">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
					<div className="mb-2 md:mb-0">
						<span className="font-semibold text-foreground">WizzApp</span> ©
						2025. All rights reserved.
					</div>
					<div className="flex items-center gap-4">
						<a href="/" className="hover:text-foreground transition-colors">
							Privacy Policy
						</a>
						<a href="/" className="hover:text-foreground transition-colors">
							Terms of Service
						</a>
						<a href="/" className="hover:text-foreground transition-colors">
							Help
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
};

export default AppLayout;
