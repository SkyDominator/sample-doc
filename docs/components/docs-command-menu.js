"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

function SearchIcon({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.34-4.34" />
    </svg>
  );
}

export function DocsCommandMenu({ items, className, compact = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      setOpen((prev) => !prev);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const groupedItems = useMemo(() => {
    const groups = new Map();

    for (const item of items ?? []) {
      const key = item.groupLabel ?? "Docs";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    return Array.from(groups.entries());
  }, [items]);

  return (
    <>
      <Button
        className={cn(
          "justify-between rounded-2xl border-slate-200 bg-white/85 text-slate-500 shadow-soft hover:bg-white",
          compact ? "h-10 w-10 rounded-2xl px-0" : "h-11 w-full px-4",
          className
        )}
        onClick={() => setOpen(true)}
        size={compact ? "icon" : "default"}
        variant="outline"
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          {compact ? null : <span>Search docs</span>}
        </span>
        {compact ? null : <span className="text-xs font-medium text-slate-400">⌘K</span>}
      </Button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <Command>
          <CommandInput placeholder="Search pages, guides, and references..." />
          <CommandList>
            <CommandEmpty>No matching page found.</CommandEmpty>
            {groupedItems.map(([groupLabel, groupItems], index) => (
              <div key={groupLabel}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={groupLabel}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.url}
                      onSelect={() => {
                        router.push(item.url);
                        setOpen(false);
                      }}
                      value={`${groupLabel} ${item.title} ${item.description ?? ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{item.title}</p>
                        {item.description ? (
                          <p className="truncate text-xs text-slate-500">{item.description}</p>
                        ) : null}
                      </div>
                      <CommandShortcut className="flex items-center gap-1">
                        <CornerDownLeft aria-hidden="true" className="h-3.5 w-3.5" />
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
