"use client";

import React from "react";

interface UserAvatarProps {
  name: string;
  photoURL?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  style?: React.CSSProperties;
}

export default function UserAvatar({ name, photoURL, size = "md", showRing = false, style }: UserAvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  const ringClasses = showRing ? "ring-2 ring-accent-purple/30 ring-offset-2 ring-offset-background" : "";

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
        style={style}
        className={`${sizeClasses[size]} ${ringClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        backgroundColor: "var(--accent-purple)",
        color: "var(--background)",
      }}
      className={`${sizeClasses[size]} ${ringClasses} flex items-center justify-center rounded-full font-bold`}
    >
      {initials}
    </div>
  );
}
