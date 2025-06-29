"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Edit, Settings, ExternalLink, Calendar, Clock, Plus, Search, Recycle, RotateCcw, Delete, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { projects } from "@/data/fakeData"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
export function ProjectDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  return (
    <div className="min-h-screen mt-5 bg-zinc-950 text-white p-4">
      <div className="max-w-7xl mx-auto pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome , {session?.user?.name}</h1>
            <p className="text-zinc-400">Manage and monitor your deployed applications</p>
          </div>
          
          <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium transition flex items-center justify-center  hover:opacity-90"
            onClick={() => router.push("/deploy")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-zinc-700">
            {projects.length} Projects
          </Badge>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-zinc-900/40 border border-zinc-800 text-white hover:border-gray-600 transition-colors rounded-xl p-3 space-y-3"
            >
              <CardHeader className="p-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-white">{project.name}</CardTitle>
                      <p className="text-xs text-zinc-400">{project.description}</p>
                    </div>
                  </div>
                  <Badge
                    className={`px-2 py-0.5 text-xs rounded-md border ${project.status === "live"
                        ? "bg-green-900 text-green-300 border-green-800"
                        : project.status === "building"
                          ? "bg-yellow-900 text-yellow-300 border-yellow-800"
                          : "bg-red-900 text-red-300 border-red-800"
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1 inline-block ${project.status === "live"
                          ? "bg-green-400"
                          : project.status === "building"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                    />
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 p-0">
                <div className="bg-zinc-800/60 rounded-md px-3 py-2">
                  <p className="text-[10px] text-zinc-500 mb-0.5">URL</p>
                  <p className="text-sm font-medium truncate">https://{project.url}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-800/60 rounded-md px-3 py-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">Deployed</span>
                    </div>
                    <p className="text-sm font-medium">{project.deployedAt}</p>
                  </div>
                  <div className="bg-zinc-800/60 rounded-md px-3 py-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">Build Time</span>
                    </div>
                    <p className="text-sm font-medium">{project.buildTime}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white px-2 py-1 h-7 text-xs" > <ExternalLink className="h-3 w-3 mr-1" />
                    Visit 
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-2 py-1"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    text-zinc-300variant="outline"
                    className="border-zinc-700 bg-zinc-800  hover:bg-zinc-700 hover:text-white px-2 py-1"
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for New Users */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <Globe className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-zinc-400 mb-6">Deploy your first project to get started</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
