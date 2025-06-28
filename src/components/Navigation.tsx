"use client"

import { Button } from "@/components/ui/button"
import { CloudUpload, Github, HomeIcon, LayoutDashboardIcon, LogOutIcon, Zap } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SelectSeparator } from "./ui/select";
export function Navigation() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/HostThrough/hostthrough")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const head = (where: string) => {
    const protectedRoutes = ['/deploy', '/dashboard']
    if (protectedRoutes.includes(where)) {
      if (session) router.push(where)
      else router.replace('/auth/signin')
    } else {
      router.push(where)
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg font-mono" onClick={() => router.push("/")}>HostThrough</span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => head("/")} className="bg-gradient-to-r from-blue-500 to-pink-600 bg-clip-text text-transparent font-mono">
              Welcome!
            </button>
            <button onClick={() => head("/deploy")} className="text-zinc-400 hover:text-white transition-colors font-mono">
              Deploy
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors font-mono" onClick={() => head("/dashboard")}>dashboard</button>
            <button className="text-zinc-400 hover:text-white transition-colors font-mono" onClick={() => head("/community")}>Community</button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-mono flex items-center"
              onClick={() => window.open("https://github.com/HostThrough/hostthrough/stargazers", "_blank")}
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
                      className="absolute right-0 mt-2 cursor-pointer bg-zinc-950  border border-gray-700 rounded shadow-lg z-10"
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
  )
}
