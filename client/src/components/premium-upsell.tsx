import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Unlock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Checkout from "@/components/checkout";

interface PremiumUpsellProps {
  messageId: number;
  onBack: () => void;
}

export default function PremiumUpsell({ messageId, onBack }: PremiumUpsellProps) {
  const [email, setEmail] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setShowCheckout(true);
  };

  const handlePaymentSuccess = (purchaseId: number) => {
    setLocation(`/thank-you/${purchaseId}`);
  };

  if (showCheckout) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-gray-600">
            Secure payment powered by Stripe
          </p>
        </div>
        
        <Checkout 
          messageId={messageId}
          email={email}
          onSuccess={handlePaymentSuccess}
          onBack={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-secondary to-yellow-400 rounded-full mb-4">
          <Unlock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Love it? There's more!
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          Unlock premium features for the perfect birthday celebration
        </p>
      </div>

      {/* Features Card */}
      <Card className="p-6 shadow-xl border-gray-100">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">$2.99</div>
          <div className="text-gray-600">One-time purchase</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">5 additional premium messages</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Beautiful downloadable card design</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Instant delivery via email</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800 font-medium">Different emotional tones & styles</span>
          </div>
        </div>
      </Card>

      {/* Purchase Form */}
      <Card className="p-6 shadow-xl border-gray-100">
        <form onSubmit={handleProceedToCheckout} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email address for delivery
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            <Unlock className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>

          <p className="text-xs text-gray-600 text-center">
            <Shield className="inline w-3 h-3 mr-1" />
            Secure payment via Stripe
          </p>
        </form>
      </Card>

      {/* Back Button */}
      <Button 
        onClick={onBack}
        variant="ghost"
        className="w-full text-gray-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Message
      </Button>
    </div>
  );
}
