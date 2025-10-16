import { useEffect } from "react";

type Shortcut = {
  code: string;
  handler: (event: KeyboardEvent) => void;
  shiftKey?: boolean;
  altKey?: boolean;
  modKey?: boolean;
};

export const useShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

      const shortcut = shortcuts.find((s) => {
        const modKeyPressed = isMac ? event.metaKey : event.ctrlKey;

        if (!!s.modKey !== modKeyPressed) {
          return false;
        }
        if (!!s.altKey !== event.altKey) {
          return false;
        }
        if (!!s.shiftKey !== event.shiftKey) {
          return false;
        }
        if (s.code !== event.code) {
          return false;
        }

        return true;
      });

      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
};
