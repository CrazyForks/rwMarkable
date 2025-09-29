"use client";

import { LogOut, Menu, Settings, Shield, Users } from "lucide-react";
import { Button } from "@/app/_components/ui/elements/button";
import { SearchBar } from "@/app/_components/common/search/SearchBar";
import { useRouter } from "next/navigation";
import { logout } from "@/app/_server/actions/auth/logout";
import { useAppMode } from "@/app/_providers/AppModeProvider";
import { useNavigationGuard } from "@/app/_providers/NavigationGuardProvider";
import { Checklist, Note, AppMode } from "@/app/_types";

interface HeaderProps {
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  onOpenSettings?: () => void;
  isAdmin: boolean;
  checklists?: Checklist[];
  docs?: Note[];
  onModeChange?: (mode: AppMode) => void;
}

export function QuickNav({
  showSidebarToggle = false,
  onSidebarToggle,
  onOpenSettings,
  isAdmin,
  checklists = [],
  docs = [],
  onModeChange,
}: HeaderProps) {
  const router = useRouter();
  const { mode } = useAppMode();
  const { checkNavigation } = useNavigationGuard();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="bg-background border-b border-border px-4 py-3 lg:px-6 lg:py-5">
      <div className="flex items-center gap-2 md:gap-4 justify-between w-full">
        {showSidebarToggle && onSidebarToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden h-10 w-10 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1 min-w-0 max-w-lg mx-1 md:mx-4">
          <SearchBar
            mode={mode}
            checklists={checklists}
            docs={docs}
            onModeChange={
              onModeChange
                ? (mode) => checkNavigation(() => onModeChange(mode))
                : undefined
            }
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkNavigation(() => onOpenSettings())}
              className="h-8 w-8 md:h-10 md:w-10 p-0 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkNavigation(() => router.push("/admin"))}
              className="h-8 w-8 md:h-10 md:w-10 p-0 text-muted-foreground hover:text-foreground"
            >
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 md:h-10 md:w-10 p-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
