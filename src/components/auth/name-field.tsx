"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export interface NameFieldProps {
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function NameField({
  name = "name",
  label = "Name",
  placeholder = "Enter your name",
  disabled = false,
  autoComplete = "name",
}: NameFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
