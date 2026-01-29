import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiSuggestionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AiSuggestionButton({
  onClick,
  isLoading,
  disabled,
}: AiSuggestionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <Sparkles className="mr-2 h-3 w-3" />
      {isLoading ? "Improving..." : "AI Improve"}
    </Button>
  );
}
