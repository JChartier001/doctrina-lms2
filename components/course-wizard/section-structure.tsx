import { CreateCourseWizardType } from '@/schema/CourseWizardSchema';
import { useFormContext, useFieldArray } from 'react-hook-form';

const SectionStructure = () => {
	const { control } = useFormContext<CreateCourseWizardType>();
	const {
		fields: sectionFields,
		append: sectionAppend,
		remove: sectionRemove,
	} = useFieldArray({
		control,
		name: 'sections',
	});

	return <div></div>;
};
export default SectionStructure;
