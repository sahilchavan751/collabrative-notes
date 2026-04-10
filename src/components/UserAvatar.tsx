"use client";

import React from "react";

interface UserAvatarProps {
  name: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  showRing?: boolean;
}

export default function UserAvatar({ name, photoURL, size = "md", showRing = false }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const ringClasses = showRing ? "ring-2 ring-purple-500/50 ring-offset-2 ring-offset-[#0a0a0f]" : "";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={`${sizeClasses[size]} ${ringClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${ringClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 font-semibold text-white`}
    >
      {initials}
    </div>
  );
}
