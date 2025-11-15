import { Award, BookOpen, CheckCircle, FileText } from 'lucide-react';

interface Activity {
	id: number;
	type: 'lesson_completed' | 'quiz_completed' | 'course_started' | 'certificate_earned';
	course: string;
	item?: string;
	score?: string;
	timestamp: string;
}

interface ActivityTimelineProps {
	activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
	const getActivityIcon = (type: Activity['type']) => {
		switch (type) {
			case 'lesson_completed':
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case 'quiz_completed':
				return <FileText className="h-5 w-5 text-blue-500" />;
			case 'course_started':
				return <BookOpen className="h-5 w-5 text-purple-500" />;
			case 'certificate_earned':
				return <Award className="h-5 w-5 text-yellow-500" />;
			default:
				return <CheckCircle className="h-5 w-5 text-gray-500" />;
		}
	};

	const getActivityText = (activity: Activity) => {
		switch (activity.type) {
			case 'lesson_completed':
				return `Completed "${activity.item}" in ${activity.course}`;
			case 'quiz_completed':
				return `Completed quiz "${activity.item}" with ${activity.score} in ${activity.course}`;
			case 'course_started':
				return `Started course "${activity.course}"`;
			case 'certificate_earned':
				return `Earned certificate for "${activity.course}"`;
			default:
				return '';
		}
	};

	return (
		<div className="space-y-4">
			{activities.map(activity => (
				<div key={activity.id} className="flex items-start">
					<div className="mr-4 mt-0.5">{getActivityIcon(activity.type)}</div>
					<div className="space-y-1">
						<p className="text-sm font-medium leading-none">{getActivityText(activity)}</p>
						<p className="text-sm text-muted-foreground">{activity.timestamp}</p>
					</div>
				</div>
			))}
		</div>
	);
}
