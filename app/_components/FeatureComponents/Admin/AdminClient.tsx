"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/_components/GlobalComponents/Buttons/Button";
import { UserManagementModal } from "@/app/_components/GlobalComponents/Modals/UserModals/UserManagementModal";
import { User, Checklist, Note } from "@/app/_types";
import { deleteUser } from "@/app/_server/actions/users";
import { getAllLists } from "@/app/_server/actions/checklist";
import { getAllNotes } from "@/app/_server/actions/note";
import { getGlobalSharing } from "@/app/_server/actions/sharing";
import { useRouter } from "next/navigation";
import { AdminTabs } from "./Parts/AdminTabs";
import { AdminOverview } from "./Parts/AdminOverview";
import { AdminUsers } from "./Parts/AdminUsers";
import { AdminContent } from "./Parts/AdminContent";
import { AdminSharing } from "./Parts/AdminSharing";
import { AppSettingsTab } from "./Parts/AppSettingsTab";
import { readJsonFile } from "@/app/_server/actions/file";
import { USERS_FILE } from "@/app/_consts/files";

interface AdminClientProps {
  username: string;
}

export const AdminClient = ({ username }: AdminClientProps) => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [allLists, setAllLists] = useState<Checklist[]>([]);
  const [allDocs, setAllDocs] = useState<Note[]>([]);
  const [globalSharing, setGlobalSharing] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "content" | "sharing" | "settings"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersData, listsData, docsData, sharingData] = await Promise.all([
        readJsonFile(USERS_FILE),
        getAllLists(),
        getAllNotes(),
        getGlobalSharing(),
      ]);

      setUsers(usersData);
      setAllLists(listsData.success && listsData.data ? listsData.data : []);
      setAllDocs(docsData.success && docsData.data ? docsData.data : []);
      setGlobalSharing(
        sharingData.success && sharingData.data ? sharingData.data : {}
      );
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setUserModalMode("add");
    setSelectedUser(undefined);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setUserModalMode("edit");
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingUser(user.username);
    try {
      const formData = new FormData();
      formData.append("username", user.username);

      const result = await deleteUser(formData);

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.username !== user.username));
      } else {
        alert(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleUserModalSuccess = () => {
    loadAdminData();
  };

  const stats = {
    totalUsers: users.length,
    totalChecklists: allLists.length,
    totalNotes: allDocs.length,
    sharedChecklists: globalSharing.sharingStats?.totalSharedChecklists || 0,
    sharedNotes: globalSharing.sharingStats?.totalSharedNotes || 0,
    totalSharingRelationships:
      globalSharing.sharingStats?.totalSharingRelationships || 0,
    adminUsers: users.filter((u) => u.isAdmin).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, content, and system settings
            </p>
          </div>
        </div>
      </div>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[600px]">
        {activeTab === "overview" && <AdminOverview stats={stats} />}
        {activeTab === "users" && (
          <AdminUsers
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            allLists={allLists}
            allDocs={allDocs}
            username={username}
            deletingUser={deletingUser}
          />
        )}
        {activeTab === "content" && (
          <AdminContent allLists={allLists} allDocs={allDocs} users={users} />
        )}
        {activeTab === "sharing" && (
          <AdminSharing globalSharing={globalSharing} />
        )}
        {activeTab === "settings" && <AppSettingsTab />}
      </div>

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        mode={userModalMode}
        user={selectedUser}
        onSuccess={handleUserModalSuccess}
      />
    </div>
  );
};
