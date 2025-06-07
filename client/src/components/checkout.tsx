import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ onSuccess, onBack }: { onSuccess: (purchaseId: number) => void; onBack: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      // Extract purchase ID from URL params or metadata
      const urlParams = new URLSearchParams(window.location.search);
      const purchaseId = urlParams.get('purchase_id');
      if (purchaseId) {
        onSuccess(parseInt(purchaseId));
      }
    }

    setIsProcessing(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        <div className="flex space-x-3">
          <Button 
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
          >
            {isProcessing ? "Processing..." : "Complete Purchase"}
          </Button>
        </div>
      </form>
    </div>
  );
};

interface CheckoutProps {
  messageId: number;
  email: string;
  onSuccess: (purchaseId: number) => void;
  onBack: () => void;
}

export default function Checkout({ messageId, email, onSuccess, onBack }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [purchaseId, setPurchaseId] = useState<number | null>(null);

  useEffect(() => {
    // Create purchase record and payment intent
    const initializePayment = async () => {
      try {
        // First create the purchase record
        const purchaseResponse = await apiRequest("POST", "/api/create-purchase", { 
          email, 
          messageId 
        });
        const purchaseData = await purchaseResponse.json();
        setPurchaseId(purchaseData.purchaseId);

        // Then create the payment intent
        const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: 2.99,
          metadata: { purchaseId: purchaseData.purchaseId }
        });
        const paymentData = await paymentResponse.json();
        setClientSecret(paymentData.clientSecret);
      } catch (error) {
        console.error("Failed to initialize payment:", error);
      }
    };

    initializePayment();
  }, [messageId, email]);

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up secure payment...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        onSuccess={(id) => onSuccess(purchaseId || id)} 
        onBack={onBack}
      />
    </Elements>
  );
}