import { useQuery } from "@tanstack/react-query";
import { type Profession } from "@shared/schema";
import { Check, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface ProfessionSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function ProfessionSelector({ selected, onChange, className }: ProfessionSelectorProps) {
  const [search, setSearch] = useState("");

  const { data: professions, isLoading } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });

  const filteredProfessions = useMemo(() => {
    if (!professions) return [];
    return professions.filter((prof) =>
      prof.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, professions]);

  const toggleProfession = (profName: string) => {
    if (selected.includes(profName)) {
      onChange(selected.filter((p) => p !== profName));
    } else {
      onChange([...selected, profName]);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Meslekler yükleniyor...</div>;
  }

  return (
    <div className={className}>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Meslek ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 border rounded-lg">
        {filteredProfessions.map((prof, idx) => {
          const isSelected = selected.includes(prof.name);
          return (
            <motion.div
              key={prof.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.5) }}
            >
              <button
                type="button"
                onClick={() => toggleProfession(prof.name)}
                className={`
                  relative w-full p-3 rounded-xl border text-left transition-all duration-200
                  flex items-center justify-between group
                  ${isSelected 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                  }
                `}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <span className={`font-medium block truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {prof.name}
                  </span>
                </div>
                
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0
                  ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20"}
                `}>
                  {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                </div>
              </button>
            </motion.div>
          );
        })}
        {filteredProfessions.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Meslek bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
