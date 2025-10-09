"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/app/_components/GlobalComponents/Buttons/Button";
import { Dropdown } from "@/app/_components/GlobalComponents/Dropdowns/Dropdown";
import { ProgressBar } from "@/app/_components/GlobalComponents/Statistics/ProgressBar";
import { ExportProgress, ExportResult, User } from "@/app/_types";
import {
  exportAllChecklistsNotes,
  exportUserChecklistsNotes,
  exportAllUsersData,
  exportWholeDataFolder,
  getExportProgress,
} from "@/app/_server/actions/export";

type ExportType =
  | "all_checklists_notes"
  | "user_checklists_notes"
  | "all_users_data"
  | "whole_data_folder";

interface ExportOption {
  id: ExportType;
  title: string;
  description: string;
  requiresUserSelection: boolean;
}

const exportOptions: ExportOption[] = [
  {
    id: "all_checklists_notes",
    title: "All Checklists and Notes",
    description:
      "Exports all checklists and notes created by all users. This will generate a zip file containing JSON data organized by user and category.",
    requiresUserSelection: false,
  },
  {
    id: "user_checklists_notes",
    title: "Specific User's Checklists and Notes",
    description:
      "Select a user from the dropdown to export all checklists and notes belonging to that specific user.",
    requiresUserSelection: true,
  },
  {
    id: "all_users_data",
    title: "All User Account Data",
    description:
      "Exports a JSON file with all user account info (usernames, admin status, etc.). This does NOT include their checklist or note content.",
    requiresUserSelection: false,
  },
  {
    id: "whole_data_folder",
    title: "Entire Data Folder (Backup)",
    description:
      "Exports the entire 'data' folder, including all user content, metadata, and settings. Use with caution as this can be a large file.",
    requiresUserSelection: false,
  },
];

interface ExportContentProps {
  users: User[];
}

export const ExportContent = ({ users }: ExportContentProps) => {
  const [selectedExportType, setSelectedExportType] = useState<ExportType>(
    exportOptions[3].id
  );
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    progress: 0,
    message: "",
  });
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const selectedOption = useMemo(
    () => exportOptions.find((opt) => opt.id === selectedExportType)!,
    [selectedExportType]
  );

  React.useEffect(() => {
    if (!exporting) return;

    const interval = setInterval(async () => {
      const currentProgress = await getExportProgress();
      setProgress(currentProgress);
      if (
        currentProgress.progress === 100 ||
        currentProgress.message.includes("failed")
      ) {
        setExporting(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exporting]);

  const handleExport = async () => {
    setExporting(true);
    setProgress({ progress: 0, message: "Initiating export..." });
    setDownloadUrl(undefined);
    setError(undefined);

    try {
      let result: ExportResult | undefined;
      switch (selectedOption.id) {
        case "all_checklists_notes":
          result = await exportAllChecklistsNotes();
          break;
        case "user_checklists_notes":
          if (!selectedUser) {
            setError("Please select a user to export.");
            setExporting(false);
            return;
          }
          result = await exportUserChecklistsNotes(selectedUser);
          break;
        case "all_users_data":
          result = await exportAllUsersData();
          break;
        case "whole_data_folder":
          result = await exportWholeDataFolder();
          break;
      }

      if (result?.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setProgress({
          progress: 100,
          message: "Export completed successfully.",
        });
      } else {
        setError(result?.error || "Export failed.");
        setProgress({ progress: 100, message: "Export failed." });
      }
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "An unexpected error occurred during export.");
      setProgress({ progress: 100, message: "Export failed due to an error." });
    } finally {
      if (error || !downloadUrl) {
        setExporting(false);
      }
    }
  };

  const isExportDisabled =
    exporting || (selectedOption.requiresUserSelection && !selectedUser);

  return (
    <div className="py-6 bg-card space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Data Export Options</h2>
        <p className="text-muted-foreground">
          Select an export type and download data from your application.
        </p>
      </div>

      <div className="space-y-4 p-6 rounded-lg bg-muted/50 shadow-sm">
        <Dropdown
          onChange={(value) => setSelectedExportType(value as ExportType)}
          value={selectedExportType}
          options={exportOptions.map((opt) => ({
            id: opt.id,
            name: opt.title,
          }))}
          disabled={exporting}
          className="w-full bg-background"
        />

        <p className="text-muted-foreground pt-2 min-h-[40px] font-medium text-sm">
          {selectedOption.description}
        </p>

        {selectedOption.requiresUserSelection && (
          <div className="pt-2">
            <Dropdown
              onChange={setSelectedUser}
              value={selectedUser || ""}
              options={users.map((user) => ({
                id: user.username,
                name: user.username,
              }))}
              disabled={exporting}
              placeholder="Select a user to export"
              className="w-full"
            />
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExportDisabled}
          className="w-full md:w-auto"
        >
          Export Data
        </Button>
      </div>

      {exporting && (
        <div className="space-y-2">
          <ProgressBar progress={progress.progress} />
          <p className="text-sm text-muted-foreground font-medium text-center">
            {progress.message}
          </p>
        </div>
      )}

      {downloadUrl && !exporting && (
        <div className="p-4 border rounded-md bg-secondary text-secondary-foreground text-center text-sm">
          <p>
            Export ready!{" "}
            <a
              href={downloadUrl}
              download
              className="text-primary hover:underline font-medium"
            >
              Click here to download your file.
            </a>
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive text-center">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
};
