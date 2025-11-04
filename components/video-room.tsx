'use client';

import { MessageSquare, Mic, MicOff, PhoneOff, ScreenShare, Users, Video, VideoOff } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Participant = {
	id: string;
	name: string;
	image?: string;
	isMuted: boolean;
	isVideoOff: boolean;
	isScreenSharing: boolean;
	isHost: boolean;
};

type Message = {
	id: string;
	senderId: string;
	senderName: string;
	senderImage?: string;
	content: string;
	timestamp: Date;
};

type VideoRoomProps = {
	sessionId: string;
	userId: string;
	userName: string;
	userImage?: string;
	isHost: boolean;
	onLeave: () => void;
};

export function VideoRoom({ userId, userName, userImage, isHost, onLeave }: VideoRoomProps) {
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const localVideoRef = useRef<HTMLVideoElement>(null);

	// Mock participants
	useEffect(() => {
		// In a real implementation, this would come from the WebRTC service
		const mockParticipants: Participant[] = [
			{
				id: userId,
				name: userName,
				image: userImage,
				isMuted,
				isVideoOff,
				isScreenSharing,
				isHost,
			},
			{
				id: 'participant-1',
				name: 'Dr. Sarah Johnson',
				image: '/placeholder.svg?height=40&width=40',
				isMuted: false,
				isVideoOff: false,
				isScreenSharing: false,
				isHost: !isHost,
			},
			{
				id: 'participant-2',
				name: 'Dr. Michael Chen',
				image: '/placeholder.svg?height=40&width=40',
				isMuted: true,
				isVideoOff: false,
				isScreenSharing: false,
				isHost: false,
			},
			{
				id: 'participant-3',
				name: 'Dr. Emily Rodriguez',
				image: '/placeholder.svg?height=40&width=40',
				isMuted: false,
				isVideoOff: true,
				isScreenSharing: false,
				isHost: false,
			},
		];
		const t = setTimeout(() => setParticipants(mockParticipants), 0);
		return () => clearTimeout(t);
	}, [userId, userName, userImage, isMuted, isVideoOff, isScreenSharing, isHost]);

	// Simulate getting local video stream
	useEffect(() => {
		// In a real implementation, this would use navigator.mediaDevices.getUserMedia
		// For this demo, we'll just show a placeholder
		const simulateLocalVideo = async () => {
			if (localVideoRef.current) {
				try {
					// In a real implementation, this would be:
					// const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
					// localVideoRef.current.srcObject = stream;

					// For the demo, we'll just set a poster image
					localVideoRef.current.poster = userImage || '/placeholder.svg?height=300&width=400';
				} catch (error) {
					console.error('Error accessing media devices:', error);
				}
			}
		};

		simulateLocalVideo();
	}, [userImage]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim()) {
			const newMessage: Message = {
				id: `msg-${Date.now()}`,
				senderId: userId,
				senderName: userName,
				senderImage: userImage,
				content: message,
				timestamp: new Date(),
			};
			setMessages(prev => [...prev, newMessage]);
			setMessage('');
		}
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
		// In a real implementation, this would toggle the audio track
		toast.success(isMuted ? 'Microphone unmuted. Microphone unmuted' : 'Microphone muted. Microphone muted');
	};

	const toggleVideo = () => {
		setIsVideoOff(!isVideoOff);
		// In a real implementation, this would toggle the video track
		toast.success(isVideoOff ? 'Camera turned on. Camera turned on' : 'Camera turned off. Camera turned off');
	};

	const toggleScreenShare = () => {
		// In a real implementation, this would use navigator.mediaDevices.getDisplayMedia
		setIsScreenSharing(!isScreenSharing);
		toast.success(
			isScreenSharing
				? 'Stopped sharing screen. Stopped sharing screen'
				: 'Started sharing screen. Started sharing screen',
		);
	};

	const toggleRecording = () => {
		if (isHost) {
			setIsRecording(!isRecording);
			toast.success(isRecording ? 'Recording stopped. Recording stopped' : 'Recording started. Recording started');
		} else {
			toast.error('Only the host can record the session. Only the host can record the session');
		}
	};

	const handleLeave = () => {
		// In a real implementation, this would disconnect from the WebRTC service
		toast.success('Left the session. Left the session');
		onLeave();
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<div className="lg:col-span-2 flex flex-col gap-4">
					{/* Main video area */}
					<div className="relative aspect-video bg-black rounded-lg overflow-hidden">
						{isScreenSharing ? (
							<div className="absolute inset-0 flex items-center justify-center bg-muted">
								<div className="text-center">
									<ScreenShare className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
									<p className="text-muted-foreground">Screen sharing is active</p>
								</div>
							</div>
						) : (
							<video
								ref={localVideoRef}
								className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
								autoPlay
								playsInline
								muted
							/>
						)}

						{isVideoOff && !isScreenSharing && (
							<div className="absolute inset-0 flex items-center justify-center">
								<Avatar className="h-24 w-24">
									<AvatarImage src={userImage || '/placeholder.svg'} alt={userName} />
									<AvatarFallback>{userName.charAt(0)}</AvatarFallback>
								</Avatar>
							</div>
						)}

						<div className="absolute bottom-4 left-4 flex items-center gap-2">
							<Badge variant={isHost ? 'default' : 'outline'} className="text-xs">
								{isHost ? 'Host' : 'Participant'}
							</Badge>
							{isMuted && (
								<Badge variant="destructive" className="text-xs">
									Muted
								</Badge>
							)}
							{isRecording && (
								<Badge variant="destructive" className="text-xs flex items-center gap-1">
									<span className="h-2 w-2 rounded-full bg-current animate-pulse" />
									Recording
								</Badge>
							)}
						</div>
					</div>

					{/* Participant videos */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
						{participants
							.filter(p => p.id !== userId)
							.map(participant => (
								<div key={participant.id} className="aspect-video bg-muted rounded-lg relative overflow-hidden">
									{participant.isVideoOff ? (
										<div className="absolute inset-0 flex items-center justify-center">
											<Avatar className="h-12 w-12">
												<AvatarImage src={participant.image || '/placeholder.svg'} alt={participant.name} />
												<AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
											</Avatar>
										</div>
									) : (
										<div className="w-full h-full">
											<Image
												src={participant.image || '/placeholder.svg?height=100&width=150'}
												alt={participant.name}
												className="w-full h-full object-cover"
											/>
										</div>
									)}

									<div className="absolute bottom-2 left-2 right-2">
										<div className="flex items-center justify-between">
											<span className="text-xs truncate bg-black/50 text-white px-2 py-1 rounded-md">
												{participant.name}
											</span>
											<div className="flex gap-1">
												{participant.isMuted && <MicOff className="h-3 w-3 text-white" />}
												{participant.isScreenSharing && <ScreenShare className="h-3 w-3 text-white" />}
											</div>
										</div>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Chat and participants sidebar */}
				<div className="bg-card rounded-lg border shadow-sm">
					<Tabs
						defaultValue="chat"
						value={activeTab}
						onValueChange={value => setActiveTab(value as 'chat' | 'participants')}
					>
						<TabsList className="w-full">
							<TabsTrigger value="chat" className="flex-1">
								<MessageSquare className="h-4 w-4 mr-2" />
								Chat
							</TabsTrigger>
							<TabsTrigger value="participants" className="flex-1">
								<Users className="h-4 w-4 mr-2" />
								Participants ({participants.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="chat" className="p-0">
							<div className="flex flex-col h-[400px]">
								<ScrollArea className="flex-1 p-4">
									{messages.length === 0 ? (
										<div className="h-full flex items-center justify-center text-muted-foreground">
											<p>No messages yet</p>
										</div>
									) : (
										<div className="space-y-4">
											{messages.map(msg => (
												<div key={msg.id} className="flex gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={msg.senderImage || '/placeholder.svg'} alt={msg.senderName} />
														<AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
													</Avatar>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium text-sm">{msg.senderName}</span>
															<span className="text-xs text-muted-foreground">
																{msg.timestamp.toLocaleTimeString([], {
																	hour: '2-digit',
																	minute: '2-digit',
																})}
															</span>
														</div>
														<p className="text-sm">{msg.content}</p>
													</div>
												</div>
											))}
										</div>
									)}
								</ScrollArea>

								<form onSubmit={handleSendMessage} className="p-4 border-t">
									<div className="flex gap-2">
										<Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} />
										<Button type="submit">Send</Button>
									</div>
								</form>
							</div>
						</TabsContent>

						<TabsContent value="participants" className="p-0">
							<ScrollArea className="h-[400px] p-4">
								<div className="space-y-2">
									{participants.map(participant => (
										<div
											key={participant.id}
											className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
										>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={participant.image || '/placeholder.svg'} alt={participant.name} />
													<AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
												</Avatar>
												<div>
													<div className="flex items-center gap-2">
														<span className="font-medium text-sm">{participant.name}</span>
														{participant.isHost && (
															<Badge variant="outline" className="text-xs">
																Host
															</Badge>
														)}
													</div>
												</div>
											</div>
											<div className="flex gap-1">
												{participant.isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
												{participant.isVideoOff && <VideoOff className="h-4 w-4 text-muted-foreground" />}
												{participant.isScreenSharing && <ScreenShare className="h-4 w-4 text-muted-foreground" />}
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Controls */}
			<div className="flex items-center justify-center gap-2 sm:gap-4 p-4 bg-card rounded-lg border shadow-sm">
				<Button
					variant={isMuted ? 'secondary' : 'default'}
					size="icon"
					className="h-12 w-12 rounded-full"
					onClick={toggleMute}
				>
					{isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
				</Button>

				<Button
					variant={isVideoOff ? 'secondary' : 'default'}
					size="icon"
					className="h-12 w-12 rounded-full"
					onClick={toggleVideo}
				>
					{isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
				</Button>

				<Button
					variant={isScreenSharing ? 'default' : 'secondary'}
					size="icon"
					className="h-12 w-12 rounded-full"
					onClick={toggleScreenShare}
				>
					<ScreenShare className="h-5 w-5" />
				</Button>

				{isHost && (
					<Button
						variant={isRecording ? 'default' : 'secondary'}
						size="icon"
						className={`h-12 w-12 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
						onClick={toggleRecording}
					>
						<span className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-muted-foreground'}`} />
					</Button>
				)}

				<Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={handleLeave}>
					<PhoneOff className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}
