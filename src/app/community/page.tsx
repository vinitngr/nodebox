import React from 'react';
import { ProjectCard } from '@/components/CommunityCard';
import { Plus } from 'lucide-react';

function App() {
  const sampleProjects = [
    {
      projectName: "E-Commerce Dashboard",
      url: "https://dashboard.example.com",
      userName: "sarah_dev",
      description: "A modern React dashboard for managing online stores with real-time analytics and inventory management."
    },
    {
      projectName: "Portfolio Website",
      url: "https://portfolio.johndoe.dev",
      userName: "john_doe",
      description: "Clean and responsive portfolio showcasing web development projects and skills."
    },
    {
      projectName: "Task Management App",
      url: "https://tasks.productivity.io",
      userName: "alex_codes",
      description: "Collaborative task management tool with real-time updates and team coordination features."
    },
    {
      projectName: "Weather App",
      url: "https://weather.myapp.com",
      userName: "weather_guru",
      description: "Beautiful weather application with location-based forecasts and interactive maps."
    },
    {
      projectName: "Crypto Tracker",
      url: "https://crypto.tracker.dev",
      userName: "crypto_dev",
      description: "Real-time cryptocurrency price tracking with portfolio management and alerts."
    },
    {
      projectName: "Recipe Finder",
      url: "https://recipes.foodie.app",
      userName: "chef_coder",
      description: "Discover and save recipes with smart ingredient matching and meal planning features."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-8 invisible"> invisible</h1>
        <div className="max-w-[90%] h-96 bg-zinc-900/50 m-auto mb-6 rounded-md flex items-center px-4 text-white text-xl font-semibold shadow-lg"
          style={{
            backgroundImage: `url(/cover${Math.floor(Math.random() * 2) + 2}.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>

        </div>
        <div className="flex items-center justify-between max-w-[90%] m-auto mb-8">
          <span className="text-zinc-400 text-base">
            Discover inspiring projects from our community.
            <span className="mr-1 ml-10">🌟</span>
            Featured Projects (12)
          </span>
          <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium transition flex items-center justify-center  hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Submit your project
          </button>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[90%] mx-auto">
          {sampleProjects.map((project, index) => (
            <ProjectCard
              key={index}
              projectName={project.projectName}
              url={project.url}
              userName={project.userName}
              description={project.description}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600  px-2 py-1 rounded-full font-semibold text-xs cursor-pointer">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;