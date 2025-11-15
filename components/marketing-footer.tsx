import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

import { Icons } from '@/components/icons';

export function MarketingFooter(): React.ReactElement {
	return (
		<footer className="border-t bg-muted/50">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link href="/" className="flex items-center space-x-2 mb-4">
							<Icons.logo className="h-6 w-6" />
							<span className="font-bold text-xl">Doctrina</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-4">
							The premier educational platform for medical aesthetics professionals.
						</p>
						<div className="flex gap-4">
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Facebook"
							>
								<Facebook className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Twitter"
							>
								<Twitter className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Instagram"
							>
								<Instagram className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="LinkedIn"
							>
								<Linkedin className="h-5 w-5" />
							</Link>
						</div>
					</div>

					{/* For Students */}
					<div>
						<h3 className="font-semibold mb-4">For Students</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="/courses" className="hover:text-foreground transition-colors">
									Browse Courses
								</Link>
							</li>
							<li>
								<Link href="/programs" className="hover:text-foreground transition-colors">
									Programs
								</Link>
							</li>
							<li>
								<Link href="/live" className="hover:text-foreground transition-colors">
									Live Sessions
								</Link>
							</li>
							<li>
								<Link href="/resources" className="hover:text-foreground transition-colors">
									Resources
								</Link>
							</li>
							<li>
								<Link href="/community" className="hover:text-foreground transition-colors">
									Community
								</Link>
							</li>
						</ul>
					</div>

					{/* For Instructors */}
					<div>
						<h3 className="font-semibold mb-4">For Instructors</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="/signup" className="hover:text-foreground transition-colors">
									Become an Instructor
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Instructor Guide
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Success Stories
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Support
								</Link>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="font-semibold mb-4">Company</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									About Us
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Careers
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Blog
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Contact
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-foreground transition-colors">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t">
					<p className="text-center text-sm text-muted-foreground">
						© {new Date().getFullYear()} Doctrina. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
