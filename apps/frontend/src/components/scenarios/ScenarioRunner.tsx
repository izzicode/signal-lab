"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { scenariosApi, type ScenarioType } from "@/lib/api";
import axios from "axios";

const schema = z.object({
  type: z.enum(["success", "validation_error", "system_error", "slow_request", "teapot"]),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  success: "Success — normal flow",
  validation_error: "Validation Error — 400",
  system_error: "System Error — 500",
  slow_request: "Slow Request — 2–5s delay",
  teapot: "🫖 Teapot — 418 (easter egg)",
};

export function ScenarioRunner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "success" },
  });

  const selectedType = watch("type");

  const mutation = useMutation({
    mutationFn: scenariosApi.run,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
      if (data.signal === 42) {
        toast({
          title: "🫖 I'm a teapot",
          description: `Signal 42 detected. ID: ${data.id}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Scenario completed",
          description: `ID: ${data.id} · Duration: ${data.duration}ms`,
          variant: "success" as never,
        });
      }
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
      let message = "Unknown error";
      if (axios.isAxiosError(error)) {
        const raw = error.response?.data?.message;
        if (typeof raw === "string") {
          message = raw;
        } else if (Array.isArray(raw)) {
          message = raw.join(", ");
        } else if (raw && typeof raw === "object") {
          message = (raw as Record<string, unknown>).message as string ?? JSON.stringify(raw);
        } else {
          message = error.message;
        }
      }
      toast({
        title: "Scenario failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ type: values.type as ScenarioType, name: values.name });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Run Scenario
        </CardTitle>
        <CardDescription>
          Trigger observability signals: metrics, logs, errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Scenario Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as ScenarioType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select scenario type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SCENARIO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Run Name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g. load test #1"
              {...register("name")}
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Scenario
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
