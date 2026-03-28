"use client";
import { accountApi } from '@/apis/user';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, KeyRound, Eye, EyeOff, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UserProfilePopover() {
  const router = useRouter();
  const { user } = useAuth();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Updated: "JD" removed, falls back to "U" if no name
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const handleSubmit = async () => {
    setError("");
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await accountApi.changePassword(form);
      setChangePasswordOpen(false);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className="text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#2563eb)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </PopoverTrigger>

        <PopoverContent side="bottom" align="end" className="w-72 p-0 shadow-xl rounded-xl overflow-hidden">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3 bg-blue-50 border-b">
            <Avatar className="w-12 h-12">
              <AvatarFallback
                className="text-white text-lg font-bold"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#2563eb)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              {/* Updated: Mock names removed */}
              <p className="font-semibold text-sm">{user?.username || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>

          {/* User ID & Role */}
          <div className="px-4 py-3 border-b space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">User ID</span>
              <span className="text-xs font-semibold">{user?.id || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Role</span>
              {/* Updated: "Candidate" removed, using dynamic role */}
              <span className="text-xs font-semibold capitalize">{user?.role || "Member"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-secondary/80 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              Change Password
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
            <DialogDescription>
              Update your account password to keep it secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="pl-10 pr-10"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="pl-10 pr-10"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
              onClick={() => setChangePasswordOpen(false)}
            >
              Cancel
            </button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}
            >
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}