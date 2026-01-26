"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Path } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "switch"
  | "date"
  | "file";

export interface FormFieldConfig<T extends z.ZodTypeAny> {
  name: keyof z.infer<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  required?: boolean;
}

interface BaseFormProps<T extends z.ZodTypeAny> {
  schema: T;
  fields: FormFieldConfig<T>[];
  defaultValues: Partial<z.infer<T>>;
  onSubmit(values: z.infer<T>): Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function BaseForm<T extends z.ZodType<any, any, any>>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitLabel = "Submit",
  isLoading = false,
  className = "",
}: Readonly<BaseFormProps<T>>) {
  type FormValues = z.infer<T>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as FormValues,
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      toast.success("Submitted successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit");
    }
  };

  const renderField = (field: FormFieldConfig<T>, formInstance: typeof form) => {
    const fieldName = String(field.name) as Path<FormValues>;

    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={String(fieldName)}
            control={formInstance.control as any}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    {...formField}
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            key={String(fieldName)}
            control={formInstance.control as any}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={String(formField.value ?? "")}
                  disabled={field.disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "switch":
        return (
          <FormField
            key={String(fieldName)}
            control={formInstance.control as any}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem
                className={`
                  flex flex-row items-center justify-between rounded-lg border
                  p-4
                `}
              >
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{field.label}</FormLabel>
                  {field.description && <FormDescription>{field.description}</FormDescription>}
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(formField.value)}
                    onCheckedChange={formField.onChange}
                    disabled={field.disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={String(fieldName)}
            control={formInstance.control as any}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    {...formField}
                    value={formField.value as number}
                    onChange={(e) => formField.onChange(Number.parseFloat(e.target.value) ?? 0)}
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={String(fieldName)}
            control={formInstance.control as any}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    {...formField}
                    value={formField.value as string}
                  />
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={`
          space-y-6
          ${className}
        `}
      >
        {fields.map((field) => renderField(field, form))}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
