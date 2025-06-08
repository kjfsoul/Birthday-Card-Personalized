import { useState } from "react";
import MessageGenerator from "@/components/message-generator";
import LoadingOverlay from "@/components/loading-overlay";
import PremiumUpsell from "@/components/premium-upsell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeft, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewState = "landing" | "message" | "upsell";

interface GeneratedMessage {
  id: number;
  content: string;
  imageUrl?: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMessageGenerated = (message: GeneratedMessage) => {
    setGeneratedMessage(message);
    setCurrentView("message");
  };

  const handleCopyMessage = async () => {
    if (generatedMessage) {
      try {
        await navigator.clipboard.writeText(generatedMessage.content);
        toast({
          title: "Copied!",
          description: "Message copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Please select and copy the text manually",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    setCurrentView("landing");
    setGeneratedMessage(null);
  };

  const handleShowUpsell = () => {
    setCurrentView("upsell");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
      {isLoading && <LoadingOverlay />}
      
      <div className="container mx-auto px-4 py-8">
        {currentView === "landing" && (
          <MessageGenerator 
            onMessageGenerated={handleMessageGenerated}
            onLoadingChange={setIsLoading}
          />
        )}

        {currentView === "message" && generatedMessage && (
          <>
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your message is ready! 🎉
              </h2>
            </div>

            {/* Generated Message Display */}
            <Card className="p-6 mb-6 shadow-xl border-gray-100">
              {generatedMessage.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={generatedMessage.imageUrl} 
                    alt="Birthday card illustration" 
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              )}
              
              <div className="text-center mb-4">
                <span className="text-primary text-lg">"</span>
              </div>
              <div className="text-lg leading-relaxed text-gray-900 font-medium text-center px-2 mb-4">
                {generatedMessage.content}
              </div>
              <div className="text-center mb-4">
                <span className="text-primary text-lg">"</span>
              </div>

              <Button 
                onClick={handleCopyMessage}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </Button>
            </Card>

            {/* Upsell Preview */}
            <Card className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center shadow-xl mb-6">
              <h3 className="text-2xl font-bold mb-3">Love it? There's more! 💝</h3>
              <p className="text-lg mb-6 opacity-90">
                Unlock <strong>5 more premium</strong> personalized messages + a beautiful downloadable digital card
              </p>
              
              <div className="bg-white/20 rounded-xl p-4 mb-6">
                <div className="text-3xl font-bold mb-1">$2.99</div>
                <div className="text-sm opacity-80">One-time purchase</div>
              </div>

              <Button 
                onClick={handleShowUpsell}
                className="w-full bg-white text-primary font-bold hover:bg-gray-100"
                size="lg"
              >
                Unlock Now 🚀
              </Button>

              <p className="text-xs mt-4 opacity-70">
                <span className="mr-1">🛡️</span>
                Secure checkout • Instant access
              </p>
            </Card>

            {/* Back Button */}
            <Button 
              onClick={handleBack}
              variant="ghost"
              className="w-full text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Generate Another Message
            </Button>
          </>
        )}

        {currentView === "upsell" && generatedMessage && (
          <PremiumUpsell 
            messageId={generatedMessage.id}
            onBack={() => setCurrentView("message")}
          />
        )}
      </div>
    </div>
  );
}
