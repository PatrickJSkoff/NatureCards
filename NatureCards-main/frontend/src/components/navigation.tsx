"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRound, UsersRound, Compass, BookImage, MessageCircleHeart } from "lucide-react";
import { userState } from "@/lib/gallery";

interface NavElementProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavElement = ({ href, icon, label }: NavElementProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center font-medium justify-center p-0 text-muted-foreground transition-all duration-300",
        isActive && "text-[#9fb873]"
      )}
    >
      <div className="w-[50px] h-[50px] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs mt-0">{label}</span>
    </Link>
  );
};

export function Navigation({ userId }: { userId: string }) {
  useEffect(() => {
    // Only initialize the userId in localStorage when:
    // 1. A valid userId is provided (likely from server-side props or authentication)
    // 2. There's no userId already in the userState
    // This prevents overwriting the authenticated user's ID when viewing other users' content
    const userIdInLocalStorage = userState.userId;
    
    if (userId && !userIdInLocalStorage) {
      // This is an initial login or session restoration
      userState.setUserId(userId);
    }
  }, [userId]);
  
  return (
    <nav className="flex fixed bottom-0 w-full items-center justify-around bg-background border-t border-border py-2">
      <NavElement href="/social" icon={<UsersRound size={28} />} label="Social" />
      <NavElement href="/feed" icon={<MessageCircleHeart size={28} />} label="Feed" />
      <NavElement href="/" icon={<Compass size={28} />} label="Adventure" />
      <NavElement href="/gallery" icon={<BookImage size={28} />} label="Gallery" />
      <NavElement href="/user" icon={<UserRound size={28} />} label="User" />
    </nav>
  );
} 