"use client";
import { createContext, type ReactNode, useContext, useState } from "react";
import { z } from "zod";

export type AppState = "landing" | "qrCode" | "dashboard";

interface AppContextType {
	appState: AppState;
	setAppState: (state: AppState) => void;
	qrCode: string;
	setQrCode: (code: string) => void;
	clientId: string;
	setClientId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialClientId = (): string => {
	if (typeof window !== "undefined") {
		const existing = sessionStorage.getItem("clientId");
		if (existing) return existing;
		const newClientId = Math.random().toString(36).substring(2, 15);
		sessionStorage.setItem("clientId", newClientId);
		return newClientId;
	}
	return "";
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	let isRegistered: "true" | "false" = "false";
	if (typeof window !== "undefined") {
		isRegistered = z
			.enum(["true", "false"])
			.nullable()
			.transform((val) => val ?? "false")
			.parse(sessionStorage.getItem("registered"));
	}
	const [appState, setAppState] = useState<AppState>(
		isRegistered === "true" ? "dashboard" : "landing",
	);
	const [qrCode, setQrCode] = useState<string>("");
	const [clientId, setClientId] = useState<string>(() => getInitialClientId());

	return (
		<AppContext.Provider
			value={{
				appState,
				clientId,
				qrCode,
				setAppState,
				setClientId,
				setQrCode,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useApp = (): AppContextType => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useApp must be used within an AppProvider");
	}
	return context;
};
