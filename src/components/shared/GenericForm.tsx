'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { type z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface GenericFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string; data?: unknown }>;
  defaultValues?: Partial<T>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
}

export function GenericForm<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  className,
}: GenericFormProps<T>) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as never,
  });

  const handleSubmit = (data: T) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success('Success!');
        form.reset();
      } else {
        toast.error(result.error || 'An error occurred');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}
        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : submitText}
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
