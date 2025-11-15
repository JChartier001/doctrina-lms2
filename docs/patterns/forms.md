# Form Pattern

All forms in CareNotes should follow this consistent pattern using React Hook Form with Radix UI components.

## Form Structure

### 1. Setup Form with FormProvider

```tsx
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... }
});

return (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields go here */}
    </form>
  </Form>
);
```

### 2. Form Field Pattern

Every form field MUST use this exact structure:

```tsx
<Controller
	control={control}
	name="fieldName"
	render={({ field, fieldState }) => (
		<FormItem>
			<FormLabel>Field Label</FormLabel>
			<FormControl>
				{/* Input component here */}
				<Input {...field} placeholder="..." />
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

## Component Examples

### Text Input

```tsx
<Controller
	control={control}
	name="firstName"
	render={({ field }) => (
		<FormItem>
			<FormLabel>
				First Name <span className="text-red-500">*</span>
			</FormLabel>
			<FormControl>
				<Input {...field} placeholder="John" />
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

### Select Dropdown

```tsx
<Controller
	control={control}
	name="sizeUnit"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Size Unit</FormLabel>
			<FormControl>
				<Select onValueChange={field.onChange} value={field.value}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a unit" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ACRES">Acres</SelectItem>
						<SelectItem value="SQFT">Square Feet</SelectItem>
					</SelectContent>
				</Select>
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

### Checkbox

**Note:** Checkboxes use a different layout - FormControl wraps the checkbox, and FormLabel goes beside it (not above).

```tsx
<Controller
	control={control}
	name="isActive"
	render={({ field }) => (
		<FormItem className="flex items-center gap-2 space-y-0">
			<FormControl>
				<Checkbox checked={field.value} onCheckedChange={field.onChange} />
			</FormControl>
			<FormLabel className="text-sm font-normal cursor-pointer">Active</FormLabel>
			<FormMessage />
		</FormItem>
	)}
/>
```

**Important for checkboxes:**

- Add `space-y-0` to FormItem to remove default vertical spacing
- Use `text-sm font-normal cursor-pointer` on FormLabel for consistent styling
- Always use `checked` and `onCheckedChange` props

### Textarea

```tsx
<Controller
	control={control}
	name="notes"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Notes</FormLabel>
			<FormControl>
				<Textarea {...field} placeholder="Additional notes..." rows={3} />
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

### Date Input

```tsx
<Controller
	control={control}
	name="orderDate"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Order Date</FormLabel>
			<FormControl>
				<Input type="date" {...field} />
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>
```

## Key Principles

1. **Always use Controller** - Never use `register()` directly with form components
2. **Consistent Structure** - Every field follows the same FormItem > FormLabel > FormControl > FormMessage pattern
3. **Error Handling** - `<FormMessage />` automatically displays validation errors
4. **FormControl Wrapping** - All inputs must be wrapped in `<FormControl>` for proper ARIA attributes
5. **Field Spreading** - Spread `{...field}` onto input components for proper binding

## Required Field Indicators

Use inline red asterisk for required fields:

```tsx
<FormLabel>
	Email <span className="text-red-500">*</span>
</FormLabel>
```

## Helper Text

For additional helper text (optional):

```tsx
<Controller
	control={control}
	name="scheduledTimes"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Scheduled Times</FormLabel>
			<FormControl>
				<Input {...field} placeholder="08:00, 12:00, 18:00" />
			</FormControl>
			<FormDescription>Enter times in 24-hour format (HH:MM), separated by commas</FormDescription>
			<FormMessage />
		</FormItem>
	)}
/>
```

## Dynamic Field Arrays

When using `useFieldArray`, access fields via the returned `fields` array:

```tsx
const { fields, append, remove } = useFieldArray({
	control,
	name: 'medications',
});

{
	fields.map((field, index) => (
		<div key={field.id}>
			<Controller
				control={control}
				name={`medications.${index}.name`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Medication Name</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	));
}
```

## DO NOT

- ❌ Do not use `register()` with UI components
- ❌ Do not use `FormField` wrapper - use `Controller` directly
- ❌ Do not manually handle errors - use `<FormMessage />`
- ❌ Do not forget `FormControl` wrapper around inputs
- ❌ Do not nest FormItem inside other divs unnecessarily
