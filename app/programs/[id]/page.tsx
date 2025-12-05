'use client';

import { Check, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for the program
const programData = {
	id: '1',
	title: 'Comprehensive Medical Aesthetics',
	description:
		'A complete curriculum covering all aspects of medical aesthetics, from foundational knowledge to advanced techniques.',
	longDescription: `This comprehensive program is designed for medical professionals who want to build a strong foundation in medical aesthetics while also mastering advanced techniques.

Over the course of 12 months, you'll learn from industry experts through a combination of video lessons, live demonstrations, interactive workshops, and hands-on training opportunities.

The curriculum is structured to provide a systematic progression from basic principles to specialized applications, ensuring that you develop the knowledge, skills, and confidence needed to excel in the field of medical aesthetics.`,
	image: '/placeholder.svg?height=400&width=800',
	duration: '12 months',
	courses: 8,
	students: 324,
	level: 'Beginner to Advanced',
	pricing: {
		monthly: 299,
		yearly: 2990,
		lifetime: 3990,
	},
	tags: ['Botox', 'Fillers', 'Laser', 'Business'],
	whatYouWillLearn: [
		'Comprehensive facial anatomy with focus on aesthetic implications',
		'Injection techniques for all FDA-approved neurotoxins and dermal fillers',
		'Laser and energy-based device principles and applications',
		'Complication prevention, recognition, and management',
		'Patient assessment, treatment planning, and setting realistic expectations',
		'Medical aesthetic practice management and business strategies',
		'Medical photography and documentation best practices',
		'Legal and regulatory considerations in aesthetic medicine',
	],
	requirements: [
		'Must be a licensed medical professional (MD, DO, NP, PA, RN, or equivalent)',
		'Basic understanding of facial anatomy',
		'Computer with internet access for online components',
		'Ability to attend live virtual sessions and in-person workshops',
	],
	instructors: [
		{
			id: '1',
			name: 'Dr. Sarah Johnson',
			image: '/placeholder.svg?height=100&width=100',
			title: 'Board-Certified Dermatologist',
			bio: 'With over 15 years of experience in medical aesthetics, Dr. Johnson specializes in advanced injection techniques and has trained over 500 medical professionals.',
		},
		{
			id: '2',
			name: 'Dr. Michael Chen',
			image: '/placeholder.svg?height=100&width=100',
			title: 'Facial Plastic Surgeon',
			bio: 'Dr. Chen brings his extensive knowledge of facial anatomy and surgical expertise to help students understand the structural foundations of aesthetic treatments.',
		},
		{
			id: '3',
			name: 'Dr. Emily Rodriguez',
			image: '/placeholder.svg?height=100&width=100',
			title: 'Cosmetic Dermatologist',
			bio: 'Specializing in laser treatments and energy-based devices, Dr. Rodriguez has authored multiple publications on non-invasive aesthetic procedures.',
		},
	],
	curriculum: [
		{
			title: 'Foundations of Medical Aesthetics',
			lessons: [
				{
					title: 'Introduction to Medical Aesthetics',
					duration: '45 min',
					type: 'video',
				},
				{ title: 'Applied Facial Anatomy', duration: '1.5 hrs', type: 'video' },
				{
					title: 'Patient Assessment and Photography',
					duration: '1 hr',
					type: 'video',
				},
				{ title: 'Foundations Quiz', duration: '30 min', type: 'quiz' },
			],
		},
		{
			title: 'Neurotoxins Masterclass',
			lessons: [
				{ title: 'Neurotoxin Pharmacology', duration: '1 hr', type: 'video' },
				{
					title: 'Upper Face Injection Techniques',
					duration: '2 hrs',
					type: 'video',
				},
				{
					title: 'Lower Face Applications',
					duration: '1.5 hrs',
					type: 'video',
				},
				{ title: 'Live Demonstration', duration: '2 hrs', type: 'workshop' },
				{ title: 'Neurotoxin Complications', duration: '1 hr', type: 'video' },
				{
					title: 'Neurotoxins Assessment',
					duration: '45 min',
					type: 'assignment',
				},
			],
		},
		{
			title: 'Dermal Fillers Comprehensive',
			lessons: [
				{
					title: 'Filler Materials and Properties',
					duration: '1 hr',
					type: 'video',
				},
				{
					title: 'Injection Techniques and Planes',
					duration: '1.5 hrs',
					type: 'video',
				},
				{
					title: 'Midface and Cheek Augmentation',
					duration: '2 hrs',
					type: 'video',
				},
				{
					title: 'Lip Enhancement Masterclass',
					duration: '2 hrs',
					type: 'video',
				},
				{
					title: 'Jawline and Chin Contouring',
					duration: '1.5 hrs',
					type: 'video',
				},
				{ title: 'Live Demonstration', duration: '2 hrs', type: 'workshop' },
				{
					title: 'Fillers Final Assessment',
					duration: '1 hr',
					type: 'assignment',
				},
			],
		},
	],
	reviews: [
		{
			id: '1',
			user: {
				name: 'Dr. James Wilson',
				image: '/placeholder.svg?height=40&width=40',
			},
			rating: 5,
			date: '2023-04-15',
			content:
				'This program has transformed my practice. The comprehensive approach covers everything from basic principles to advanced techniques. The instructors are top-notch and the hands-on workshops provided invaluable experience.',
		},
		{
			id: '2',
			user: {
				name: 'Dr. Lisa Martinez',
				image: '/placeholder.svg?height=40&width=40',
			},
			rating: 4,
			date: '2023-03-22',
			content:
				'Excellent curriculum with great attention to detail, especially in facial anatomy and injection techniques. The business modules were particularly helpful for setting up my new aesthetic practice.',
		},
		{
			id: '3',
			user: {
				name: 'Dr. Robert Thompson',
				image: '/placeholder.svg?height=40&width=40',
			},
			rating: 5,
			date: '2023-02-10',
			content:
				'The access to industry experts and the ability to ask questions during live sessions makes this program stand out. I especially appreciated the focus on complication management and safety protocols.',
		},
	],
	faqs: [
		{
			question: 'Is this program fully online or are there in-person components?',
			answer:
				'The program is primarily online, with video lessons, interactive assignments, and live virtual sessions. There are optional in-person workshops offered quarterly in major cities, but these are not required to complete the program.',
		},
		{
			question: 'How much time should I expect to commit each week?',
			answer:
				'We recommend allocating 5-7 hours per week to get the most out of the program. This includes watching video lessons, completing assignments, and participating in live sessions.',
		},
		{
			question: 'Will I receive a certificate upon completion?',
			answer:
				'Yes, you will receive a Certificate of Completion for the entire program, as well as individual certificates for each module. These are widely recognized in the industry, but please check with your local regulatory authorities regarding specific credentials for practice.',
		},
		{
			question: 'Can I get hands-on practice through this program?',
			answer:
				'The optional in-person workshops provide supervised hands-on practice. Additionally, we offer guidance on setting up preceptorships in your area for more direct practical experience.',
		},
		{
			question: "Is there a refund policy if I'm not satisfied?",
			answer:
				'Yes, we offer a 14-day money-back guarantee from the start of the program. After this period, you may still cancel your subscription at any time, but previous payments are non-refundable.',
		},
	],
};

export default function ProgramDetailPage({ params: _params }: { params: { id: string } }) {
	const [selectedPricing, setSelectedPricing] = useState('monthly');
	const handleEnroll = () => {
		toast.success('Enrollment successful. You have been enrolled in the program.');
	};

	return (
		<div className="container py-10">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
				<div className="lg:col-span-2">
					<div className="space-y-4">
						<div className="flex flex-wrap gap-2">
							{programData.tags.map(tag => (
								<Badge key={tag} variant="secondary">
									{tag}
								</Badge>
							))}
						</div>

						<h1 className="text-3xl font-bold">{programData.title}</h1>
						<p className="text-xl text-muted-foreground">{programData.description}</p>

						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent text-accent-foreground">
								<Clock className="h-5 w-5 mb-1" />
								<span className="text-sm font-medium">{programData.duration}</span>
								<span className="text-xs text-accent-foreground/80">Duration</span>
							</div>
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent text-accent-foreground">
								<Check className="h-5 w-5 mb-1" />
								<span className="text-sm font-medium">{programData.courses} Courses</span>
								<span className="text-xs text-accent-foreground/80">Included</span>
							</div>
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent text-accent-foreground">
								<Users className="h-5 w-5 mb-1" />
								<span className="text-sm font-medium">{programData.students}+ Students</span>
								<span className="text-xs text-accent-foreground/80">Enrolled</span>
							</div>
						</div>

						<div className="relative w-full rounded-lg aspect-video mt-6 overflow-hidden">
							<Image
								src={programData.image || '/placeholder.svg'}
								alt={programData.title}
								fill
								className="object-cover"
							/>
						</div>
					</div>
				</div>

				<div>
					<Card className="sticky top-20">
						<CardHeader>
							<CardTitle>Program Enrollment</CardTitle>
							<CardDescription>Choose your preferred subscription plan</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<RadioGroup value={selectedPricing} onValueChange={setSelectedPricing} className="space-y-3 group">
								<div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent group-hover:text-accent-foreground">
									<RadioGroupItem value="monthly" id="monthly" />
									<Label htmlFor="monthly" className="flex flex-1 justify-between cursor-pointer">
										<span>Monthly</span>
										<span className="font-bold">${programData.pricing.monthly}/mo</span>
									</Label>
								</div>
								<div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent group-hover:text-accent-foreground relative overflow-hidden">
									<RadioGroupItem value="yearly" id="yearly" />
									<Label htmlFor="yearly" className="flex flex-1 items-center justify-between cursor-pointer">
										<span>Annual</span>
										<div>
											<span className="font-bold">${programData.pricing.yearly}/yr</span>
											<span className="block text-xs text-green-600">
												Save ${programData.pricing.monthly * 12 - programData.pricing.yearly}
											</span>
										</div>
									</Label>
									<div className="absolute -right-8 top-0 bg-green-600 text-white text-xs font-bold py-1 px-6 rotate-45 translate-y-2">
										Best Value
									</div>
								</div>
								<div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground">
									<RadioGroupItem value="lifetime" id="lifetime" />
									<Label htmlFor="lifetime" className="flex flex-1 justify-between cursor-pointer">
										<span>Lifetime Access</span>
										<span className="font-bold">${programData.pricing.lifetime}</span>
									</Label>
								</div>
							</RadioGroup>

							<Button className="w-full" size="lg" onClick={handleEnroll}>
								Enroll Now
							</Button>

							<p className="text-xs text-center text-muted-foreground">14-day money-back guarantee. Cancel anytime.</p>

							<Separator />

							<div className="space-y-2">
								<h3 className="font-medium">This program includes:</h3>
								<ul className="space-y-2">
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										{programData.courses} comprehensive courses
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										40+ hours of video content
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Live Q&A sessions with instructors
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Downloadable resources and templates
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Certificate of completion
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Access to exclusive community
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="mb-6 w-full justify-start">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="curriculum">Curriculum</TabsTrigger>
					<TabsTrigger value="instructors">Instructors</TabsTrigger>
					<TabsTrigger value="reviews">Reviews</TabsTrigger>
					<TabsTrigger value="faqs">FAQs</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="prose max-w-none">
						<h2>About This Program</h2>
						<p className="whitespace-pre-line">{programData.longDescription}</p>

						<h2>What You Will Learn</h2>
						<ul>
							{programData.whatYouWillLearn.map((item, index) => (
								<li key={index}>{item}</li>
							))}
						</ul>

						<h2>Requirements</h2>
						<ul>
							{programData.requirements.map((item, index) => (
								<li key={index}>{item}</li>
							))}
						</ul>
					</div>
				</TabsContent>

				<TabsContent value="curriculum" className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">Program Curriculum</h2>

					<div className="space-y-4">
						{programData.curriculum.map((section, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle>{section.title}</CardTitle>
									<CardDescription>
										{section.lessons.length} lessons •{' '}
										{section.lessons.reduce((total, lesson) => {
											const time = lesson.duration.split(' ');
											let minutes = 0;
											if (time[1] === 'min') minutes = Number.parseInt(time[0]);
											if (time[1] === 'hrs' || time[1] === 'hr') minutes = Number.parseInt(time[0]) * 60;
											return total + minutes;
										}, 0) / 60}{' '}
										hours total
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{section.lessons.map((lesson, lessonIndex) => (
											<div
												key={lessonIndex}
												className="flex justify-between items-center p-3 rounded-lg group hover:bg-accent hover:text-accent-foreground"
											>
												<div className="flex items-center">
													{lesson.type === 'video' && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="h-4 w-4 mr-3 text-primary"
														>
															<polygon points="5 3 19 12 5 21 5 3" />
														</svg>
													)}
													{lesson.type === 'quiz' && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="h-4 w-4 mr-3 text-primary"
														>
															<circle cx="12" cy="12" r="10" />
															<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
															<path d="M12 17h.01" />
														</svg>
													)}
													{lesson.type === 'assignment' && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="h-4 w-4 mr-3 text-primary"
														>
															<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
															<polyline points="14 2 14 8 20 8" />
														</svg>
													)}
													{lesson.type === 'workshop' && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className="h-4 w-4 mr-3 text-primary"
														>
															<path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
															<path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
															<path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
															<path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
														</svg>
													)}
													<span>{lesson.title}</span>
												</div>
												<div className="flex items-center ">
													<Badge
														variant="outline"
														className="border-current group-hover:text-accent-foreground group-hover:border-accent-foreground"
													>
														{lesson.type}
													</Badge>
													<span className="ml-4 text-sm text-muted-foreground">{lesson.duration}</span>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="instructors" className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">Meet Your Instructors</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{programData.instructors.map(instructor => (
							<Card key={instructor.id}>
								<CardContent className="pt-6">
									<div className="flex flex-col items-center text-center">
										<Avatar className="h-24 w-24 mb-4">
											<AvatarImage src={instructor.image || '/placeholder.svg'} alt={instructor.name} />
											<AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
										</Avatar>
										<h3 className="text-xl font-bold">{instructor.name}</h3>
										<p className="text-sm text-muted-foreground mb-4">{instructor.title}</p>
										<p className="text-sm">{instructor.bio}</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="reviews" className="space-y-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
						<h2 className="text-2xl font-bold">Student Reviews</h2>
						<div className="flex items-center gap-2">
							<div className="flex">
								{[1, 2, 3, 4, 5].map(star => (
									<svg
										key={star}
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-5 w-5 text-yellow-500"
									>
										<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
									</svg>
								))}
							</div>
							<span className="font-medium">4.8 out of 5</span>
							<span className="text-muted-foreground">({programData.reviews.length} reviews)</span>
						</div>
					</div>

					<div className="space-y-6">
						{programData.reviews.map(review => (
							<Card key={review.id}>
								<CardContent className="p-6">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarImage src={review.user.image || '/placeholder.svg'} alt={review.user.name} />
												<AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{review.user.name}</p>
												<p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
											</div>
										</div>
										<div className="flex">
											{[1, 2, 3, 4, 5].map(star => (
												<svg
													key={star}
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill={star <= review.rating ? 'currentColor' : 'none'}
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="h-4 w-4 text-yellow-500"
												>
													<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
												</svg>
											))}
										</div>
									</div>

									<p className="mt-4">{review.content}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="faqs" className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>

					<div className="space-y-4">
						{programData.faqs.map((faq, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="text-lg">{faq.question}</CardTitle>
								</CardHeader>
								<CardContent>
									<p>{faq.answer}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
