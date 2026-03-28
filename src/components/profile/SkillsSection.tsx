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
import { candidateApi } from '@/apis/user';
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

export default function SkillsSection({ data, onSave }: SkillsSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const [currentSkill, setCurrentSkill] = useState<any>({
    name: '',
    skill_id: null,
    proficiency: 'INTERMEDIATE',
    years_experience: 0,
    is_primary: false
  });

  // ✅ Backend se skills search karo
  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await candidateApi.searchSkills(query);
      const list = results?.results ?? results ?? [];
      setSearchResults(list);
    } catch {
      setSearchResults([]);
    }
  };

  const handleOpenAddForm = async (skillName: string, skillId?: number) => {
    setCurrentSkill({
      name: skillName,
      skill_id: skillId || null,
      proficiency: 'INTERMEDIATE',
      years_experience: 0,
      is_primary: false,
      isEdit: false
    });
    setIsAddOpen(false);
    setSearch('');
    setSearchResults([]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (skill: Skill) => {
    setCurrentSkill({
      ...skill,
      name: (skill as any).skill_name || skill.name,
      isEdit: true
    });
    setIsFormOpen(true);
  };

  const handleFinalSave = async () => {
    try {
      let savedSkill: Skill;
      const payload = {
        skill_id: currentSkill.skill_id,
        name: currentSkill.skill_id ? undefined : currentSkill.name,
        proficiency: currentSkill.proficiency,
        years_experience: parseFloat(currentSkill.years_experience) || 0,
        is_primary: currentSkill.is_primary
      };

      if (currentSkill.isEdit) {
        savedSkill = await candidateApi.updateSkill(currentSkill.id, payload);
        onSave(data.map(s => s.id === currentSkill.id ? savedSkill : s));
        toast({ title: "Skill updated" });
      } else {
        savedSkill = await candidateApi.addSkill(payload);
        onSave([...data, savedSkill]);
        toast({ title: "Skill added successfully" });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({ title: "Failed to save skill", variant: "destructive" });
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await candidateApi.deleteSkill(skillId);
      onSave(data.filter(s => s.id !== skillId));
      setIsFormOpen(false);
      toast({ title: "Skill removed", variant: "destructive" });
    } catch (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  return (
    <SectionCard
      title="Skills"
      description="Manage your expertise and proficiency levels."
      actions={
        <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
          <PopoverTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
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
                    <div
                      className="p-2 cursor-pointer hover:bg-slate-100 text-sm"
                      onClick={() => handleOpenAddForm(search)}
                    >
                      Add "{search}"
                    </div>
                  )}
                </CommandEmpty>
                {/* ✅ Backend se real skills */}
                {searchResults.length > 0 && (
                  <CommandGroup heading="Results">
                    {searchResults
                      .filter(s => !data.some(d => ((d as any).skill_name || d.name) === s.name))
                      .map((skill: any) => (
                        <CommandItem
                          key={skill.id}
                          onSelect={() => handleOpenAddForm(skill.name, skill.id)}
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
      {/* Skill Details Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSkill.isEdit ? 'Edit Skill' : 'Add Skill Details'}</DialogTitle>
            <DialogDescription>Set proficiency and experience for {currentSkill.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proficiency" className="text-right">Level</Label>
              <Select
                value={currentSkill.proficiency}
                onValueChange={(val) => setCurrentSkill({...currentSkill, proficiency: val})}
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
              <Label htmlFor="experience" className="text-right">Years</Label>
              <Input
                id="experience"
                type="number"
                step="0.5"
                className="col-span-3"
                value={currentSkill.years_experience}
                onChange={(e) => setCurrentSkill({...currentSkill, years_experience: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="primary">Mark as Primary</Label>
              <Switch
                id="primary"
                checked={currentSkill.is_primary}
                onCheckedChange={(val) => setCurrentSkill({...currentSkill, is_primary: val})}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {currentSkill.isEdit && (
              <Button variant="destructive" onClick={() => handleRemoveSkill(currentSkill.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
            <Button onClick={handleFinalSave}>Save Skill</Button>
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