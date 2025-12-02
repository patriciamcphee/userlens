import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  ChevronsUpDown, 
  Plus, 
  Users,
  Crown,
  Settings
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Badge } from "./ui/badge";

interface Team {
  id: string;
  name: string;
  icon: string;
  color: string;
  role: 'lead' | 'member';
  projectCount: number;
}

interface TeamSwitcherProps {
  teams: Team[];
  currentTeam: Team | null;
  onTeamChange: (team: Team | null) => void;
  isCollapsed?: boolean;
  showAllTeamsOption?: boolean;
}

export function TeamSwitcher({ 
  teams, 
  currentTeam, 
  onTeamChange, 
  isCollapsed = false,
  showAllTeamsOption = true 
}: TeamSwitcherProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const teamsAsLead = teams.filter(t => t.role === 'lead');
  const teamsAsMember = teams.filter(t => t.role === 'member');

  if (isCollapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title={currentTeam ? currentTeam.name : "All Teams"}
          >
            {currentTeam ? (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ backgroundColor: `${currentTeam.color}20` }}
              >
                {currentTeam.icon}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start" side="right">
          <Command>
            <CommandInput placeholder="Search teams..." />
            <CommandList>
              <CommandEmpty>No teams found.</CommandEmpty>
              
              {showAllTeamsOption && (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onTeamChange(null);
                      setOpen(false);
                    }}
                  >
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center mr-2">
                      <Users className="w-3 h-3 text-slate-600" />
                    </div>
                    <span>All Teams</span>
                    {!currentTeam && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                </CommandGroup>
              )}

              {teamsAsLead.length > 0 && (
                <CommandGroup heading="Teams You Lead">
                  {teamsAsLead.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => {
                        onTeamChange(team);
                        setOpen(false);
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center mr-2 text-sm"
                        style={{ backgroundColor: `${team.color}20` }}
                      >
                        {team.icon}
                      </div>
                      <span className="flex-1">{team.name}</span>
                      <Crown className="w-3 h-3 text-amber-500 mr-2" />
                      {currentTeam?.id === team.id && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {teamsAsMember.length > 0 && (
                <CommandGroup heading="Teams You're On">
                  {teamsAsMember.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => {
                        onTeamChange(team);
                        setOpen(false);
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center mr-2 text-sm"
                        style={{ backgroundColor: `${team.color}20` }}
                      >
                        {team.icon}
                      </div>
                      <span className="flex-1">{team.name}</span>
                      {currentTeam?.id === team.id && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    navigate("/app/teams");
                    setOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Teams
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    navigate("/app/teams?create=true");
                    setOpen(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2"
        >
          <div className="flex items-center gap-3">
            {currentTeam ? (
              <>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${currentTeam.color}20` }}
                >
                  {currentTeam.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{currentTeam.name}</p>
                  <p className="text-xs text-slate-500">{currentTeam.projectCount} projects</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">All Teams</p>
                  <p className="text-xs text-slate-500">{teams.reduce((sum, t) => sum + t.projectCount, 0)} projects</p>
                </div>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            
            {showAllTeamsOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onTeamChange(null);
                    setOpen(false);
                  }}
                  className="py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">All Teams</p>
                    <p className="text-xs text-slate-500">View all your projects</p>
                  </div>
                  {!currentTeam && <Check className="h-4 w-4 text-indigo-600" />}
                </CommandItem>
              </CommandGroup>
            )}

            {teamsAsLead.length > 0 && (
              <CommandGroup heading="Teams You Lead">
                {teamsAsLead.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => {
                      onTeamChange(team);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg shrink-0"
                      style={{ backgroundColor: `${team.color}20` }}
                    >
                      {team.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{team.name}</p>
                        <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500">{team.projectCount} projects</p>
                    </div>
                    {currentTeam?.id === team.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {teamsAsMember.length > 0 && (
              <CommandGroup heading="Teams You're On">
                {teamsAsMember.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => {
                      onTeamChange(team);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg shrink-0"
                      style={{ backgroundColor: `${team.color}20` }}
                    >
                      {team.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      <p className="text-xs text-slate-500">{team.projectCount} projects</p>
                    </div>
                    {currentTeam?.id === team.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  navigate("/app/teams");
                  setOpen(false);
                }}
                className="py-2"
              >
                <Settings className="w-4 h-4 mr-3 text-slate-500" />
                <span>Manage Teams</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  navigate("/app/teams?create=true");
                  setOpen(false);
                }}
                className="py-2"
              >
                <Plus className="w-4 h-4 mr-3 text-slate-500" />
                <span>Create Team</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Example usage with mock data
export const mockTeamsForSwitcher = [
  { id: "1", name: "UX Research", icon: "🔬", color: "#4F46E5", role: "lead" as const, projectCount: 12 },
  { id: "2", name: "Mobile Team", icon: "📱", color: "#2563EB", role: "member" as const, projectCount: 6 },
  { id: "3", name: "Growth", icon: "🚀", color: "#16A34A", role: "member" as const, projectCount: 8 },
  { id: "4", name: "Enterprise", icon: "🏢", color: "#9333EA", role: "lead" as const, projectCount: 4 },
];