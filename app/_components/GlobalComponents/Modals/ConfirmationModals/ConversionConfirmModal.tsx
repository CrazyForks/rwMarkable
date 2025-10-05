"use client";

import { AlertTriangle, CheckSquare, BarChart3 } from "lucide-react";
import { Button } from "@/app/_components/GlobalComponents/Buttons/Button";
import { Modal } from "@/app/_components/GlobalComponents/Modals/Modal";
import { ChecklistType } from "@/app/_types";
import { InfoBox } from "../../Cards/InfoBox";

interface ConversionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentType: ChecklistType;
  newType: ChecklistType;
}

const TYPE_CONFIG = {
  simple: { label: "Simple Checklist", Icon: CheckSquare },
  task: { label: "Task Project", Icon: BarChart3 },
};

const DATA_LOSS_WARNINGS = [
  "All task statuses will be reset",
  "Time tracking data will be lost",
  "Estimated times will be removed",
  "Target dates will be cleared",
];

const ENHANCED_FEATURES = [
  "Kanban board with drag & drop",
  "Task status tracking (Todo, In Progress, etc.)",
  "Time tracking with a built-in timer",
  "Set estimated times and target dates",
];

const TypeDisplay = ({ type }: { type: ChecklistType }) => {
  const { label, Icon } = TYPE_CONFIG[type];
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};

export const ConversionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentType,
  newType,
}: ConversionConfirmModalProps) => {
  const isDestructive = newType === "simple" && currentType === "task";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Checklist Type"
      titleIcon={<AlertTriangle className="h-5 w-5 text-destructive" />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 p-3 bg-muted/50 rounded-lg">
          <TypeDisplay type={currentType} />
          <span className="text-muted-foreground">→</span>
          <TypeDisplay type={newType} />
        </div>

        {isDestructive ? (
          <InfoBox
            title="⚠️ Data Loss Warning"
            items={DATA_LOSS_WARNINGS}
            variant="warning"
          />
        ) : (
          <InfoBox
            title="✨ Enhanced Features"
            items={ENHANCED_FEATURES}
            variant="info"
          />
        )}

        <p className="text-sm text-muted-foreground">
          {isDestructive
            ? "This action cannot be undone. Are you sure you want to convert?"
            : "Are you sure you want to convert this checklist type?"}
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant={isDestructive ? "destructive" : "default"}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1"
        >
          {isDestructive ? "Convert & Lose Data" : "Convert"}
        </Button>
      </div>
    </Modal>
  );
};
