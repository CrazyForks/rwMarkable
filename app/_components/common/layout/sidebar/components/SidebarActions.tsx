"use client";

import { Plus, FolderPlus, Settings, User } from "lucide-react";
import { Button } from "@/app/_components/ui/elements/button";
import { cn } from "@/app/_utils/utils";
import { AppMode } from "@/app/_types";

interface SidebarActionsProps {
  mode: AppMode;
  onOpenCreateModal: (initialCategory?: string) => void;
  onOpenCategoryModal: () => void;
  onOpenSettings: () => void;
  username: string;
  isAdmin: boolean;
}

export function SidebarActions({
  mode,
  onOpenCreateModal,
  onOpenCategoryModal,
  onOpenSettings,
  username,
  isAdmin,
}: SidebarActionsProps) {
  return (
    <div className="p-4 space-y-2 border-t border-border">
      <div className="flex gap-2">
        <Button
          onClick={() => onOpenCreateModal()}
          size="sm"
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          New {mode === "checklists" ? "Checklist" : "Document"}
        </Button>
        <Button
          onClick={onOpenCategoryModal}
          variant="outline"
          size="sm"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{username}</span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
              Admin
            </span>
          )}
        </div>
        <Button
          onClick={onOpenSettings}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
