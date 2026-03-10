import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import Link from "next/link";

interface ProfileSidebarSetterProps {
    completion: number;
}

export default function ProfileSidebarStepper({ completion }: ProfileSidebarSetterProps) {
    return (
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
                <span>Profile Completion</span>
                <span className="text-primary">{completion}%</span>
            </div>
            <Progress value={completion} className="h-1.5" />
            <Button variant="link" asChild className="p-0 h-auto text-xs">
                <Link href="/dashboard/profile/edit">Complete your profile →</Link>
            </Button>
        </div>
    );
}
