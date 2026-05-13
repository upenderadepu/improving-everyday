"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, GitBranch, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "./SearchDialog";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export function TopNav({ onSidebarToggle, sidebarOpen }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { profiles, activeProfile, setActiveProfile } = useProfile();

  // Global keyboard shortcut for search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-zinc-800 flex items-center gap-3 px-4 bg-zinc-950 sticky top-0 z-40 shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <GitBranch className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-white hidden sm:block">DevOps Learn</span>
        </Link>

        {/* Sidebar toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSidebarToggle}
          className="text-zinc-500"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-sm flex items-center gap-2 px-3 h-8 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-sm text-zinc-500 transition-colors group"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs truncate">Search lessons…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-zinc-600 font-mono">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Profile switcher */}
        {activeProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 text-zinc-300 hover:text-white">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {activeProfile.avatar}
                </div>
                <span className="hidden sm:block text-xs">{activeProfile.name}</span>
                <ChevronDown className="h-3 w-3 text-zinc-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
              <DropdownMenuLabel className="text-xs text-zinc-500 font-normal">Switch Profile</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => setActiveProfile(profile)}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {profile.avatar}
                  </div>
                  <div>
                    <div className="text-zinc-200 text-xs">{profile.name}</div>
                    <div className="text-zinc-600 text-[10px]">{profile.bio}</div>
                  </div>
                  {activeProfile.id === profile.id && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
