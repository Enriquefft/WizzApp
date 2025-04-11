"use client";
import { RefreshCw, Smartphone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

const QRCodeScanner: React.FC = () => {
	const { phoneNumber, setAppState } = useApp();
	const [countdown, setCountdown] = useState<number>(60);
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

	// Simulate scanning QR code to access dashboard (for demo purposes)
	const simulateQRScan = () => {
		setAppState("dashboard");
	};

	// Refresh QR code
	const refreshQRCode = () => {
		setIsRefreshing(true);
		setTimeout(() => {
			setCountdown(60);
			setIsRefreshing(false);
		}, 1000);
	};

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0) return;

		const timer = setTimeout(() => {
			setCountdown(countdown - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [countdown]);

	return (
		<div className="w-full max-w-md flex flex-col items-center space-y-6">
			<div className="text-center space-y-2">
				<h2 className="text-xl font-medium">Scan the QR Code</h2>
				<p className="text-sm text-muted-foreground">
					Open WizzApp on your phone and scan this code to connect
				</p>
			</div>

			<Card className="w-full">
				<CardContent className="p-6 flex flex-col items-center">
					{/* This is a placeholder for the QR code - in a real app, you would generate an actual QR code */}
					<div className="relative">
						<div
							className="bg-white w-64 h-64 my-4 rounded-lg border flex items-center justify-center overflow-hidden"
							onClick={simulateQRScan} // This is just for demo purposes
						>
							{isRefreshing ? (
								<RefreshCw className="animate-spin text-wizz" size={48} />
							) : (
								<div className="relative w-full h-full">
									{/* Placeholder QR */}
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="grid grid-cols-5 grid-rows-5 gap-2 w-48 h-48 p-2">
											{Array.from({ length: 25 }).map((_, i) => (
												<div
													key={i}
													className={`${Math.random() > 0.6 ? "bg-black" : "bg-transparent"} ${
														// Always show corners
														i === 0 || i === 4 || i === 20 || i === 24
															? "bg-black"
															: ""
													}`}
												/>
											))}
										</div>
									</div>
									{/* WizzApp logo in center */}
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="bg-white p-2 rounded-md">
											<span className="wizz-gradient-text font-bold">Wizz</span>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Countdown indicator */}
						{!isRefreshing && countdown > 0 && (
							<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary px-4 py-1 rounded-full text-xs">
								Expires in {countdown}s
							</div>
						)}

						{countdown <= 0 && !isRefreshing && (
							<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-1 rounded-full text-xs">
								QR Code Expired
							</div>
						)}
					</div>

					<div className="mt-6 w-full space-y-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Phone number:</span>
							<span className="font-medium flex items-center gap-1.5">
								<Smartphone size={14} />
								{phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
							</span>
						</div>

						<Button
							variant="outline"
							className="w-full"
							onClick={refreshQRCode}
							disabled={isRefreshing || countdown > 0}
						>
							{isRefreshing ? "Refreshing..." : "Refresh QR Code"}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Button
				variant="link"
				onClick={() => setAppState("login")}
				className="text-muted-foreground"
			>
				Use a different phone number
			</Button>

			{/* For demo - This button is to simulate scanning the QR code */}
			<Button variant="secondary" onClick={simulateQRScan} className="mt-4">
				Simulate QR Scan (Demo)
			</Button>
		</div>
	);
};

export default QRCodeScanner;
