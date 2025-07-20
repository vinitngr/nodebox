"use client";
import React, { useEffect, useState } from "react";
import { ProjectCard } from "@/components/CommunityCard";
import { Plus } from "lucide-react";
import Head from "next/head";
import { useLogStore } from "@/store/logs";
import { ProjectMetaData } from "@/lib/types";

interface Project {
  id: number;
  projectName: string;
  url: string;
  githubUrl?: string;
  description?: string;
  userName: string;
  userimage: string;
  created: Date;
}
function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [range, setRange] = useState({ start: 0, end: 9 });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.title = "Nodebox | Explore";
  }, []);

  const fetchProjects = async () => {
    const store = useLogStore.getState();
    try {
      setLoading(true);
      if (store._explore.length === 0) {
        const res = await fetch(
          `/api/getProjects?start=${range.start}&end=${range.end}`
        );
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        store._explore = data.projects;
        setProjects((prev) => [...prev, ...data.projects]);
      } else {
        setProjects(store._explore as Project[]);
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (!isMounted) {
    return null;
  }
  const loadMore = () => {
    const nextStart = range.end + 1;
    const nextEnd = nextStart + 9;
    setRange({ start: nextStart, end: nextEnd });

    fetch(`/api/getProjects?start=${nextStart}&end=${nextEnd}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch more projects");
        return res.json();
      })
      .then((data) => {
        const store = useLogStore.getState();
        store._explore = [...store._explore, ...data.projects];
        setProjects((prev) => [...prev, ...data.projects]);
      })
      .catch((e) => console.log(e));
  };

  console.log("date", projects);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen  max-w-[95%] md:max-w-[80%] pb-10 m-auto bg-zinc-950 p-2 mt-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-8 invisible">
          {" "}
          invisible
        </h1>
        <div
          className="h-96 bg-zinc-900/50 m-auto mb-6 rounded-md flex items-center text-white text-xl font-semibold shadow-lg"
          style={{
            backgroundImage: `url(/cover2.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="flex items-center justify-between p-1 m-auto mb-8">
          <span className="text-zinc-400 text-base">
            Discover inspiring projects from our community.
            <span className="mr-2 ml-10">🌟</span>
            Featured Projects ({projects.length})
          </span>
          <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium transition flex items-center justify-center  hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Submit your project
          </button>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              projectName={project.projectName}
              url={project.url}
              userName={project.userName}
              description={project.description}
              githubUrl={project.githubUrl}
              userimage={project.userimage}
              created={new Date(project.created)}
            />
          ))}
        </div>

        <div className="flex justify-center  mt-20">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600  px-2 py-1 rounded-full font-semibold text-xs cursor-pointer"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
