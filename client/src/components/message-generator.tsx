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
// Using direct path for the Birthday Gen logo
const birthdayGenLogo = "/attached_assets/image_1749377008726.png";

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

// Professional header with Birthday Gen branding
const FestiveHeader = () => {
  return (
    <div className="text-center mb-10">
      <div className="relative">
        {/* Birthday Gen Text Logo with 3D effect */}
        <div className="mb-6">
          <h1 className="text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl transform hover:scale-105 transition-transform duration-300">
            BIRTHDAY
          </h1>
          <h2 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-500 bg-clip-text text-transparent -mt-2">
            GEN
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <p className="text-gray-600 text-lg font-medium max-w-md mx-auto mb-4">
          Create personalized birthday messages with AI-generated custom images
        </p>
        
        {/* Subtle product hint */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
          <Gift className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-700 font-medium">Plus exclusive Aura personalized gifts</span>
          <Sparkles className="w-4 h-4 text-pink-600" />
        </div>
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
      form.reset({
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
      });
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
      
      <Card className="p-8 shadow-2xl border-gray-100 bg-white/95 backdrop-blur-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipient Section */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-600" />
              Who do you want to send birthday wishes to?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName" className="text-sm font-semibold text-gray-700">
                  Recipient's Name *
                </Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Sarah, Mom, John"
                  className="bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors"
                  {...form.register("recipientName")}
                />
                {form.formState.errors.recipientName && (
                  <p className="text-sm text-red-500">{form.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientGender" className="text-sm font-semibold text-gray-700">
                  Gender (optional)
                </Label>
                <Select onValueChange={(value) => form.setValue("recipientGender", value)}>
                  <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-purple-400">
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
                <Label htmlFor="recipientEmail" className="text-sm font-semibold text-gray-700">
                  Recipient's Email (optional)
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="recipient@email.com"
                  className="bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors"
                  {...form.register("recipientEmail")}
                />
                {form.formState.errors.recipientEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.recipientEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone" className="text-sm font-semibold text-gray-700">
                  Recipient's Phone (optional)
                </Label>
                <Input
                  id="recipientPhone"
                  placeholder="+1 (555) 123-4567"
                  className="bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors"
                  {...form.register("recipientPhone")}
                />
              </div>
            </div>
          </div>

          {/* Your Details Section */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <PartyPopper className="w-6 h-6 text-green-600" />
              Your Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderEmail" className="text-sm font-semibold text-gray-700">
                  Your Email *
                </Label>
                <Input
                  id="senderEmail"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-white border-2 border-gray-200 focus:border-green-400 transition-colors"
                  {...form.register("senderEmail")}
                />
                {form.formState.errors.senderEmail && (
                  <p className="text-sm text-red-500">{form.formState.errors.senderEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderPhone" className="text-sm font-semibold text-gray-700">
                  Your Phone (optional)
                </Label>
                <Input
                  id="senderPhone"
                  placeholder="+1 (555) 123-4567"
                  className="bg-white border-2 border-gray-200 focus:border-green-400 transition-colors"
                  {...form.register("senderPhone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMethod" className="text-sm font-semibold text-gray-700">
                How should this be delivered? *
              </Label>
              <Select onValueChange={(value) => form.setValue("deliveryMethod", value as "email" | "sms" | "both")}>
                <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-green-400">
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
          <div className="space-y-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-600" />
              Personalization Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationshipRole" className="text-sm font-semibold text-gray-700">
                  Your relationship to them *
                </Label>
                <Input
                  id="relationshipRole"
                  placeholder="e.g., sister, best friend, coworker, neighbor"
                  className="bg-white border-2 border-gray-200 focus:border-yellow-400 transition-colors"
                  {...form.register("relationshipRole")}
                />
                {form.formState.errors.relationshipRole && (
                  <p className="text-sm text-red-500">{form.formState.errors.relationshipRole.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality" className="text-sm font-semibold text-gray-700">
                  Describe their personality *
                </Label>
                <Textarea
                  id="personality"
                  placeholder="e.g., funny and sarcastic, loves dad jokes, always optimistic, quirky and creative"
                  className="bg-white min-h-[80px] border-2 border-gray-200 focus:border-yellow-400 transition-colors"
                  {...form.register("personality")}
                />
                {form.formState.errors.personality && (
                  <p className="text-sm text-red-500">{form.formState.errors.personality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quirks" className="text-sm font-semibold text-gray-700">
                  Any special quirks or interests? (optional)
                </Label>
                <Textarea
                  id="quirks"
                  placeholder="e.g., obsessed with cats, collects vintage comics, terrible at parking, makes amazing coffee"
                  className="bg-white min-h-[60px] border-2 border-gray-200 focus:border-yellow-400 transition-colors"
                  {...form.register("quirks")}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={generateMessageMutation.isPending}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
          >
            {generateMessageMutation.isPending ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Creating your magical birthday message...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Cake className="w-6 h-6" />
                Generate Birthday Magic
              </div>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}