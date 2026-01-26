"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface GenericFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  onSubmit(data: T): Promise<{ success: boolean; error?: string; data?: unknown }>;
  defaultValues?: Partial<T>;
  children(form: UseFormReturn<T>): React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?(): void;
  className?: string;
}

export function GenericForm<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  className,
}: GenericFormProps<T>) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as never,
  });

  const handleSubmit = (data: T) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success("Success!");
        form.reset();
      } else {
        toast.error(result.error ?? "An error occurred");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}
        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : submitText}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              {cancelText}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
