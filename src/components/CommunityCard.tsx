"use client"
import React from 'react';
import { ExternalLink, User } from 'lucide-react';

interface ProjectCardProps {
  projectName: string;
  url: string;
  userName: string;
  description?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  url,
  userName,
  description
}) => {
  const handleVisit = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <div className="bg-zinc-900/50 flex flex-col justify-between     border h-64 border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/20 group">
      <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white  font-medium text-lg truncate mb-1">
                {projectName}
              </h3>
              <p className="text-zinc-400 text-xs truncate">
                {formatUrl(url)}
              </p>
            </div>
            <button
              onClick={handleVisit}
              className="ml-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200 group-hover:bg-zinc-700"
              title="Visit Project"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
            </button>
          </div>
          {description && (
            <p className="text-zinc-500 mt-5 text-xs mb-3 line-clamp-3 leading-relaxed">
              {description}lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          )}
      </div>

      <div className="flex items-center pt-4 border-t border-zinc-800">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=32`}
          alt={userName}
          className="w-6 h-6 rounded-full mr-2"
        />
        <span className="text-zinc-400 text-xs font-medium">
          {userName}
        </span>
      </div>
    </div>
  );
};