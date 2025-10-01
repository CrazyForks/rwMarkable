import { Info, Shield } from "lucide-react";
import { MigrationHeader } from "./MigrationHeader";
import { InfoCard } from "@/app/_components/GlobalComponents/Cards/InfoCard";
import { InfoCardVariant } from "@/app/_components/GlobalComponents/Cards/InfoCard";

export const AdminRequiredView = () => (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
            <MigrationHeader
                icon={<Shield className="h-12 w-12 text-amber-600" />}
                title="Admin Access Required"
                description="This migration requires administrator privileges. Please contact an administrator to perform the system migration."
            />
            <InfoCard
                icon={<Info className="h-5 w-5 text-amber-600" />}
                title="What&apos;s happening?"
                variant={InfoCardVariant.WARNING}
            >
                <p>The system needs to migrate your notes from the old &quot;docs&quot; folder to the new &quot;notes&quot; folder. This is a one-time process that requires administrator access.</p>
            </InfoCard>
        </div>
    </div>
);