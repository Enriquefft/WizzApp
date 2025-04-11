"use client";
import { createContext, type ReactNode, useContext, useState } from "react";
import { toast } from "sonner";

// App states
type AppState = "landing" | "login" | "qrCode" | "dashboard";

// Define the context type
interface AppContextType {
	phoneNumber: string;
	setPhoneNumber: (phone: string) => void;
	appState: AppState;
	setAppState: (state: AppState) => void;
	groupName: string;
	setGroupName: (name: string) => void;
	tagEveryone: () => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [appState, setAppState] = useState<AppState>("landing");
	const [groupName, setGroupName] = useState<string>("");

	const tagEveryone = () => {
		if (!groupName.trim()) {
			toast.error("Please enter a group name");
			return;
		}

		toast.success(`Successfully tagged everyone in "${groupName}"`, {
			description: "All members have been notified",
		});
	};

	return (
		<AppContext.Provider
			value={{
				appState,
				groupName,
				phoneNumber,
				setAppState,
				setGroupName,
				setPhoneNumber,
				tagEveryone,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useApp must be used within an AppProvider");
	}
	return context;
};
