"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ExternalLink,
  Calendar,
  Clock,
  Plus,
  RotateCcw,
  Trash,
  Github,
  FolderIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  projectName: string;
  url: string;
  githubUrl?: string;
  description?: string;
  deployDate: string;
  buildTime: number;
  created: Date;
  devTime: number;
}

export function ProjectDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    import("axios").then(({ default: axios }) => {
      axios
        .get("/api/userProjects")
        .then((res) => setProjects(res.data.projects))
        .catch((e) => console.log(e))
        .finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    setFilteredProjects(
      projects.filter((project) =>
        project.projectName.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, projects]);

  function rebuildProject(githubUrl : string){
    alert("TODO")
    // const selectedProject = projects.find((p) => p.githubUrl === githubUrl);
    // if (selectedProject) {
    //   router.push(
    //     `/deploy?github=${encodeURIComponent(
    //       githubUrl
    //     )}&pn=${encodeURIComponent(
    //       selectedProject.projectName
    //     )}&des=${encodeURIComponent(
    //       selectedProject.description || ""
    //     )}`
    //   );
    // }
  }

  return (
    <div className="xl:max-h-screen mt-8 max-w-[95%] md:max-w-[80%] mb-10 m-auto bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto pt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome , {session?.user?.name}
            </h1>
            <p className="text-zinc-400">
              Manage and monitor your deployed applications
            </p>
          </div>

          <Button
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium transition flex items-center justify-center  hover:opacity-90"
            onClick={() => router.push("/deploy")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {!loading && (
              <Badge
                variant="outline"
                className="bg-zinc-900 text-zinc-300 border-zinc-700"
              >
                {projects.length} Projects
              </Badge>
            )}
          </div>
          {!loading && filteredProjects.length > 0 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {Array.from({ length: Math.ceil(filteredProjects.length / 3) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={`min-w-8 h-8 p-0 ${currentPage === page ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-zinc-900 text-zinc-300 border-zinc-700'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-400">Loading...</div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects
              .slice((currentPage - 1) * 3, currentPage * 3)
              .map((project) => (
                <Card
                  key={project.id}
                  className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700  text-white transition-colors rounded-xl p-3 space-y-3"
                >
                  <CardHeader className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="min-h-10  min-w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-white line-clamp-1">
                            {project.projectName}
                          </CardTitle>
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 p-0">
                    <div className="bg-zinc-800/60 rounded-md px-3 py-2">
                      <p className="text-[10px] text-zinc-500 mb-0.5">URL</p>
                      <p className="text-sm font-medium truncate">
                        {project.url}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-zinc-800/60 col-span-2 rounded-md px-3 py-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] text-zinc-500">
                            Deployed
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {new Date(project.created).toLocaleString("default", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="bg-zinc-800/60 rounded-md px-3 py-2 col-span-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] text-zinc-500">
                            Build Time
                          </span>
                        </div>
                        <p className="text-sm font-medium">{project.buildTime || -1} s</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-md px-3 py-2 col-span-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] text-zinc-500">
                            Dev Time
                          </span>
                        </div>
                        <p className="text-sm font-medium">{project.devTime || -1} s </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white px-2 py-1 h-7 text-xs"
                        onClick={() => window.open(project.url, "_blank")}
                      >
                      
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                      <Button
                        size="sm"
                        className=" bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-2 py-1"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                      {
                        project.githubUrl && (
                        <Button
                          size="sm"
                          onClick={()=> rebuildProject(project.githubUrl!)}
                          className=" bg-zinc-800 hover:bg-zinc-700 hover:text-white px-2 py-1">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        )
                      }
                      <Button
                        size="sm"
                        onClick={() =>
                          project.githubUrl
                            ? window.open(project.githubUrl, "_blank")
                            : window.open(project.url, "_blank")
                        }
                        className=" bg-zinc-800 hover:bg-zinc-700 hover:text-white px-2 py-1"
                      >
                        {project.githubUrl ? (
                          <Github className="w-3 h-3" />
                        ) : (
                          <FolderIcon className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Globe className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No projects yet
            </h3>
            <p className="text-zinc-400 mb-6">
              Deploy your first project to get started
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/deploy")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
