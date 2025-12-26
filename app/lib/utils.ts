import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState } from "react"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Convert FormData to object for Zod parsing.
 * Use arrayFields to specify which fields should use getAll() instead of get().
 */
export function formDataToObject(
  formData: FormData,
  arrayFields: string[] = []
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    obj[key] = arrayFields.includes(key)
      ? formData.getAll(key)
      : formData.get(key);
  }
  return obj;
}

type FieldErrors = Record<string, string[] | undefined>;

/**
 * Detect array fields from a Zod object schema.
 */
function getArrayFields(schema: z.ZodType): string[] {
  if (!(schema instanceof z.ZodObject)) return [];
  const shape = schema.shape as Record<string, z.ZodType>;
  return Object.entries(shape)
    .filter(([, field]) => field instanceof z.ZodArray)
    .map(([key]) => key);
}

/**
 * Parse FormData with a Zod schema. Automatically handles array fields.
 */
export function parseForm<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  formData: FormData
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  const arrayFields = getArrayFields(schema);
  return schema.safeParse(formDataToObject(formData, arrayFields));
}

/**
 * Client-side form validation hook. Validates on submit, blocks if invalid.
 * Falls back to server validation when JS is disabled.
 */
export function useFormValidation<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  serverErrors?: FieldErrors
) {
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const result = parseForm(schema, formData);
    if (!result.success) {
      e.preventDefault();
      setClientErrors(result.error.flatten().fieldErrors);
    } else {
      setClientErrors({});
    }
  };

  return {
    onSubmit,
    errors: { ...serverErrors, ...clientErrors } as FieldErrors,
  };
}
