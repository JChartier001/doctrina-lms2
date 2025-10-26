'use client';

import { Edit, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { generateQuizQuestions } from '@/app/actions/generate-quiz';
import type { QuizQuestion } from '@/app/instructor/courses/wizard/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

interface AIQuizGeneratorProps {
	onAddQuestions: (questions: QuizQuestion[]) => void;
	existingContent?: string;
}

export function AIQuizGenerator({ onAddQuestions, existingContent = '' }: AIQuizGeneratorProps) {
	const [content, setContent] = useState(existingContent);
	const [questionCount, setQuestionCount] = useState(5);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
	const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

	// Generate questions using AI
	const handleGenerate = async () => {
		if (!content.trim()) {
			toast.error('Content required. Please provide some content to generate questions from.');
			return;
		}

		setIsGenerating(true);
		try {
			const questions = await generateQuizQuestions(content, questionCount);
			setGeneratedQuestions(questions);
			toast.success('Questions generated. Successfully generated ${questions.length} questions.');
		} catch (_error) {
			toast.error('Generation failed. Failed to generate questions. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	// Add all generated questions to the quiz
	const handleAddAll = () => {
		onAddQuestions(generatedQuestions);
		toast.success('Questions added. Added ${generatedQuestions.length} questions to your quiz.');
		setGeneratedQuestions([]);
	};

	// Add a single question to the quiz
	const handleAddQuestion = (question: QuizQuestion) => {
		onAddQuestions([question]);
		setGeneratedQuestions(generatedQuestions.filter(q => q.id !== question.id));
		toast.success('Question added. Added 1 question to your quiz.');
	};

	// Remove a question from the generated list
	const handleRemoveQuestion = (questionId: string) => {
		setGeneratedQuestions(generatedQuestions.filter(q => q.id !== questionId));
	};

	// Start editing a question
	const handleEditQuestion = (question: QuizQuestion) => {
		setEditingQuestion({ ...question });
	};

	// Save edited question
	const handleSaveEdit = () => {
		if (!editingQuestion) return;

		setGeneratedQuestions(generatedQuestions.map(q => (q.id === editingQuestion.id ? editingQuestion : q)));
		setEditingQuestion(null);
	};

	// Update option text
	const handleUpdateOption = (index: number, value: string) => {
		if (!editingQuestion) return;

		const newOptions = [...editingQuestion.options];
		newOptions[index] = value;
		setEditingQuestion({ ...editingQuestion, options: newOptions });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary" />
						AI Quiz Generator
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="content">Content for Question Generation</Label>
						<Textarea
							id="content"
							placeholder="Paste your lesson content here to generate questions..."
							value={content}
							onChange={e => setContent(e.target.value)}
							rows={6}
							className="resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							The AI will analyze this content to create relevant quiz questions.
						</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between">
							<Label htmlFor="questionCount">Number of Questions</Label>
							<span className="text-sm">{questionCount}</span>
						</div>
						<Slider
							id="questionCount"
							min={1}
							max={10}
							step={1}
							value={[questionCount]}
							onValueChange={value => setQuestionCount(value[0])}
						/>
					</div>

					<Button onClick={handleGenerate} disabled={isGenerating || !content.trim()} className="w-full">
						{isGenerating ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Sparkles className="mr-2 h-4 w-4" />
								Generate Questions
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{generatedQuestions.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Generated Questions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{generatedQuestions.map((question, qIndex) => (
							<Card key={question.id} className="border">
								{editingQuestion && editingQuestion.id === question.id ? (
									<CardContent className="p-4 space-y-4">
										<div className="space-y-2">
											<Label htmlFor={`edit-question-${question.id}`}>Question</Label>
											<Textarea
												id={`edit-question-${question.id}`}
												value={editingQuestion.question}
												onChange={e =>
													setEditingQuestion({
														...editingQuestion,
														question: e.target.value,
													})
												}
												rows={2}
											/>
										</div>

										<div className="space-y-2">
											<Label>Options</Label>
											{editingQuestion.options.map((option, oIndex) => (
												<div key={oIndex} className="flex items-center gap-2 mb-2">
													<RadioGroupItem
														value={String(oIndex)}
														id={`option-${question.id}-${oIndex}`}
														checked={editingQuestion.correctOption === oIndex}
														onClick={() =>
															setEditingQuestion({
																...editingQuestion,
																correctOption: oIndex,
															})
														}
													/>
													<Input
														value={option}
														onChange={e => handleUpdateOption(oIndex, e.target.value)}
														placeholder={`Option ${oIndex + 1}`}
													/>
												</div>
											))}
											<p className="text-xs text-muted-foreground">
												Select the radio button next to the correct answer.
											</p>
										</div>

										<div className="flex justify-end gap-2">
											<Button variant="outline" size="sm" onClick={() => setEditingQuestion(null)}>
												Cancel
											</Button>
											<Button size="sm" onClick={handleSaveEdit}>
												Save Changes
											</Button>
										</div>
									</CardContent>
								) : (
									<CardContent className="p-4">
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium">Question {qIndex + 1}</h4>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleEditQuestion(question)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive"
													onClick={() => handleRemoveQuestion(question.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<p className="mb-2">{question.question}</p>
										<div className="space-y-1 pl-4">
											{question.options.map((option, oIndex) => (
												<div
													key={oIndex}
													className={`p-2 rounded-md ${
														oIndex === question.correctOption ? 'bg-green-100 dark:bg-green-900/20' : ''
													}`}
												>
													{oIndex === question.correctOption && (
														<span className="text-green-600 dark:text-green-400 mr-2">✓</span>
													)}
													{option}
												</div>
											))}
										</div>
										<div className="mt-4 flex justify-end">
											<Button
												size="sm"
												variant="outline"
												className="flex items-center gap-1"
												onClick={() => handleAddQuestion(question)}
											>
												<Plus className="h-3 w-3" />
												Add to Quiz
											</Button>
										</div>
									</CardContent>
								)}
							</Card>
						))}
					</CardContent>
					<CardFooter>
						<Button onClick={handleAddAll} className="w-full" variant="default">
							<Plus className="mr-2 h-4 w-4" />
							Add All Questions to Quiz
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
}
