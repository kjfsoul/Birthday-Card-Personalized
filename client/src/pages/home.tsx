import { useState } from "react";
import MessageGenerator from "@/components/message-generator";
import LoadingOverlay from "@/components/loading-overlay";
import PremiumUpsell from "@/components/premium-upsell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeft, Cake, Gift, Sparkles, Shield } from "lucide-react";
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
  const [userEmail, setUserEmail] = useState<string>("");
  const { toast } = useToast();

  const handleMessageGenerated = (message: GeneratedMessage, email: string) => {
    setGeneratedMessage(message);
    setUserEmail(email);
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

            {/* Enhanced Upsell Preview with Product Focus */}
            <Card className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 text-white text-center shadow-xl mb-6 overflow-hidden">
              {/* Subtle aura effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-orange-400/30 blur-xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                  <Gift className="w-6 h-6" />
                  Love it? There's more!
                  <Sparkles className="w-6 h-6" />
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Unlock <strong>5 more premium messages</strong> + exclusive <strong>Aura personalized gift</strong> + downloadable card
                </p>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/30">
                  <div className="text-3xl font-bold mb-1">$2.99</div>
                  <div className="text-sm opacity-80">Complete Birthday Experience</div>
                </div>

                <Button 
                  onClick={handleShowUpsell}
                  className="w-full bg-white text-purple-600 font-bold hover:bg-gray-100 shadow-lg"
                  size="lg"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Get Premium Gift Experience
                </Button>

                <p className="text-xs mt-4 opacity-70">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Secure checkout • Instant access • Unique personalized gift
                </p>
              </div>
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
            userEmail={userEmail}
            onBack={() => setCurrentView("message")}
          />
        )}
      </div>
    </div>
  );
}
