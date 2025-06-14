import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Type, 
  Sparkles, 
  Download, 
  Palette, 
  Shirt, 
  Coffee,
  RotateCcw,
  Plus,
  Minus,
  Brush,
  Mail,
  MessageSquareText, // Added MessageSquareText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import EditableTextOverlay from "./editable-text-overlay";

interface CardDesignerProps {
  messageId: number; // Added messageId
  messageContent: string;
  originalImageUrl?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string; // Added recipientPhone
  relationshipRole: string;
  onSave: (cardData: any) => void;
}

const FONT_OPTIONS = [
  { name: "Elegant Script", class: "font-serif", preview: "Happy Birthday!" },
  { name: "Modern Sans", class: "font-sans", preview: "Happy Birthday!" },
  { name: "Playful Rounded", class: "font-mono rounded", preview: "Happy Birthday!" },
  { name: "Classic Serif", class: "font-serif", preview: "Happy Birthday!" },
  { name: "Bold Display", class: "font-black", preview: "Happy Birthday!" },
  { name: "Handwritten", class: "font-cursive", preview: "Happy Birthday!" }
];

const SPARKLE_EFFECTS = [
  { name: "Gold Sparkles", class: "sparkle-gold" },
  { name: "Silver Glitter", class: "sparkle-silver" },
  { name: "Rainbow Burst", class: "sparkle-rainbow" },
  { name: "Pink Shimmer", class: "sparkle-pink" },
  { name: "Blue Stars", class: "sparkle-blue" }
];

