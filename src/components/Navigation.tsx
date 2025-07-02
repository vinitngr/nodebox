"use client";

import { Button } from "@/components/ui/button";
import {
  CloudUpload,
  Github,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SelectSeparator } from "./ui/select";
export function Navigation() {
  const [stars, setStars] = useState<number | null>(null);
  const head = useRouter().push;
  const pathname = usePathname();
  useEffect(() => {
    fetch("https://api.github.com/repos/vinitngr/nodebox")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
console.log(session);
  const btnClass = (path: string) =>
    `font-mono transition-colors cursor-pointer ${
      pathname === path
        ? "text-white bg-zinc-500/20 px-2 py-1 rounded"
        : "text-zinc-400 hover:text-white"
    }`;

  return (
    <nav className="fixed top-0  before-nav m-auto max-w-[95%] md:max-w-[80%] py-1 my-3 rounded-2xl  left-0 right-0 z-50 bg-zinc-900/60 border backdrop-blur-lg shadow border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button className="flex items-center gap-2">
            <span
              className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-bold text-lg font-mono"
              onClick={() => router.push("/")}
            >
              Nodebox
            </span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex  items-center gap-8">
            <button
              onClick={() => head("/")}
              className="bg-gradient-to-r from-blue-500 to-pink-600 bg-clip-text text-transparent font-mono"
            >
              Welcome!
            </button>
            <button
              onClick={() => head("/deploy")}
              className={btnClass("/deploy")}
            >
              Deploy
            </button>
            <button
              onClick={() => head("/dashboard")}
              className={btnClass("/dashboard")}
            >
              dashboard
            </button>
            <button
              onClick={() => head("/community")}
              className={btnClass("/community")}
            >
              Explore
            </button>
            <button
              onClick={() => window.open("https://netlify.vinitngr.xyz")}
              className="text-zinc-400 hover:text-white transition-colors font-mono"
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-900  font-mono flex items-center"
              onClick={() =>
                window.open(
                  "https://github.com/vinitngr/nodebox",
                  "_blank"
                )
              }
            >
              <Github className="h-4 w-4 mr-2" />
              {stars !== null && <span>{stars || 1}</span>}
            </Button>
            <div className="relative">
              {session === undefined ? null : session ? (
                <>
                  <button
                    onClick={() => setOpen(!open)}
                    className="focus:outline-none"
                    aria-label="Profile menu"
                  >
                    <img
                      src={session.user?.image || "/placeholder.jpg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  </button>

                  {open && (
                    <div
                      className="absolute -right-8 mt-5 cursor-pointer rounded-lg p-2 bg-zinc-950  border border-gray-800 shadow-lg z-10"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-full text-left text-sm px-4 py-2 text-gray-200 flex flex-col hover:bg-zinc-900 hover:text-white">
                        <span>{session.user?.name}</span>
                        <span>{session.user?.email}</span>
                      </div>
                      <button
                        onClick={() => router.push("/")}
                        className="w-full cursor-pointer text-left px-4 py-2 text-gray-200 hover:bg-zinc-900 hover:text-white flex justify-between items-center"
                      >
                        <span>Home</span>
                        <HomeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full cursor-pointer text-left px-4 py-2 text-gray-200 hover:bg-zinc-900 hover:text-white flex justify-between items-center"
                      >
                        <span>Dashboard</span>
                        <LayoutDashboardIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push("/deploy")}
                        className="w-full cursor-pointer text-left px-4 py-2 text-gray-200 hover:bg-zinc-900 hover:text-white flex justify-between items-center"
                      >
                        <span>Deploy</span>
                        <CloudUpload className="h-4 w-4" />
                      </button>
                      <SelectSeparator className="bg-gray-700 mx-2" />
                      <button
                        onClick={() => signOut()}
                        className="w-full cursor-pointer text-left px-4 py-2 text-gray-200 hover:text-red-600 flex justify-between items-center"
                      >
                        <span>Sign Out</span>
                        <LogOutIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-mono px-3 py-1 rounded"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
