---
name: shadcn-form-skill
description: Add a shadcn/ui form with React Hook Form and Zod validation to the Signal Lab frontend. Use when adding a new form, input UI, or mutation-driven interaction to the frontend.
---

# shadcn Form Skill

Scaffold a complete form using React Hook Form + Zod + shadcn/ui components.

## When to Use
- Adding a new form to the frontend
- Adding user input that calls a mutation
- Asked to "add form", "create input UI", "add mutation"

## Checklist
- [ ] Zod schema defines all fields and validation
- [ ] `useForm` with `zodResolver`
- [ ] `useMutation` from TanStack Query
- [ ] shadcn components: Input, Label, Button, Select (as needed)
- [ ] Loading state on submit button
- [ ] Toast on success and error
- [ ] `queryClient.invalidateQueries` on success

## Template

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { myApi } from "@/lib/api";

// 1. Define schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["a", "b", "c"]),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 2. Form setup
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // 3. Mutation
  const mutation = useMutation({
    mutationFn: myApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-data"] });
      toast({ title: "Created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>My Form</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## For Select fields

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const { setValue, watch } = useForm<FormValues>({ ... });
const selectedValue = watch("type");

<Select value={selectedValue} onValueChange={(v) => setValue("type", v as FormValues["type"])}>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
  </SelectContent>
</Select>
```
