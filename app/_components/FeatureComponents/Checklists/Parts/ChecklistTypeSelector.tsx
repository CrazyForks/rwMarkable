import { CheckSquare, BarChart3 } from "lucide-react";
import { ChecklistType } from "@/app/_types";
import { ChecklistsTypes } from "@/app/_types/enums";

interface ChecklistTypeSelectorProps {
  selectedType: ChecklistType;
  onTypeChange: (type: ChecklistType) => void;
  disabled: boolean;
}

export const ChecklistTypeSelector = ({
  selectedType,
  onTypeChange,
  disabled,
}: ChecklistTypeSelectorProps) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      Checklist Type
    </label>

    <div className="grid grid-cols-2 gap-3">
      {([ChecklistsTypes.SIMPLE, ChecklistsTypes.TASK] as const).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onTypeChange(type)}
          className={`p-4 rounded-lg border-2 transition-all text-center ${
            selectedType === type
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-2">
            {type === ChecklistsTypes.SIMPLE ? (
              <CheckSquare className="h-6 w-6 text-muted-foreground" />
            ) : (
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            )}
            <div className="font-medium text-sm">
              {type === ChecklistsTypes.SIMPLE
                ? "Simple Checklist"
                : "Task Project"}
            </div>
            <div className="text-xs text-muted-foreground">
              {type === ChecklistsTypes.SIMPLE
                ? "Basic todo items"
                : "With time tracking"}
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
