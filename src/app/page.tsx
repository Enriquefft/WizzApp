"use client";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useApp } from "@/context/AppContext";

const AppLayout: React.FC = () => {
	const { appState } = useApp();

	return (
		<main className="min-h-screen flex flex-col">
			<div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col items-center justify-center">
				{appState === "landing" && <LandingPage />}

				{appState === "login" && (
					<div className="text-center max-w-md space-y-6 animate-fade-in">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
								Welcome to <span className="wizz-gradient-text">WizzApp</span>
							</h1>
							<p className="text-muted-foreground">
								Enter your phone number to access your dashboard
							</p>
						</div>
						<PhoneNumberInput />
					</div>
				)}

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
