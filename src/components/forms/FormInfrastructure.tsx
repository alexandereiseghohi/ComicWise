/**
 * Form Infrastructure - Generic Form Components
 *
 * Provides reusable form components with built-in validation, error handling,
 * and consistent styling across the application.
 *
 * Components:
 * - FormField: Wrapper for form fields with label and error message
 * - FormInput: Text input field with validation
 * - FormTextarea: Textarea field with character count
 * - FormSelect: Dropdown field
 * - FormCheckbox: Checkbox field
 * - FormRadio: Radio button group
 * - FormFile: File upload field
 * - SubmitButton: Button with loading state
 */

"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import React, { forwardRef, useState } from "react";
import { useFormStatus } from "react-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   Base Form Field Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component for form fields with label and error handling
 * @param root0
 * @param root0.label
 * @param root0.error
 * @param root0.required
 * @param root0.hint
 * @param root0.children
 * @param root0.className
 */
export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {children}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      )}

      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Text Input Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Text input field with validation and icon support
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, label, required, hint, icon, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} hint={hint}>
        <div className="relative">
          {icon && <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">{icon}</div>}

          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:ring-primary focus:outline-none",
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

/* ═══════════════════════════════════════════════════════════════════════════
   Textarea Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

/**
 * Textarea field with character count
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, label, required, hint, maxLength, showCharCount, className, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <FormField label={label} error={error} required={required} hint={hint}>
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:ring-primary focus:outline-none",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary",
            className
          )}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />

        {showCharCount && maxLength && (
          <div className="text-sm text-gray-500">
            {charCount} / {maxLength} characters
          </div>
        )}
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

/* ═══════════════════════════════════════════════════════════════════════════
   Select Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Select dropdown field
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, label, required, hint, options, placeholder, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} hint={hint}>
        <select
          ref={ref}
          className={cn(
            "w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:ring-primary focus:outline-none",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

FormSelect.displayName = "FormSelect";

/* ═══════════════════════════════════════════════════════════════════════════
   Checkbox Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Checkbox field
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <FormField error={error} hint={hint}>
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "size-4 cursor-pointer rounded-sm border-gray-300 text-primary focus:ring-2 focus:ring-primary",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          {label && <label className="cursor-pointer text-sm text-gray-700">{label}</label>}
        </div>
      </FormField>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

/* ═══════════════════════════════════════════════════════════════════════════
   File Upload Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormFileProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  accept?: string;
  maxSize?: number;
  showPreview?: boolean;
}

/**
 * File upload field with optional preview
 */
export const FormFile = forwardRef<HTMLInputElement, FormFileProps>(
  ({ error, label, required, hint, accept, maxSize, showPreview, className, ...props }, ref) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && showPreview) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }

      props.onChange?.(e);
    };

    return (
      <FormField label={label} error={error} required={required} hint={hint}>
        <div className="space-y-2">
          <input
            ref={ref}
            type="file"
            accept={accept}
            className={cn(
              "w-full rounded-lg border px-3 py-2 transition-colors file:mr-4 file:rounded-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90 focus:ring-2 focus:ring-primary focus:outline-none",
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary",
              className
            )}
            onChange={handleChange}
            {...props}
          />

          {maxSize && (
            <p className="text-xs text-gray-500">
              Maximum file size: {(maxSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}

          {preview && showPreview && (
            <div className="relative h-40 w-full overflow-hidden rounded-sm border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="size-full object-cover" />
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

FormFile.displayName = "FormFile";

/* ═══════════════════════════════════════════════════════════════════════════
   Submit Button Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Submit button with loading state
 * @param root0
 * @param root0.loading
 * @param root0.loadingText
 * @param root0.icon
 * @param root0.children
 * @param root0.className
 * @param root0.disabled
 */
export function SubmitButton({
  loading,
  loadingText = "Submitting...",
  icon,
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isLoading = loading || pending;

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors",
        isLoading || disabled
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Form Container Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormContainerProps {
  children: ReactNode;
  onSubmit(formData: FormData): Promise<void> | void;
  className?: string;
}

/**
 * Form container with consistent styling and spacing
 * @param root0
 * @param root0.children
 * @param root0.onSubmit
 * @param root0.className
 */
export function FormContainer({ children, onSubmit, className }: FormContainerProps) {
  return (
    <form action={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Validation Hooks
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Hook for form field validation
 * @param initialValues
 * @param validators
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: Record<keyof T, (value: any) => string | undefined>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = (name: keyof T, value: any): string | undefined => {
    const validator = validators[name];
    return validator ? validator(value) : undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof T;

    setValues((prev) => ({ ...prev, [key]: value }));

    if (touched[key]) {
      const error = validate(key, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof T;

    setTouched((prev) => ({ ...prev, [key]: true }));
    const error = validate(key, value);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const k = key as keyof T;
      const error = validate(k, values[k]);
      if (error) {
        newErrors[k] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    getFieldProps: (name: keyof T) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
  };
}
