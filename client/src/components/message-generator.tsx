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
// Using public directory path for the Birthday Gen logo
const birthdayGenLogo = "/birthday-gen-logo.png";

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
  onMessageGenerated: (message: GeneratedMessage, email: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Professional header with Birthday Gen branding and animations
const FestiveHeader = () => {
  return (
    <div className="text-center mb-12 relative overflow-hidden">
      {/* Animated confetti background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Birthday Gen Logo with proper sizing and centering */}
        <div className="mb-8 relative mt-12">
          <div className="flex flex-col items-center justify-center">
            {/* Logo image with aura effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl blur-2xl opacity-60 animate-pulse scale-110"></div>
              <img 
                src={birthdayGenLogo} 
                alt="Birthday Gen" 
                className="relative w-64 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 animate-bounce"
                style={{ animationDuration: '3s' }}
                onError={(e) => {
                  // Fallback to text logo if image fails
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              
              {/* Fallback text logo */}
              <div className="hidden">
                <h1 className="text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  BIRTHDAY
                </h1>
                <h2 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-500 bg-clip-text text-transparent -mt-3 leading-tight">
                  GEN
                </h2>
              </div>
            </div>

            {/* Animated streamers */}
            <div className="absolute top-2 left-1/4 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform -rotate-12 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-28 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transform rotate-12 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-gray-700 text-xl font-semibold max-w-lg mx-auto mb-6 leading-relaxed">
          Create personalized birthday messages with AI-generated custom images
        </p>
        
        {/* Subtle product hint with enhanced styling */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-full border-2 border-purple-200 shadow-lg">
          <Gift className="w-5 h-5 text-purple-600 animate-bounce" style={{ animationDuration: '2s' }} />
          <span className="text-base text-gray-800 font-semibold">Plus exclusive Aura personalized gifts</span>
          <Sparkles className="w-5 h-5 text-pink-600 animate-pulse" />
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
    onSuccess: (data: GeneratedMessage, variables: FormData) => {
      onMessageGenerated(data, variables.senderEmail);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Core Message Details - Priority Section */}
          <div className="space-y-6 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 text-center justify-center">
              <Cake className="w-7 h-7 text-purple-600" />
              Create Your Perfect Birthday Message
            </h3>
            
            <div className="space-y-6">
              {/* Recipient Name - Most Important */}
              <div className="space-y-3">
                <Label htmlFor="recipientName" className="text-lg font-bold text-gray-800">
                  Who are you celebrating? *
                </Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Sarah, Mom, John, Alex"
                  className="bg-white border-3 border-purple-300 focus:border-purple-500 transition-colors text-lg p-4 rounded-xl shadow-md"
                  {...form.register("recipientName")}
                />
                {form.formState.errors.recipientName && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div className="space-y-3">
                  <Label htmlFor="recipientGender" className="text-base font-semibold text-gray-700">
                    Gender (optional)
                  </Label>
                  <Select onValueChange={(value) => form.setValue("recipientGender", value)}>
                    <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-purple-400 p-3 text-base">
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

                {/* Relationship */}
                <div className="space-y-3">
                  <Label htmlFor="relationshipRole" className="text-base font-semibold text-gray-700">
                    Their relationship to you *
                  </Label>
                  <Input
                    id="relationshipRole"
                    placeholder="e.g., my sister, my best friend, my coworker"
                    className="bg-white border-2 border-gray-300 focus:border-purple-400 transition-colors p-3 text-base"
                    {...form.register("relationshipRole")}
                  />
                  {form.formState.errors.relationshipRole && (
                    <p className="text-sm text-red-500 font-medium">{form.formState.errors.relationshipRole.message}</p>
                  )}
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-3">
                <Label htmlFor="personality" className="text-base font-semibold text-gray-700">
                  Describe their personality *
                </Label>
                <Textarea
                  id="personality"
                  placeholder="e.g., funny and sarcastic, loves dad jokes, always optimistic, quirky and creative"
                  className="bg-white min-h-[100px] border-2 border-gray-300 focus:border-purple-400 transition-colors p-4 text-base"
                  {...form.register("personality")}
                />
                {form.formState.errors.personality && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.personality.message}</p>
                )}
              </div>

              {/* Quirks */}
              <div className="space-y-3">
                <Label htmlFor="quirks" className="text-base font-semibold text-gray-700">
                  Any special quirks or interests? (optional)
                </Label>
                <Textarea
                  id="quirks"
                  placeholder="e.g., obsessed with cats, collects vintage comics, terrible at parking, makes amazing coffee"
                  className="bg-white min-h-[80px] border-2 border-gray-300 focus:border-purple-400 transition-colors p-4 text-base"
                  {...form.register("quirks")}
                />
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <PartyPopper className="w-6 h-6 text-green-600" />
              Contact & Delivery Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Recipient's Contact (optional)</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="recipientEmail" className="text-sm font-medium text-gray-600">
                      Email
                    </Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="recipient@email.com"
                      className="bg-white border-2 border-gray-200 focus:border-green-400 transition-colors"
                      {...form.register("recipientEmail")}
                    />
                    {form.formState.errors.recipientEmail && (
                      <p className="text-sm text-red-500">{form.formState.errors.recipientEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="recipientPhone" className="text-sm font-medium text-gray-600">
                      Phone
                    </Label>
                    <Input
                      id="recipientPhone"
                      placeholder="+1 (555) 123-4567"
                      className="bg-white border-2 border-gray-200 focus:border-green-400 transition-colors"
                      {...form.register("recipientPhone")}
                    />
                  </div>
                </div>
              </div>

              {/* Your Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Your Contact *</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="senderEmail" className="text-sm font-medium text-gray-600">
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
                  <div>
                    <Label htmlFor="senderPhone" className="text-sm font-medium text-gray-600">
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
              </div>
            </div>

            <div className="space-y-3">
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