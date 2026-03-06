import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileSection, ProfileSectionId } from "@/lib/types";

interface ProfileSidebarProps {
  sections: ProfileSection[];
  activeSection: ProfileSectionId;
  setActiveSection: (section: ProfileSectionId) => void;
  completion: number;
}

export default function ProfileSidebar({ sections, activeSection, setActiveSection, completion }: ProfileSidebarProps) {
  return (
    <aside className="w-full sm:w-64 sticky top-10 h-fit">
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <div className="mb-4 px-1">
            <h3 className="font-semibold text-sm mb-2">Profile Completion</h3>
            <div className="flex items-center gap-3">
              <Progress value={completion} className="w-full" />
              <span className="text-xs font-semibold text-muted-foreground">{completion}%</span>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {sections.map(section => (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "justify-start",
                  activeSection === section.id && "bg-secondary text-primary font-semibold"
                )}
              >
                {section.title}
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
