import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Unlock, Shield, Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

  const handleTestPurchase = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/create-test-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, messageId })
      });
      
      const data = await response.json();
      if (data.purchaseId) {
        setLocation(`/thank-you/${data.purchaseId}`);
      }
    } catch (error) {
      console.error('Test purchase failed:', error);
    }
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

      {/* Personalized Gift Product Showcase */}
      <Card className="relative p-8 shadow-2xl border-gray-100 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
        {/* Aura effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-orange-400/20 blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Premium Personalized Gift Experience
              <Sparkles className="w-6 h-6 text-pink-600" />
            </h3>
            <p className="text-gray-700 font-medium">Turn your birthday message into a meaningful gift they'll treasure</p>
          </div>

          {/* Product Preview with Aura */}
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            <div className="relative flex-shrink-0">
              {/* Aura glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-2xl opacity-60 animate-pulse scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl blur-xl opacity-40 animate-pulse scale-105"></div>
              
              {/* Product placeholder with enhanced styling */}
              <div className="relative w-48 h-48 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-4 border-white/80 flex items-center justify-center">
                <div className="text-center">
                  <Gift className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">Aura Personalized</p>
                  <p className="text-xs text-gray-600">Gift Product</p>
                  <p className="text-xs text-purple-600 mt-1">Coming Soon</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="text-center md:text-left">
                <div className="text-4xl font-bold text-gray-900 mb-2">$2.99</div>
                <div className="text-gray-600 font-medium">Complete Birthday Experience</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">5 additional premium messages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Beautiful downloadable card design</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Exclusive Aura personalized gift</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Different emotional tones & styles</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <p className="text-gray-700 text-center font-medium">
              ✨ Your personalized message becomes part of a unique gift experience that creates lasting memories beyond just words.
            </p>
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

          <div className="space-y-3">
            <Button 
              type="button"
              onClick={handleTestPurchase}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Test Premium (Free)
            </Button>
            
            <Button 
              type="button"
              onClick={() => window.open('https://buy.stripe.com/cNicN6erG5Vr9ed4ld9Zm02', '_blank')}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
            >
              <Unlock className="w-5 h-5 mr-2" />
              Buy Premium - $2.99
            </Button>
          </div>

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
