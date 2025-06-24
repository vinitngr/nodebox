"use client"

import { Button } from "@/components/ui/button"
import { Github, Zap } from "lucide-react"
import { useRouter } from "next/navigation";
export function Navigation() {

  const router = useRouter();
  const scrollToForm = () => {
    document.getElementById("deploy-section")?.scrollIntoView({ behavior: "smooth" })
  }


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg font-mono" onClick={() => router.push("/")}>HostThrough</span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => router.push("/")} className="bg-gradient-to-r from-blue-500 to-pink-600 bg-clip-text text-transparent font-mono">
              Welcome!
            </button>
            <button onClick={() => router.push("/deploy")} className="text-zinc-400 hover:text-white transition-colors font-mono">
              Deploy
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors font-mono" onClick={() => router.push("/dashboard")}>My-Projects</button>
            <button className="text-zinc-400 hover:text-white transition-colors font-mono" onClick={() => router.push("/community")}>Community</button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-mono">
              <Github className="h-4 w-4 mr-2" />
            </Button>

            <Button variant={"ghost"} onClick={scrollToForm} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-mono">
              SignIn
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
