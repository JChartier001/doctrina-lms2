'use client';

import { Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CourseProps {
	id: string;
	title: string;
	progress: number;
	lastAccessed: string;
	nextLesson: string;
	totalLessons: number;
	completedLessons: number;
	estimatedCompletion: string;
	instructor: string;
}

interface CourseProgressCardProps {
	course: CourseProps;
	detailed?: boolean;
}

export function CourseProgressCard({ course, detailed = false }: CourseProgressCardProps) {
	const router = useRouter();

	return (
		<div className="border rounded-lg p-4 space-y-3">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="font-medium">{course.title}</h3>
					<div className="flex items-center text-sm text-muted-foreground mt-1">
						<User className="h-3 w-3 mr-1" />
						<span>{course.instructor}</span>
						<span className="mx-2">•</span>
						<Clock className="h-3 w-3 mr-1" />
						<span>Last accessed: {course.lastAccessed}</span>
					</div>
				</div>
				<span className="text-sm font-medium">{course.progress}%</span>
			</div>

			<Progress value={course.progress} className="h-2" />

			<div className="flex justify-between items-center text-sm">
				<span>
					{course.completedLessons}/{course.totalLessons} lessons completed
				</span>
				<span className="text-muted-foreground">Est. completion: {course.estimatedCompletion}</span>
			</div>

			{detailed && (
				<div className="pt-2">
					<div className="bg-muted p-3 rounded-md mb-3">
						<p className="text-sm font-medium">Next up: {course.nextLesson}</p>
					</div>
					<div className="flex space-x-2">
						<Button variant="default" className="flex-1" onClick={() => router.push(`/courses/${course.id}/learn`)}>
							Continue Learning
						</Button>
						<Button variant="outline" className="flex-1" onClick={() => router.push(`/courses/${course.id}`)}>
							Course Details
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
