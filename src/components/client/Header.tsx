"use client";

import React, { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [greeting, setGreeting] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (!mounted) return null;

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">CodeNexus</h1>
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || "User avatar"}
                />
                <AvatarFallback>
                  {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {greeting},{" "}
                <span className="font-medium text-foreground">
                  {session.user.name}
                </span>
              </p>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">Login</Link>
              <Button variant="default">
                {" "}
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
