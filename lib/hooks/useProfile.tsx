"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

const DEFAULT_PROFILES: Profile[] = [
  { id: "alex", name: "Alex Chen", avatar: "AC", bio: "DevOps Engineer" },
  { id: "sam", name: "Sam Rivera", avatar: "SR", bio: "Backend Developer" },
  { id: "morgan", name: "Morgan Lee", avatar: "ML", bio: "Platform Engineer" },
];

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  createProfile: (name: string, bio: string) => Profile;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("activeProfileId");
    if (stored) {
      const found = DEFAULT_PROFILES.find((p) => p.id === stored);
      if (found) setActiveProfileState(found);
    } else {
      setActiveProfileState(DEFAULT_PROFILES[0]);
    }
  }, []);

  const setActiveProfile = (profile: Profile) => {
    setActiveProfileState(profile);
    localStorage.setItem("activeProfileId", profile.id);
  };

  const createProfile = (name: string, bio: string): Profile => {
    const newProfile: Profile = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      avatar: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      bio,
    };
    return newProfile;
  };

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfile, createProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
