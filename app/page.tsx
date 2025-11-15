'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Award, BookOpen, CheckCircle2, GraduationCap, Sparkles, TrendingUp, Users, Video, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SparklesCore } from '@/components/ui/sparkles';
import { useAuth } from '@/lib/auth';

export default function HomePage(): React.ReactElement {
	const { user } = useAuth();
	const router = useRouter();

	// Redirect to dashboard if already logged in
	useEffect(() => {
		if (user) {
			router.push('/dashboard');
		}
	}, [user, router]);

	// If already logged in, show loading while redirecting
	if (user) {
		return <div className="container py-10">Redirecting to dashboard...</div>;
	}

	return (
		<div className="flex flex-col">
			{/* Hero Section with Sparkles */}
			<section className="relative min-h-[600px] lg:min-h-[700px] w-full bg-background flex flex-col items-center justify-center overflow-hidden">
				<div className="w-full absolute inset-0 h-full">
					<SparklesCore
						id="tsparticlesfullpage"
						background="transparent"
						minSize={0.6}
						maxSize={2}
						particleDensity={150}
						className="w-full h-full"
						speed={1}
					/>
				</div>

				<div className="relative z-20 max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 mb-6">
						Doctrina
					</h1>
					<p className="text-xl md:text-2xl lg:text-3xl text-foreground/80 mb-4 max-w-3xl mx-auto">
						Master Medical Aesthetics
					</p>
					<p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
						The premier educational platform connecting expert instructors with aspiring medical aesthetics
						professionals
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button size="lg" className="text-lg px-8 py-6" asChild>
							<SignUpButton>
								<span className="flex items-center gap-2">
									<Sparkles className="h-5 w-5" />
									Start Learning
								</span>
							</SignUpButton>
						</Button>
						<Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
							<SignInButton>Log In</SignInButton>
						</Button>
					</div>
				</div>

				{/* Gradient overlay to smooth edges */}
				<div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			</section>

			{/* For Students Section */}
			<section className="py-20 bg-background">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4">For Students</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Transform your career with expert-led courses and hands-on training
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<GraduationCap className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Expert-Led Courses</CardTitle>
								<CardDescription>
									Learn from industry-leading practitioners with years of real-world experience in medical aesthetics
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<Video className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Live Training Sessions</CardTitle>
								<CardDescription>
									Participate in interactive live sessions with Q&A and real-time feedback from instructors
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<Award className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Industry Certifications</CardTitle>
								<CardDescription>
									Earn recognized certifications that validate your skills and advance your professional career
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<BookOpen className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Comprehensive Library</CardTitle>
								<CardDescription>
									Access a vast collection of resources, guides, and reference materials anytime, anywhere
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<Users className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Community Support</CardTitle>
								<CardDescription>
									Connect with peers, share experiences, and grow together in our vibrant learning community
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="border-2 hover:border-primary transition-colors">
							<CardHeader>
								<TrendingUp className="h-12 w-12 mb-4 text-primary" />
								<CardTitle>Track Your Progress</CardTitle>
								<CardDescription>
									Monitor your learning journey with detailed analytics and personalized recommendations
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* For Instructors Section */}
			<section className="py-20 bg-muted/50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4">For Instructors</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Share your expertise and build a thriving educational business
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
						<div className="space-y-8">
							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<CheckCircle2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2">Easy Course Creation</h3>
									<p className="text-muted-foreground">
										AI-powered tools help you create engaging courses quickly with quizzes, assessments, and multimedia
										content
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<CheckCircle2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2">Live Session Management</h3>
									<p className="text-muted-foreground">
										Host live training sessions, workshops, and Q&A sessions with integrated video conferencing
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<CheckCircle2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2">Comprehensive Analytics</h3>
									<p className="text-muted-foreground">
										Track student engagement, performance, and course effectiveness with detailed analytics dashboards
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<CheckCircle2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2">Seamless Payments</h3>
									<p className="text-muted-foreground">
										Integrated payment processing and automated payouts make monetizing your expertise effortless
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex-shrink-0">
									<CheckCircle2 className="h-8 w-8 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2">Certificate Management</h3>
									<p className="text-muted-foreground">
										Automatically issue professional certificates to students who complete your courses
									</p>
								</div>
							</div>
						</div>

						<Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
							<CardHeader className="pb-6">
								<CardTitle className="text-2xl">Start Teaching Today</CardTitle>
								<CardDescription className="text-base">
									Join hundreds of instructors building successful educational businesses on Doctrina
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-3">
									<Zap className="h-5 w-5 text-primary" />
									<span>No upfront costs</span>
								</div>
								<div className="flex items-center gap-3">
									<Zap className="h-5 w-5 text-primary" />
									<span>Keep 85% of your earnings</span>
								</div>
								<div className="flex items-center gap-3">
									<Zap className="h-5 w-5 text-primary" />
									<span>Reach thousands of students</span>
								</div>
								<div className="flex items-center gap-3">
									<Zap className="h-5 w-5 text-primary" />
									<span>24/7 instructor support</span>
								</div>
								<Button className="w-full mt-6" size="lg" asChild>
									<SignUpButton>
										<span className="flex items-center gap-2">Start Teaching</span>
									</SignUpButton>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 bg-background">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Start your journey in three simple steps</p>
					</div>

					<div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
								1
							</div>
							<h3 className="text-2xl font-bold">Sign Up & Explore</h3>
							<p className="text-muted-foreground">
								Create your free account and browse through hundreds of courses from expert instructors. Find the
								perfect program that matches your goals.
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
								2
							</div>
							<h3 className="text-2xl font-bold">Learn & Practice</h3>
							<p className="text-muted-foreground">
								Engage with interactive video lessons, hands-on exercises, and live training sessions. Get real-time
								feedback from industry experts.
							</p>
						</div>

						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
								3
							</div>
							<h3 className="text-2xl font-bold">Get Certified</h3>
							<p className="text-muted-foreground">
								Complete your coursework, pass the assessments, and earn industry-recognized certifications to advance
								your career.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-muted/50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Community Says</h2>
						<p className="text-xl text-muted-foreground">Real stories from students and instructors</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
						<Card className="border-2">
							<CardContent className="pt-6">
								<div className="flex items-center gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<Sparkles key={i} className="h-4 w-4 fill-primary text-primary" />
									))}
								</div>
								<p className="text-muted-foreground mb-4 italic">
									"Doctrina transformed my career. The expert-led courses gave me the confidence and skills I needed to
									start my own practice. The certification program is recognized everywhere!"
								</p>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
										SM
									</div>
									<div>
										<div className="font-semibold">Sarah Mitchell</div>
										<div className="text-sm text-muted-foreground">Aesthetic Practitioner</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2">
							<CardContent className="pt-6">
								<div className="flex items-center gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<Sparkles key={i} className="h-4 w-4 fill-primary text-primary" />
									))}
								</div>
								<p className="text-muted-foreground mb-4 italic">
									"As an instructor, Doctrina has allowed me to reach thousands of students globally. The platform makes
									course creation seamless, and the analytics help me improve constantly."
								</p>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
										DR
									</div>
									<div>
										<div className="font-semibold">Dr. Rachel Kim</div>
										<div className="text-sm text-muted-foreground">Course Instructor</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2">
							<CardContent className="pt-6">
								<div className="flex items-center gap-1 mb-4">
									{[...Array(5)].map((_, i) => (
										<Sparkles key={i} className="h-4 w-4 fill-primary text-primary" />
									))}
								</div>
								<p className="text-muted-foreground mb-4 italic">
									"The live training sessions are incredible. Being able to ask questions in real-time and get
									personalized feedback from experts has accelerated my learning exponentially."
								</p>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
										JM
									</div>
									<div>
										<div className="font-semibold">James Martinez</div>
										<div className="text-sm text-muted-foreground">Medical Student</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Social Proof Section */}
			<section className="py-20 bg-background">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Professionals</h2>
						<p className="text-xl text-muted-foreground">
							Join thousands of medical aesthetics professionals worldwide
						</p>
					</div>

					<div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
						<div>
							<div className="text-4xl font-bold text-primary mb-2">10K+</div>
							<div className="text-muted-foreground">Active Students</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-primary mb-2">500+</div>
							<div className="text-muted-foreground">Expert Instructors</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-primary mb-2">1,200+</div>
							<div className="text-muted-foreground">Courses Available</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-primary mb-2">98%</div>
							<div className="text-muted-foreground">Satisfaction Rate</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-muted/50">
				<div className="container mx-auto px-4">
					<Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
						<CardContent className="p-12 text-center">
							<h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
							<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
								Join Doctrina today and start your journey towards becoming a certified medical aesthetics professional
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button size="lg" className="text-lg px-8" asChild>
									<SignUpButton>Get Started Free</SignUpButton>
								</Button>
								<Button size="lg" variant="outline" className="text-lg px-8" asChild>
									<Link href="/courses">Browse Courses</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
