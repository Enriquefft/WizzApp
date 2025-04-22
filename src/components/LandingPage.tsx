import { MessageSquare, Phone, QrCode, Shield, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getQr } from "@/actions/wsp";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const LandingPage: React.FC = () => {
	const { clientId, setAppState, setQrCode } = useApp();

	const [isLoading, setIsLoading] = useState(false);

	const handleConnect = async () => {
		try {
			sessionStorage.setItem("registered", "false");
			setIsLoading(true);
			const data = await getQr(clientId);
			sessionStorage.setItem("registered", "true");
			setQrCode(data);
			setAppState("qrCode");
			setIsLoading(false);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			}
		}
	};
	return (
		<div className="min-h-screen flex flex-col">
			{/* Hero Section */}
			<section className="py-20 px-4 text-center flex flex-col items-center">
				<h1 className="text-5xl md:text-6xl font-bold mb-6">
					Welcome to <span className="wizz-gradient-text">WizzApp</span>
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10">
					Streamline your group messaging experience with powerful web features
					that complement your mobile app
				</p>
				<div className="max-w-md w-full">
					<Button
						className="w-full"
						size="lg"
						disabled={isLoading}
						onClick={handleConnect}
					>
						Connect WhatsApp
					</Button>
					{isLoading && (
						<div className="mt-4">
							<p className="text-muted-foreground">Loading...</p>
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						</div>
					)}
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 px-4 bg-secondary/50">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
						How <span className="wizz-gradient-text">WizzApp</span> Works
					</h2>

					<div className="grid md:grid-cols-3 gap-12">
						<div className="flex flex-col items-center text-center p-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
								<Phone className="text-primary h-8 w-8" />
							</div>
							<h3 className="text-xl font-semibold mb-3">
								1. Enter Your Phone Number
							</h3>
							<p className="text-muted-foreground">
								Simply provide your phone number to connect to your WizzApp
								account. Your data stays on your device.
							</p>
						</div>

						<div className="flex flex-col items-center text-center p-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
								<QrCode className="text-primary h-8 w-8" />
							</div>
							<h3 className="text-xl font-semibold mb-3">2. Scan QR Code</h3>
							<p className="text-muted-foreground">
								Scan the QR code from your mobile device to authenticate your
								session securely.
							</p>
						</div>

						<div className="flex flex-col items-center text-center p-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
								<MessageSquare className="text-primary h-8 w-8" />
							</div>
							<h3 className="text-xl font-semibold mb-3">
								3. Access Dashboard
							</h3>
							<p className="text-muted-foreground">
								Get instant access to powerful features like tagging everyone in
								a group from a convenient web interface.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Main Feature Section */}
			<section className="py-20 px-4 bg-secondary/50 flex flex-col items-center space-y-12">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
					<div className="md:w-1/2">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">
							Tag Everyone With{" "}
							<span className="wizz-gradient-text">One Click</span>
						</h2>
						<p className="text-lg text-muted-foreground mb-6">
							Our most popular feature lets you instantly notify everyone in
							your group without having to manually tag each person. Perfect for
							important announcements and updates.
						</p>
						<div className="flex items-center gap-4 mb-8">
							<Users className="text-primary" size={24} />
							<span className="font-medium">
								Save time with group notifications
							</span>
						</div>
					</div>
					<div className="md:w-1/2 bg-muted p-6 rounded-lg shadow-lg">
						<div className="aspect-video bg-card rounded flex flex-col items-center justify-center p-8 border">
							<Users className="h-16 w-16 text-primary mb-4" />
							<span className="text-xl font-semibold">@everyone</span>
							<p className="text-center text-muted-foreground mt-4">
								Notify all group members with a single click
							</p>
						</div>
					</div>
				</div>
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
					<div className="md:w-1/2">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">
							DM Everyone for{" "}
							<span className="wizz-gradient-text">Maximum conversions</span>
						</h2>
						<p className="text-lg text-muted-foreground mb-6">
							Our most popular feature lets you instantly DM everyone in.
							Perfect if you want everyone to see your message.
						</p>
						<div className="flex items-center gap-4 mb-8">
							<Users className="text-primary" size={24} />
							<span className="font-medium">
								Maximize your reach with direct messages
							</span>
						</div>
					</div>
					<div className="md:w-1/2 bg-muted p-6 rounded-lg shadow-lg">
						<div className="aspect-video bg-card rounded flex flex-col items-center justify-center p-8 border">
							<Users className="h-16 w-16 text-primary mb-4" />
							<span className="text-xl font-semibold">DM everyone</span>
							<p className="text-center text-muted-foreground mt-4">
								Send direct messages to all group members with ease
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Coming Soon Features Section */}
			<section className="py-20 px-4 bg-primary/5">
				<div className="max-w-7xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						More Features{" "}
						<span className="wizz-gradient-text">Coming Soon</span>
					</h2>
					<p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
						Tag Everyone is just the beginning. The WizzApp team is hard at work
						developing additional powerful features to enhance your messaging
						experience. Stay tuned for upcoming updates!
					</p>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<div className="bg-card p-6 rounded-lg border shadow-xs">
							<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
								<MessageSquare className="text-primary h-6 w-6" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Message Templates</h3>
							<p className="text-muted-foreground">
								Save and reuse common messages with one-click access
							</p>
						</div>

						<div className="bg-card p-6 rounded-lg border shadow-xs">
							<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
								<Users className="text-primary h-6 w-6" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Group Management</h3>
							<p className="text-muted-foreground">
								Advanced tools for organizing and managing your groups
							</p>
						</div>

						<div className="bg-card p-6 rounded-lg border shadow-xs">
							<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
								<MessageSquare className="text-primary h-6 w-6" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Scheduled Messages</h3>
							<p className="text-muted-foreground">
								Plan and schedule messages to be sent at specific times
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Privacy & Security Section */}
			<section className="py-20 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row items-center gap-8">
						<div className="md:w-1/2">
							<h2 className="text-3xl md:text-4xl font-bold mb-6">
								Your Privacy & Security Is Our{" "}
								<span className="wizz-gradient-text">Priority</span>
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								WizzApp is designed with your privacy at its core. We use QR
								code authentication to securely link your web session to your
								mobile device without storing your data on our servers.
							</p>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Shield className="text-primary mt-1" size={20} />
									<p className="text-muted-foreground">
										<span className="font-medium text-foreground">
											Client-side only:
										</span>{" "}
										Your phone number and messaging data never leaves your
										device
									</p>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="text-primary mt-1" size={20} />
									<p className="text-muted-foreground">
										<span className="font-medium text-foreground">
											Secure QR authentication:
										</span>{" "}
										The QR code only provides temporary access to your current
										session
									</p>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="text-primary mt-1" size={20} />
									<p className="text-muted-foreground">
										<span className="font-medium text-foreground">
											No server storage:
										</span>{" "}
										We don't store your messages, contacts, or personal
										information on our servers
									</p>
								</div>
							</div>
						</div>
						<div className="md:w-1/2 bg-muted p-6 rounded-lg shadow-lg">
							<div className="aspect-video bg-card rounded flex flex-col items-center justify-center p-8 border">
								<Shield className="h-16 w-16 text-primary mb-4" />
								<span className="text-xl font-semibold">
									End-to-End Security
								</span>
								<p className="text-center text-muted-foreground mt-4">
									Your data stays on your device, encrypted and secure
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* About Creator Section */}
			<section className="py-20 px-4 bg-secondary/50">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						About the Creator
					</h2>
					<div className="w-24 h-24 bg-primary/10 mx-auto rounded-full flex items-center justify-center mb-6">
						<Users className="text-primary h-12 w-12" />
					</div>
					<h3 className="text-xl font-semibold mb-2">WizzApp Team</h3>
					<p className="text-muted-foreground mb-8">
						WizzApp was created by a passionate team of developers who wanted to
						bridge the gap between mobile messaging and web functionality. Our
						mission is to make group communications more efficient and
						accessible.
					</p>
				</div>
			</section>
		</div>
	);
};

export default LandingPage;
