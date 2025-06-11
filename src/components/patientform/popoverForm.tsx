import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Status Popover
export function StatusPopover({
  open, setOpen, statusValue, setStatusValue
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  statusValue: string;
  setStatusValue: (v: string) => void;
}) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-[52px] px-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-blue-50"
        >
          <span className="text-left text-black">
            {statusValue === "1" ? "นักศึกษา" :
              statusValue === "2" ? "บุคคลากร" :
              statusValue === "3" ? "บุคคลภายนอก" :
              <span className="text-gray-500">โปรดระบุสถานะ</span>}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            <CommandItem onSelect={() => { setStatusValue("1"); setOpen(false); }}>
              <div className="flex items-center gap-2">
                <Check className={cn("h-4 w-4", statusValue === "1" ? "opacity-100" : "opacity-0")} />
                นักศึกษา
              </div>
            </CommandItem>
            <CommandItem onSelect={() => { setStatusValue("2"); setOpen(false); }}>
              <div className="flex items-center gap-2">
                <Check className={cn("h-4 w-4", statusValue === "2" ? "opacity-100" : "opacity-0")} />
                บุคคลากร
              </div>
            </CommandItem>
            <CommandItem onSelect={() => { setStatusValue("3"); setOpen(false); }}>
              <div className="flex items-center gap-2">
                <Check className={cn("h-4 w-4", statusValue === "3" ? "opacity-100" : "opacity-0")} />
                บุคคลภายนอก
              </div>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Symptoms Popover
export function SymptomsPopover({
  open, setOpen, symptoms, selectedSymptoms, toggleSymptom
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  symptoms: { symptom_id: string; symptom_name: string }[];
  selectedSymptoms: number[];
  toggleSymptom: (id: string) => void;
}) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-start min-h-[52px] flex flex-wrap items-start gap-1.5 py-2 px-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-blue-50"
        >
          <span className="flex flex-wrap gap-1 items-center w-full">
            {selectedSymptoms.length === 0 ? (
              <span className="text-gray-500">เลือกอาการ...</span>
            ) : (
              symptoms
                .filter((s) => selectedSymptoms.includes(Number(s.symptom_id)))
                .map((s) => (
                  <span key={s.symptom_id} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full transition-all hover:bg-blue-200">
                    {s.symptom_name}
                  </span>
                ))
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50 shrink-0" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            {symptoms.map((symptom) => (
              <CommandItem
                key={symptom.symptom_id}
                onSelect={() => toggleSymptom(symptom.symptom_id)}
              >
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedSymptoms.includes(Number(symptom.symptom_id))
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {symptom.symptom_name}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
