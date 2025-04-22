import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import {
	listAllGroups,
	sendDmToGroupMembers,
	tagEveryone,
} from "@/actions/wsp";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

type ActionStatus = {
	tag: boolean;
	dm: boolean;
};

const Dashboard: React.FC = () => {
	const { setAppState, clientId } = useApp();

	const [actionStatus, setActionStatus] = useState<
		Record<string, ActionStatus>
	>({});
	const fetchGroups = async (clientId: string) => {
		const data = await listAllGroups(clientId);
		// Process status if needed:
		const initialStatus: Record<string, ActionStatus> = {};
		data.forEach((group) => {
			initialStatus[group.id] = { dm: false, tag: false };
		});
		setActionStatus(initialStatus);

		return data;
	};

	const {
		data: groups,
		error,
		isFetching,
	} = useQuery({
		queryFn: () => fetchGroups(clientId),
		queryKey: ["groups", clientId],
		refetchOnMount: false, // cached permanently unless invalidated manually
		refetchOnWindowFocus: false, // do not refetch on mount
		staleTime: Infinity, // do not refetch on window focus
	});

	// data will be undefined on first render while fetching
	if (isFetching) return <div>Loading groups...</div>;
	if (error || !groups)
		return <div>Error fetching groups: {(error as Error).message}</div>;

	// Handles tagging everyone in a group
	const handleTagEveryone = async (groupId: string) => {
		setActionStatus((prev) => ({
			...prev,
			[groupId]: { dm: prev[groupId]?.dm ?? false, tag: true },
		}));

		try {
			await tagEveryone(clientId, groupId, "HI");
			toast.success(`Successfully tagged everyone in group ${groupId}.`);
		} catch (error: unknown) {
			if (error instanceof Error) toast.error(error.message);
		} finally {
			setActionStatus((prev) => ({
				...prev,
				[groupId]: { dm: prev[groupId]?.dm ?? false, tag: false },
			}));
		}
	};

	// Handles sending DM to all group members
	const handleSendDM = async (groupId: string) => {
		setActionStatus((prev) => ({
			...prev,
			[groupId]: { dm: true, tag: prev[groupId]?.tag ?? false },
		}));

		try {
			await sendDmToGroupMembers(
				clientId,
				groupId,
				"Hello, this is a direct message!",
			);
			toast.success(`Direct message sent to group ${groupId}.`);
		} catch (error: unknown) {
			if (error instanceof Error) toast.error(error.message);
		} finally {
			setActionStatus((prev) => ({
				...prev,
				[groupId]: { dm: false, tag: prev[groupId]?.tag ?? false },
			}));
		}
	};

	const handleLogout = () => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem("clientId", "false");
		}
		setAppState("landing");
	};

	return (
		<div className="w-full max-w-3xl mx-auto p-4">
			{/* Header Section */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<Button variant="outline" onClick={handleLogout}>
					Log Out
				</Button>
			</div>

			{/* Query Status */}
			{!isFetching && groups.length === 0 && !error && (
				<p className="mb-4 text-gray-600">
					No groups found. Please refresh or check back later.
				</p>
			)}

			{/* Groups List */}
			<div className="space-y-4">
				{groups.map((group) => (
					<Card key={group.id}>
						<CardHeader>
							<CardTitle>{group.name}</CardTitle>
							<CardDescription>
								Participants: {group.participantsCount}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-2">
								<div className="flex gap-2">
									<Button
										onClick={() => handleTagEveryone(group.id)}
										disabled={
											actionStatus[group.id]?.tag || actionStatus[group.id]?.dm
										}
									>
										{actionStatus[group.id]?.tag ? "Tagging…" : "Tag Everyone"}
									</Button>
									<Button
										onClick={() => handleSendDM(group.id)}
										disabled={
											actionStatus[group.id]?.dm || actionStatus[group.id]?.tag
										}
									>
										{actionStatus[group.id]?.dm ? "Sending DM…" : "Send DM"}
									</Button>
								</div>
								<div className="text-sm text-gray-500">
									<p>
										<strong>Tag Everyone:</strong> Notifies all members in this
										group.
									</p>
									<p>
										<strong>Send DM:</strong> Sends a personalized message to
										each member.
									</p>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							{/* Optionally, additional dynamic details could go here */}
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
