import { CreateCourseWizardType } from '@/schema/CourseWizardSchema';
import { useFormContext, useFieldArray } from 'react-hook-form';

const LessonStructure = ({ index }: { index: number }) => {
	const { control } = useFormContext<CreateCourseWizardType>();
	const {
		fields: lessonFields,
		append: lessonAppend,
		remove: lessonRemove,
	} = useFieldArray({
		control,
		name: `sections.${index}.lessons`,
	});

	return <div></div>;
};
export default LessonStructure;
