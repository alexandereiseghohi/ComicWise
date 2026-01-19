"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useFormContext } from "react-hook-form";

export interface PasswordFieldProps {
  name?: string;
  label?: string;
  disabled?: boolean;
  autoComplete?: string;
  helperText?: string;
}

export function PasswordField({
  name = "password",
  label = "Password",
  disabled = false,
  autoComplete = "current-password",
  helperText,
}: PasswordFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PasswordInput autoComplete={autoComplete} disabled={disabled} {...field} />
          </FormControl>
          <FormMessage />
          {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        </FormItem>
      )}
    />
  );
}
