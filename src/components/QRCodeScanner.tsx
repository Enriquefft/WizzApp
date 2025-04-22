import { QRCodeSVG } from "qrcode.react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const QRCodeScanner: React.FC = () => {
	const { qrCode, setAppState } = useApp();

	const handleProceed = () => {
		toast.success("WhatsApp client authenticated!");
		setAppState("dashboard");
	};

	return (
		<div className="flex flex-col items-center">
			<h2 className="text-xl font-semibold mb-4">
				Scan the QR Code with your phone
			</h2>
			{qrCode ? <QRCodeSVG value={qrCode} /> : <p>No QR Code available</p>}
			<div className="mt-4">
				<Button variant="outline" onClick={() => setAppState("landing")}>
					Retry
				</Button>
				<Button onClick={handleProceed}>Done</Button>
			</div>
		</div>
	);
};

export default QRCodeScanner;
