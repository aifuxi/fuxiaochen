"use client";

import { Field } from "@base-ui/react/field";
import { Search } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  label: string;
  name: string;
  description?: string;
  error?: string;
  placeholder?: string;
  defaultValue?: string;
  leadingSearch?: boolean;
};

export function TextField({
  defaultValue,
  description,
  error,
  label,
  leadingSearch,
  name,
  placeholder,
}: TextFieldProps) {
  return (
    <Field.Root name={name} className="space-y-2">
      <Field.Label className="type-label text-foreground">{label}</Field.Label>
      <Field.Control
        render={
          <Input
            defaultValue={defaultValue}
            placeholder={placeholder}
            startAdornment={leadingSearch ? <Search className="size-4" /> : undefined}
          />
        }
      />
      {description ? <Field.Description className="text-xs text-muted">{description}</Field.Description> : null}
      {error ? <Field.Error className="text-xs text-red-300">{error}</Field.Error> : null}
    </Field.Root>
  );
}

type TextareaFieldProps = {
  label: string;
  name: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
};

export function TextareaField({ defaultValue, description, label, name, placeholder }: TextareaFieldProps) {
  return (
    <Field.Root name={name} className="space-y-2">
      <Field.Label className="type-label text-foreground">{label}</Field.Label>
      <Field.Control render={<Textarea defaultValue={defaultValue} placeholder={placeholder} />} />
      {description ? <Field.Description className={cn("text-xs text-muted")}>{description}</Field.Description> : null}
    </Field.Root>
  );
}
