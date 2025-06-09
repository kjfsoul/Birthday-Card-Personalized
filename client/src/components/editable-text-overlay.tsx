import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Check, X } from "lucide-react";

interface EditableTextOverlayProps {
  initialText: string;
  recipientName: string;
  relationshipRole: string;
  onTextChange: (newText: string) => void;
  className?: string;
}

export default function EditableTextOverlay({ 
  initialText, 
  recipientName, 
  relationshipRole, 
  onTextChange, 
  className = "" 
}: EditableTextOverlayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(initialText);
  const [displayText, setDisplayText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart name logic - use relationship for family, name for others
  const familyRelations = ['mom', 'mother', 'dad', 'father', 'grandmother', 'grandma', 'grandfather', 'grandpa', 'sister', 'brother', 'aunt', 'uncle'];
  const isFamily = familyRelations.some(relation => relationshipRole.toLowerCase().includes(relation));
  const smartDisplayName = isFamily ? relationshipRole : recipientName;

  useEffect(() => {
    // Auto-correct the display text with smart name logic
    const correctedText = initialText.replace(
      new RegExp(`\\b${recipientName}\\b`, 'gi'),
      smartDisplayName
    );
    setDisplayText(correctedText);
    setEditText(correctedText);
  }, [initialText, recipientName, smartDisplayName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setDisplayText(editText);
    onTextChange(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(displayText);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <div className="flex items-center gap-2 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border">
          <Input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 text-sm"
            placeholder="Edit the birthday message text..."
          />
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border backdrop-blur-sm">
            <p className="text-lg font-semibold text-gray-900 leading-relaxed">
              {displayText}
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="outline"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}