import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  recipient: z.string().min(1, "Please tell us who the message is for"),
  description: z.string().min(1, "Please describe them in a few words"),
});

type FormData = z.infer<typeof formSchema>;

interface GeneratedMessage {
  id: number;
  content: string;
}

interface MessageGeneratorProps {
  onMessageGenerated: (message: GeneratedMessage) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function MessageGenerator({ onMessageGenerated, onLoadingChange }: MessageGeneratorProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      description: "",
    },
  });

  const generateMessageMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate-message", data);
      return response.json();
    },
    onMutate: () => {
      onLoadingChange(true);
    },
    onSuccess: (data: GeneratedMessage) => {
      onMessageGenerated(data);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to generate message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      onLoadingChange(false);
    },
  });

  const onSubmit = (data: FormData) => {
    generateMessageMutation.mutate(data);
  };

  return (
    <Card className="p-6 shadow-xl border-gray-100">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Recipient Input */}
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-sm font-semibold text-gray-700">
            Who is the message for? 🎯
          </Label>
          <Input
            id="recipient"
            placeholder="e.g., My sister, my boss, my dog"
            className="px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all duration-200 text-base"
            {...form.register("recipient")}
          />
          {form.formState.errors.recipient && (
            <p className="text-sm text-red-500">{form.formState.errors.recipient.message}</p>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
            Describe them in a few words 💭
          </Label>
          <Input
            id="description"
            placeholder="e.g., Loves coffee, funny, a total rockstar"
            className="px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all duration-200 text-base"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Generate Button */}
        <Button 
          type="submit" 
          disabled={generateMessageMutation.isPending}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          {generateMessageMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Creating magic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Message ✨
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
