"use client";

import React, { useState } from 'react';
import type { Skill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, X, Lightbulb, Star, Trash2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { mockSkillsList } from '@/lib/mockData';
import { saveSkills } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface SkillsSectionProps {
  data: Skill[];
  onSave: (data: Skill[]) => void;
}

export default function SkillsSection({ data, onSave }: SkillsSectionProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const handleSelectSkill = (skillName: string) => {
    if (!data.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      const newSkill: Skill = {
        id: Date.now(),
        name: skillName,
        proficiency: 'Intermediate',
      };
      const newData = [...data, newSkill];
      onSave(newData);
      saveSkills(newData).then(() => {
        toast({ title: `Added skill: ${skillName}` });
      });
    }
    setSearch('');
    setOpen(false);
  };

  const handleUpdateSkill = (updatedSkill: Skill) => {
    const newData = data.map(s => s.id === updatedSkill.id ? updatedSkill : s);
    onSave(newData);
     saveSkills(newData).then(() => {
        toast({ title: "Skill updated" });
    });
  }

  const handleRemoveSkill = (skillId: number) => {
    const newData = data.filter(s => s.id !== skillId);
    onSave(newData);
    saveSkills(newData).then(() => {
        toast({ title: "Skill removed", variant: "destructive" });
    });
  };

  const filteredSkills = mockSkillsList.filter(
    (skill) => !data.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
  );

  return (
    <SectionCard
      title="Skills"
      description="Highlight your key abilities and proficiencies."
      actions={
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput 
                placeholder="Type a skill..." 
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {search && <CommandItem onSelect={() => handleSelectSkill(search)}>Add "{search}" as a new skill</CommandItem>}
                  {!search && "Type to search for skills."}
                </CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {filteredSkills.map(skill => (
                    <CommandItem key={skill.id} onSelect={() => handleSelectSkill(skill.name)}>
                      {skill.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
    >
      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map(skill => (
            <Popover key={skill.id}>
              <PopoverTrigger asChild>
                <Badge variant={skill.is_primary ? "default" : "secondary"} className="text-base py-1 px-3 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    {skill.is_primary && <Star className="mr-2 h-3 w-3 fill-current" />}
                    {skill.name}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{skill.name}</h4>
                    <p className="text-sm text-muted-foreground">Edit skill details.</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`proficiency-${skill.id}`}>Proficiency</Label>
                      <Select 
                        defaultValue={skill.proficiency}
                        onValueChange={(value: string) => handleUpdateSkill({ ...skill, proficiency: value as Skill['proficiency'] })}
                      >
                        <SelectTrigger id={`proficiency-${skill.id}`} className="col-span-2 h-8">
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`experience-${skill.id}`}>Experience</Label>
                      <Input
                        id={`experience-${skill.id}`}
                        type="number"
                        defaultValue={skill.years_experience}
                        onChange={(e) => handleUpdateSkill({...skill, years_experience: parseInt(e.target.value)})}
                        className="col-span-2 h-8"
                        placeholder="Years"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id={`primary-${skill.id}`} checked={skill.is_primary} onCheckedChange={(checked) => handleUpdateSkill({...skill, is_primary: checked})} />
                        <Label htmlFor={`primary-${skill.id}`}>Primary skill</Label>
                    </div>
                  </div>
                   <div className="flex justify-end">
                     <Button variant="destructive" size="sm" onClick={() => handleRemoveSkill(skill.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                     </Button>
                   </div>
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No skills added</h3>
            <p className="mt-1 text-sm text-muted-foreground">Showcase your expertise by adding your skills.</p>
        </div>
      )}
    </SectionCard>
  );
}
