import { Calendar, CheckCircle, Edit, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Goal {
	id: number;
	title: string;
	progress: number;
	dueDate: string;
}

interface LearningGoalsProps {
	goals: Goal[];
}

export function LearningGoals({ goals }: LearningGoalsProps) {
	return (
		<div className="space-y-6">
			{goals.map(goal => (
				<div key={goal.id} className="space-y-3">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="font-medium">{goal.title}</h3>
							<div className="flex items-center text-sm text-muted-foreground mt-1">
								<Calendar className="h-3 w-3 mr-1" />
								<span>Due: {goal.dueDate}</span>
							</div>
						</div>
						<div className="flex space-x-1">
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Edit className="h-4 w-4" />
							</Button>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Trash className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<Progress value={goal.progress} className="h-2" />

					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">{goal.progress}% complete</span>
						{goal.progress === 100 && (
							<span className="flex items-center text-sm text-green-600">
								<CheckCircle className="h-3 w-3 mr-1" />
								Completed
							</span>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