export default function CardDesigner({ messageId, messageContent, originalImageUrl, recipientName, recipientEmail, recipientPhone, relationshipRole, onSave }: CardDesignerProps) {
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [fontSize, setFontSize] = useState([24]);
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [sparkleEffect, setSparkleEffect] = useState<string>("");
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, id: string}>>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(originalImageUrl || "");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editableText, setEditableText] = useState(messageContent);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-card-image", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImageUrl(data.imageUrl);
      setIsGeneratingImage(false);
      toast({
        title: "Image Generated",
        description: "Your custom birthday image is ready!"
      });
    },
    onError: () => {
      setIsGeneratingImage(false);
      toast({
        title: "Generation Failed",
        description: "Please try again with a different prompt",
        variant: "destructive"
      });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { messageId: number; recipientEmail: string }) => {
      return apiRequest("POST", "/api/send-card", data);
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: "Your birthday card has been successfully sent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendSmsMutation = useMutation({
    mutationFn: async (data: { messageId: number; recipientPhone: string }) => {
      return apiRequest("POST", "/api/send-sms-card", data);
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent!",
        description: "Your birthday card has been successfully sent via SMS.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send SMS",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSparkle = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSparklePositions(prev => [...prev, {
      x,
      y,
      id: Date.now().toString()
    }]);
  };

  const handleRemoveSparkle = (id: string) => {
    setSparklePositions(prev => prev.filter(sparkle => sparkle.id !== id));
  };

  const generateNewImage = () => {
    const prompt = `Create a sophisticated birthday celebration image for ${recipientName}. Style: elegant, clean, minimalist with subtle celebration elements. Focus on quality over busy details. Include tasteful birthday elements like elegant candles, soft balloons, or gentle confetti. Avoid text overlays. High resolution, professional photography style.`;
    
    setIsGeneratingImage(true);
    generateImageMutation.mutate(prompt);
  };

  const handlePrintifyProduct = (productType: string) => {
    toast({
      title: "Printify Integration",
      description: `Opening ${productType} customization...`
    });
    // In production, this would integrate with Printify API
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (generatedImageUrl) {
      const img = new Image();
      img.onload = () => {
        if (ctx && canvas) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height * 0.6);
          drawText();
        }
      };
      img.src = generatedImageUrl;
    } else {
      drawText();
    }

    function drawText() {
      if (!ctx || !canvas) return;
      
      // Draw message text
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize[0]}px Arial`;
      ctx.textAlign = 'center';
      const lines = editableText.split('\n');
      const startY = generatedImageUrl ? canvas.height * 0.7 : canvas.height * 0.4;
      
      lines.forEach((line, index) => {
        if (ctx && canvas) {
          ctx.fillText(line, canvas.width / 2, startY + (index * fontSize[0] * 1.2));
        }
      });

      // Download the canvas
      const link = document.createElement('a');
      link.download = `birthday-card-${recipientName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Design Your Card</h2>
        <p className="text-gray-600">Customize your birthday message with fonts, effects, and images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Preview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Preview</h3>
          <Card className="relative overflow-hidden aspect-[4/3]" style={{ backgroundColor }}>
            <div 
              className="absolute inset-0 cursor-crosshair"
              onClick={sparkleEffect ? handleAddSparkle : undefined}
            >
              {/* Background Image */}
              {generatedImageUrl && (
                <img 
                  src={generatedImageUrl} 
                  alt="Card background" 
                  className="w-full h-2/3 object-cover"
                />
              )}

              {/* Birthday Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border backdrop-blur-sm">
                  <div 
                    className={`${selectedFont.class} text-center leading-relaxed font-bold`}
                    style={{ 
                      fontSize: `${fontSize[0]}px`, 
                      color: textColor 
                    }}
                  >
                    Happy Birthday, {recipientName}!
                  </div>
                </div>
              </div>

              {/* Message Text Section */}
              <div className="absolute top-2/3 left-0 right-0 p-6">
                <EditableTextOverlay
                  initialText={editableText}
                  recipientName={recipientName}
                  relationshipRole={relationshipRole}
                  onTextChange={setEditableText}
                  className={`${selectedFont.class} text-sm`}
                />
              </div>

              {/* Sparkle Effects */}
              {sparklePositions.map((sparkle) => (
                <div
                  key={sparkle.id}
                  className={`absolute w-4 h-4 ${sparkleEffect} animate-pulse cursor-pointer`}
                  style={{ 
                    left: `${sparkle.x}%`, 
                    top: `${sparkle.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleRemoveSparkle(sparkle.id)}
                >
                  ✨
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button onClick={downloadCard} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Card
            </Button>
            <Button
              onClick={() => {
                if (recipientEmail && messageId) {
                  sendEmailMutation.mutate({ messageId, recipientEmail });
                }
              }}
              disabled={!recipientEmail || sendEmailMutation.isPending}
              className="flex-1"
            >
              {sendEmailMutation.isPending ? (
                <div className="animate-spin w-4 h-4 mr-2">📧</div>
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send by Email
            </Button>
            <Button
              onClick={() => {
                if (recipientPhone && messageId) {
                  sendSmsMutation.mutate({ messageId, recipientPhone });
                }
              }}
              disabled={!recipientPhone || sendSmsMutation.isPending}
              className="flex-1"
            >
              {sendSmsMutation.isPending ? (
                <div className="animate-spin w-4 h-4 mr-2">📱</div>
              ) : (
                <MessageSquareText className="w-4 h-4 mr-2" />
              )}
              Send by SMS
            </Button>
            <Button onClick={() => setSparklePositions([])} variant="outline" className="px-3">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">
                <Type className="w-4 h-4 mr-1" />
                Text
              </TabsTrigger>
              <TabsTrigger value="effects">
                <Sparkles className="w-4 h-4 mr-1" />
                Effects
              </TabsTrigger>
              <TabsTrigger value="image">
                <Palette className="w-4 h-4 mr-1" />
                Image
              </TabsTrigger>
              <TabsTrigger value="products">
                <Shirt className="w-4 h-4 mr-1" />
                Gifts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label>Font Style</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {FONT_OPTIONS.map((font) => (
                    <Button
                      key={font.name}
                      variant={selectedFont.name === font.name ? "default" : "outline"}
                      onClick={() => setSelectedFont(font)}
                      className="p-3 h-auto text-left"
                    >
                      <div>
                        <div className="font-semibold text-xs">{font.name}</div>
                        <div className={`${font.class} text-sm`}>{font.preview}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={48}
                  min={12}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div>
                <Label>Sparkle Effects</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {SPARKLE_EFFECTS.map((effect) => (
                    <Button
                      key={effect.name}
                      variant={sparkleEffect === effect.class ? "default" : "outline"}
                      onClick={() => setSparkleEffect(sparkleEffect === effect.class ? "" : effect.class)}
                      className="justify-start"
                    >
                      <Brush className="w-4 h-4 mr-2" />
                      {effect.name}
                    </Button>
                  ))}
                </div>
              </div>

              {sparkleEffect && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    ✨ Sparkle mode active! Click on the card preview to add sparkles.
                    Click existing sparkles to remove them.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div>
                <Label>Background Image</Label>
                <Button 
                  onClick={generateNewImage}
                  disabled={isGeneratingImage}
                  className="w-full mt-2"
                >
                  {isGeneratingImage ? (
                    <div className="animate-spin w-4 h-4 mr-2">⭐</div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingImage ? "Generating..." : "Generate New Image"}
                </Button>
              </div>

              {generatedImageUrl && (
                <div className="space-y-2">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated background" 
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button 
                    onClick={() => setGeneratedImageUrl("")}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Remove Image
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div>
                <Label>Printify Gift Products</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Turn your card into physical gifts with zodiac symbols and custom designs
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handlePrintifyProduct("T-Shirt")}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Shirt className="w-6 h-6 mb-1" />
                  <span className="text-xs">Custom T-Shirts</span>
                </Button>

                <Button
                  onClick={() => handlePrintifyProduct("Mug")}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Coffee className="w-6 h-6 mb-1" />
                  <span className="text-xs">Photo Mugs</span>
                </Button>

                <Button
                  onClick={() => handlePrintifyProduct("Zodiac Apparel")}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Sparkles className="w-6 h-6 mb-1" />
                  <span className="text-xs">Zodiac Apparel</span>
                </Button>

                <Button
                  onClick={() => handlePrintifyProduct("Custom Gifts")}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <Palette className="w-6 h-6 mb-1" />
                  <span className="text-xs">Custom Gifts</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}