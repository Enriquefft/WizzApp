"use client";
import { Smartphone } from "lucide-react";
import React, { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";

const PhoneNumberInput: React.FC = () => {
	const { setPhoneNumber, setAppState } = useApp();
	const [value, setValue] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const formatPhoneNumber = (input: string): string => {
		// Remove all non-digit characters
		let digits = input.replace(/\D/g, "");

		// Ensure we don't exceed maximum length
		if (digits.length > 10) {
			digits = digits.substring(0, 10);
		}

		// Format as (XXX) XXX-XXXX if there are enough digits
		if (digits.length >= 3 && digits.length <= 6) {
			return `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
		} else if (digits.length > 6) {
			return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
		}

		// Return digits as is if less than 3
		return digits;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setValue(formatted);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		// Extract just the digits for validation
		const digits = value.replace(/\D/g, "");

		if (digits.length !== 10) {
			toast.error("Please enter a valid 10-digit phone number");
			return;
		}

		setIsLoading(true);

		// Simulate network request
		setTimeout(() => {
			setPhoneNumber(digits);
			setAppState("qrCode");
			setIsLoading(false);
		}, 1000);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
			<div className="space-y-2">
				<label htmlFor="phone-number" className="block text-sm font-medium">
					Phone Number
				</label>
				<div className="relative">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						<Smartphone size={18} />
					</div>
					<Input
						id="phone-number"
						type="tel"
						placeholder="(123) 456-7890"
						value={value}
						onChange={handleChange}
						className="pl-10"
						autoComplete="tel"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					We'll send a QR code to scan with your mobile device
				</p>
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Processing..." : "Continue"}
			</Button>
		</form>
	);
};

export default PhoneNumberInput;
