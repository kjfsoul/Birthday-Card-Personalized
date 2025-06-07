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
  relationshipRole: z.string().min(1, "Please tell us your relationship"),
  personality: z.string().min(1, "Please describe their personality"),
  quirks: z.string().optional(),
  includeImage: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface GeneratedMessage {
  id: number;
  content: string;
  imageUrl?: string;
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
      relationshipRole: "",
      personality: "",
      quirks: "",
      includeImage: false,
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

        {/* Relationship Role Input */}
        <div className="space-y-2">
          <Label htmlFor="relationshipRole" className="text-sm font-semibold text-gray-700">
            They are my... 👥
          </Label>
          <Input
            id="relationshipRole"
            placeholder="e.g., sister, best friend, coworker, mom"
            className="px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all duration-200 text-base"
            {...form.register("relationshipRole")}
          />
          {form.formState.errors.relationshipRole && (
            <p className="text-sm text-red-500">{form.formState.errors.relationshipRole.message}</p>
          )}
        </div>

        {/* Personality Input */}
        <div className="space-y-2">
          <Label htmlFor="personality" className="text-sm font-semibold text-gray-700">
            Their personality 🌟
          </Label>
          <Input
            id="personality"
            placeholder="e.g., bubbly, sarcastic, adventurous, coffee-obsessed"
            className="px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all duration-200 text-base"
            {...form.register("personality")}
          />
          {form.formState.errors.personality && (
            <p className="text-sm text-red-500">{form.formState.errors.personality.message}</p>
          )}
        </div>

        {/* Quirks Input */}
        <div className="space-y-2">
          <Label htmlFor="quirks" className="text-sm font-semibold text-gray-700">
            Their weird quirks (optional) 🤪
          </Label>
          <Input
            id="quirks"
            placeholder="e.g., talks to plants, collects rubber ducks, terrible at parallel parking"
            className="px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all duration-200 text-base"
            {...form.register("quirks")}
          />
        </div>

        {/* Include Image Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <input
            type="checkbox"
            id="includeImage"
            className="w-5 h-5 text-primary rounded focus:ring-primary"
            {...form.register("includeImage")}
          />
          <Label htmlFor="includeImage" className="text-sm font-semibold text-gray-700 cursor-pointer">
            Generate a free birthday image 🎨
          </Label>
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
