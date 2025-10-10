import { LogOut } from "lucide-react";
import { NavigationGlobalIcon } from "./NavigationGlobalIcon";
import { logout } from "@/app/_server/actions/auth";
import { useRouter } from "next/navigation";

export const NavigationLogoutIcon = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <NavigationGlobalIcon
      icon={<LogOut className="h-5 w-5 text-destructive" />}
      onClick={handleLogout}
    />
  );
};
