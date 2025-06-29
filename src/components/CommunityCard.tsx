"use client"
import React from 'react';
import { ExternalLink, GitGraph, Github, User } from 'lucide-react';

interface ProjectCardProps {
  projectName: string;
  url: string;
  userName: string;
  description?: string;
  githubUrl?: string;
  userimage?: string;
  created: Date;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  url,
  userName,
  description,
  githubUrl,
  userimage,
  created
}) => {
    const handleVisit = (type : string) => {
      console.log(type);
      /**
       * noopener:
       * By default, when a link is opened in a new tab, the new tab has access to the
       * original tab through the `window.opener` property. This allows the new tab to
       * navigate or close the original tab. This is a potential security risk.
       * By setting `noopener`, we prevent the new tab from having access to the original
       * tab.
       *
       * noreferrer:
       * The noreferrer keyword prevents the browser from sending a Referer header when
       * following the link. This can be useful for preventing other sites from knowing that
       * they were referred from your site.
       *
       * Example:
       * If you have a link to a third-party site on your website, and you don't want that
       * site to know that the user came from your site, you can use noreferrer.
       * <a href="https://example.com" rel="noreferrer">Link</a>
       */
      window.open(type, '_blank', 'noopener,noreferrer');
    }
  return (
    <div className="bg-zinc-900/50 flex flex-col justify-between border h-52 border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/20 group">
      <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white  font-medium text-lg truncate mb-1">
                {projectName}
              </h3>
              <p className="text-zinc-400 text-xs truncate">
                {url}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleVisit(githubUrl!)}
                className="ml-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200 group-hover:bg-zinc-700"
                title="Visit Project"
              >
                <Github className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => handleVisit(url)}
                className="ml-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200 group-hover:bg-zinc-700"
                title="Visit Project"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          {description && (
            <p className="text-zinc-500 mt-5 text-xs mb-3 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className='flex items-center'>
          <img
            src={userimage}
            alt={userName}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-zinc-400 text-xs font-medium">
            {userName}
          </span>
        </div>
        <div className='text-zinc-400 text-xs'>{created.toLocaleString('default', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
      </div>
    </div>
  );
};