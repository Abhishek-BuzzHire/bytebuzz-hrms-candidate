"use client";

import React, { useState } from 'react';
import type { Skill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Lightbulb, Star, Trash2, Edit } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { candidateApi } from '@/apis/user/route';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface SkillsSectionProps {
  data: Skill[];
  onSave: (data: Skill[]) => void;
}

const PROFICIENCY_OPTIONS = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Expert', value: 'EXPERT' },
];

const DEFAULT_SKILL_FORM = {
  name: '',
  skill_id: null,
  proficiency: 'INTERMEDIATE',
  years_experience: 0,
  is_primary: false,
};

export default function SkillsSection({ data, onSave }: SkillsSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [currentSkill, setCurrentSkill] = useState<any>(DEFAULT_SKILL_FORM);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await candidateApi.searchSkills(query);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    }
  };

  // ── Add: save immediately with defaults, no form popup ───────────────────
  const handleAddSkill = async (skillName: string, skillId?: number) => {
    setPopoverOpen(false);
    setSearch('');
    setSearchResults([]);
    setIsAdding(true);

    try {
      const payload = {
        skill_id: skillId || null,
        name: skillId ? undefined : skillName,
        proficiency: 'INTERMEDIATE',
        years_experience: 0,
        is_primary: false,
      };
      const savedSkill: Skill = await candidateApi.addSkill(payload);
      onSave([...data, savedSkill]);
      toast({ title: "Skill added" });
    } catch {
      toast({ title: "Failed to add skill", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  // ── Edit: open form pre-filled ────────────────────────────────────────────
  const handleOpenEditForm = (skill: Skill) => {
    setCurrentSkill({
      ...skill,
      name: (skill as any).skill_name || skill.name,
      isEdit: true,
    });
    setIsFormOpen(true);
  };

  // ── Save edits ────────────────────────────────────────────────────────────
  const handleFinalSave = async () => {
    try {
      const payload = {
        skill_id: currentSkill.skill_id,
        name: currentSkill.skill_id ? undefined : currentSkill.name,
        proficiency: currentSkill.proficiency,
        years_experience: parseFloat(currentSkill.years_experience) || 0,
        is_primary: currentSkill.is_primary,
      };

      const savedSkill: Skill = await candidateApi.updateSkill(currentSkill.id, payload);
      onSave(data.map(s => s.id === currentSkill.id ? savedSkill : s));
      toast({ title: "Skill updated" });
      setIsFormOpen(false);
    } catch {
      toast({ title: "Failed to save skill", variant: "destructive" });
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await candidateApi.deleteSkill(skillId);
      onSave(data.filter(s => s.id !== skillId));
      setIsFormOpen(false);
      toast({ title: "Skill removed", variant: "destructive" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  return (
    <SectionCard
      title="Skills"
      description="Manage your expertise and proficiency levels."
      actions={
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button disabled={isAdding}>
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? 'Adding...' : 'Add Skill'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput
                placeholder="Search skills..."
                value={search}
                onValueChange={handleSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {search && (
                    <button
                      type="button"
                      onClick={() => handleAddSkill(search)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Add "{search}"</span>
                    </button>
                  )}
                </CommandEmpty>
                {searchResults.length > 0 && (
                  <CommandGroup heading="Results">
                    {searchResults
                      .filter(s => !data.some(d => ((d as any).skill_name || d.name) === s.name))
                      .map((skill: any) => (
                        <CommandItem
                          key={skill.id}
                          onSelect={() => handleAddSkill(skill.name, skill.id)}
                        >
                          {skill.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
    >
      {/* Edit-only dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>Update proficiency and experience for {currentSkill.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Level</Label>
              <Select
                value={currentSkill.proficiency}
                onValueChange={(val) => setCurrentSkill({ ...currentSkill, proficiency: val })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Years</Label>
              <Input
                type="number"
                step="0.5"
                className="col-span-3"
                value={currentSkill.years_experience}
                onChange={(e) => setCurrentSkill({ ...currentSkill, years_experience: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Label>Mark as Primary</Label>
              <Switch
                checked={currentSkill.is_primary}
                onCheckedChange={(val) => setCurrentSkill({ ...currentSkill, is_primary: val })}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={() => handleRemoveSkill(currentSkill.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button onClick={handleFinalSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-2">
        {data.length > 0 ? data.map(skill => (
          <Badge
            key={skill.id}
            variant={skill.is_primary ? "default" : "secondary"}
            className="text-base py-1 px-3 cursor-pointer hover:bg-primary hover:text-white transition-all"
            onClick={() => handleOpenEditForm(skill)}
          >
            {skill.is_primary && <Star className="mr-2 h-3 w-3 fill-current" />}
            {(skill as any).skill_name || skill.name}
            <Edit className="ml-2 h-3 w-3 opacity-50" />
          </Badge>
        )) : (
          <div className="w-full text-center py-10 border-2 border-dashed rounded-lg">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Click 'Add Skill' to build your profile.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}