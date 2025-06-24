"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Code2, Rocket, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Space_Grotesk } from "next/font/google"
import { Navigation } from "./Navigation"
import Link from "next/link"
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export default function HomePage() {
  const scrollToForm = () => {
    document.getElementById("deploy-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div 
    style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%), #000000",
      }}
    className={cn( spaceGrotesk.className ,"h-screen bg-zinc-950 text-white overflow-hidden") }>


      {/* Hero Section - First Screen */}
      <section className="relative h-screen flex items-center justify-center pt-10 px-4">
        <div className="max-w-5xl mx-auto text-center ">
          {/* Badge */}
          <Badge className="mb-6 bg-blue-500/10 cursor-pointer text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm">
            <Sparkles className="h-3 w-3 mr-1 " />
            Built with 
            <span className="text-lg bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent font-bold">Bolt.new</span>
            and WebContainer
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent leading-tight tracking-tight">
            Deploy, Build &{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Ship</span>
            <br />
            React Projects
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Built by developers, loved by teams. Deploy from GitHub or upload directly with real-time build logs , code Editor and
            interactive terminal.
          </p>

          {/* CTA Buttons */}
          <Link
            href="/deploy"
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-blue-600  cursor-pointer hover:bg-blue-700 text-white px-8 py-4 text-base font-semibold"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Deploying
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">10+</div>
              <div className="text-zinc-500 text-sm">Projects Deployed</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-1">&lt; 20s</div>
              <div className="text-zinc-500 text-sm">Deploy Time</div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}
