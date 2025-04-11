import {
	AtSign,
	ChevronRight,
	LogOut,
	MessageCircle,
	PhoneCall,
	Users,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";

const Dashboard: React.FC = () => {
	const { phoneNumber, groupName, setGroupName, tagEveryone, setAppState } =
		useApp();

	const handleLogout = () => {
		setAppState("login");
	};

	return (
		<div className="w-full max-w-3xl animate-slide-up">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold flex items-center">
						<span className="wizz-gradient-text">WizzApp</span>
						<span className="ml-2 text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
							Dashboard
						</span>
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Connected to{" "}
						{phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleLogout}
					className="gap-1.5"
				>
					<LogOut size={16} />
					Log Out
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Main functions card */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Tag Everyone</CardTitle>
						<CardDescription>
							Notify all members of a group with @everyone
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="group-name" className="text-sm font-medium">
								Group Name
							</label>
							<Input
								id="group-name"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="Enter group name"
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={tagEveryone} className="gap-1.5">
							<AtSign size={18} />
							Tag Everyone
						</Button>
					</CardFooter>
				</Card>

				{/* Stats card */}
				<Card>
					<CardHeader>
						<CardTitle>Your Stats</CardTitle>
						<CardDescription>Activity overview</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm flex items-center gap-1.5">
								<Users size={16} />
								Groups
							</span>
							<span className="font-medium">7</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm flex items-center gap-1.5">
								<MessageCircle size={16} />
								Messages
							</span>
							<span className="font-medium">1,243</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm flex items-center gap-1.5">
								<AtSign size={16} />
								Tags Used
							</span>
							<span className="font-medium">12</span>
						</div>
					</CardContent>
				</Card>

				{/* Coming soon features */}
				<Card className="md:col-span-3 bg-secondary/50">
					<CardHeader>
						<CardTitle>Coming Soon</CardTitle>
						<CardDescription>New features on the horizon</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							<div className="bg-background rounded-lg p-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="h-8 w-8 rounded-md wizz-gradient-bg flex items-center justify-center text-white">
										<PhoneCall size={18} />
									</div>
									<div>
										<p className="font-medium">Audio Messages</p>
										<p className="text-xs text-muted-foreground">
											Voice notes and calls
										</p>
									</div>
								</div>
								<ChevronRight size={16} className="text-muted-foreground" />
							</div>

							<div className="bg-background rounded-lg p-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="h-8 w-8 rounded-md wizz-gradient-bg flex items-center justify-center text-white">
										<Users size={18} />
									</div>
									<div>
										<p className="font-medium">Group Management</p>
										<p className="text-xs text-muted-foreground">
											Create and edit groups
										</p>
									</div>
								</div>
								<ChevronRight size={16} className="text-muted-foreground" />
							</div>

							<div className="bg-background rounded-lg p-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="h-8 w-8 rounded-md wizz-gradient-bg flex items-center justify-center text-white">
										<MessageCircle size={18} />
									</div>
									<div>
										<p className="font-medium">Message Templates</p>
										<p className="text-xs text-muted-foreground">
											Save and reuse messages
										</p>
									</div>
								</div>
								<ChevronRight size={16} className="text-muted-foreground" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Dashboard;
