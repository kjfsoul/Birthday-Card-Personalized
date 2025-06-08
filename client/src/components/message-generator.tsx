import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Gift, PartyPopper, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  recipientPhone: z.string().optional(),
  recipientGender: z.string().optional(),
  relationshipRole: z.string().min(1, "Relationship is required"),
  personality: z.string().min(1, "Personality is required"),
  quirks: z.string().optional(),
  senderEmail: z.string().email("Valid email required"),
  senderPhone: z.string().optional(),
  deliveryMethod: z.enum(["email", "sms", "both"]),
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

// Create a seasonal festive SVG for the header
const FestiveHeader = () => {
  const currentMonth = new Date().getMonth();
  const getSeasonalColors = () => {
    if (currentMonth >= 11 || currentMonth <= 1) return { primary: "#e11d48", secondary: "#10b981" }; // Winter
    if (currentMonth >= 2 && currentMonth <= 4) return { primary: "#06b6d4", secondary: "#84cc16" }; // Spring
    if (currentMonth >= 5 && currentMonth <= 7) return { primary: "#f59e0b", secondary: "#ef4444" }; // Summer
    return { primary: "#ea580c", secondary: "#dc2626" }; // Fall
  };

  const colors = getSeasonalColors();

  return (
    <div className="text-center mb-8">
      <div className="relative">
        <svg width="200" height="80" viewBox="0 0 200 80" className="mx-auto mb-4">
          <defs>
            <linearGradient id="festiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>
          
          {/* Confetti */}
          <circle cx="20" cy="15" r="3" fill="#fbbf24" />
          <rect x="35" y="10" width="4" height="4" fill="#f87171" transform="rotate(45 37 12)" />
          <circle cx="160" cy="20" r="2" fill="#34d399" />
          <rect x="180" y="15" width="3" height="3" fill="#60a5fa" transform="rotate(30 181.5 16.5)" />
          
          {/* Balloons */}
          <ellipse cx="25" cy="35" rx="8" ry="12" fill="#ec4899" />
          <line x1="25" y1="47" x2="20" y2="60" stroke="#374151" strokeWidth="1" />
          
          <ellipse cx="175" cy="30" rx="7" ry="11" fill="#8b5cf6" />
          <line x1="175" y1="41" x2="180" y2="55" stroke="#374151" strokeWidth="1" />
          
          {/* Main text */}
          <text x="100" y="45" textAnchor="middle" fill="url(#festiveGradient)" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
            Birthday Gen
          </text>
          
          {/* Sparkles */}
          <path d="M55 25 L57 30 L62 28 L58 33 L63 35 L57 37 L58 42 L55 37 L50 39 L54 34 L49 32 L54 30 Z" fill="#fbbf24" />
          <path d="M145 50 L146 53 L149 52 L147 55 L150 56 L146 57 L147 60 L145 57 L142 58 L144 55 L141 54 L144 53 Z" fill="#f87171" />
        </svg>
        
        <p className="text-gray-600 text-sm">AI-powered personalized birthday messages with free custom images</p>
      </div>
    </div>
  );
};

export default function MessageGenerator({ onMessageGenerated, onLoadingChange }: MessageGeneratorProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      recipientGender: "",
      relationshipRole: "",
      personality: "",
      quirks: "",
      senderEmail: "",
      senderPhone: "",
      deliveryMethod: "email",
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
    <div className="max-w-2xl mx-auto">
      <FestiveHeader />
      
      <Card className="p-8 shadow-xl border-gray-100">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipient Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Who do you want to send birthday wishes to?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName" className="text-sm font-medium">
                  Recipient's Name *
                </Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Sarah, Mom, John"
                  className="bg-white"
                  {...form.register("recipientName")}
                />
                {form.formState.errors.recipientName && (
                  <p className="text-sm text-red-500">{form.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientGender" className="text-sm font-medium">
                  Gender (optional)
                </Label>
                <Select onValueChange={(value) => form.setValue("recipientGender", value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select if you'd like..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail" className="text-sm font-medium">
                  Recipient's Email (optional)
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="recipient@email.com"
                  className="bg-white"
                  {...form.register("recipientEmail")}
                />
                {form.formState.errors.recipientEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.recipientEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone" className="text-sm font-medium">
                  Recipient's Phone (optional)
                </Label>
                <Input
                  id="recipientPhone"
                  placeholder="+1 (555) 123-4567"
                  className="bg-white"
                  {...form.register("recipientPhone")}
                />
              </div>
            </div>
          </div>

          {/* Your Details Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-green-600" />
              Your Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderEmail" className="text-sm font-medium">
                  Your Email *
                </Label>
                <Input
                  id="senderEmail"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-white"
                  {...form.register("senderEmail")}
                />
                {form.formState.errors.senderEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.senderEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderPhone" className="text-sm font-medium">
                  Your Phone (optional)
                </Label>
                <Input
                  id="senderPhone"
                  placeholder="+1 (555) 123-4567"
                  className="bg-white"
                  {...form.register("senderPhone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMethod" className="text-sm font-medium">
                How should this be delivered? *
              </Label>
              <Select onValueChange={(value) => form.setValue("deliveryMethod", value as "email" | "sms" | "both")}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Choose delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="sms">SMS only</SelectItem>
                  <SelectItem value="both">Both email and SMS</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.deliveryMethod && (
                <p className="text-sm text-red-500">{form.formState.errors.deliveryMethod.message}</p>
              )}
            </div>
          </div>

          {/* Personalization Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              Personalization Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationshipRole" className="text-sm font-medium">
                  Your relationship to them *
                </Label>
                <Input
                  id="relationshipRole"
                  placeholder="e.g., sister, best friend, coworker, neighbor"
                  className="bg-white"
                  {...form.register("relationshipRole")}
                />
                {form.formState.errors.relationshipRole && (
                  <p className="text-sm text-red-500">{form.formState.errors.relationshipRole.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality" className="text-sm font-medium">
                  Describe their personality *
                </Label>
                <Textarea
                  id="personality"
                  placeholder="e.g., funny and sarcastic, loves dad jokes, always optimistic, quirky and creative"
                  className="bg-white min-h-[80px]"
                  {...form.register("personality")}
                />
                {form.formState.errors.personality && (
                  <p className="text-sm text-red-500">{form.formState.errors.personality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quirks" className="text-sm font-medium">
                  Any special quirks or interests? (optional)
                </Label>
                <Textarea
                  id="quirks"
                  placeholder="e.g., obsessed with cats, collects vintage comics, terrible at parking, makes amazing coffee"
                  className="bg-white min-h-[60px]"
                  {...form.register("quirks")}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={generateMessageMutation.isPending}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {generateMessageMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating your magical birthday message...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5" />
                Generate Birthday Magic
              </div>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}