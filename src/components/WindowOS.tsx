import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Minus, Square, X, Search, Globe, RotateCw, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Input } from './ui/input';

function Window({ iframeurl, iframeRef, sandboxReady, phase }: any) {


  return (
    <>
      <div className="h-full w-full   flex  flex-col rounded-md shadow-md overflow-hidden text-xs">
        {/* Title Bar */}
      
        <div
          className={cn(
            "flex items-center justify-between px-4 py-1 border-b rounded-t-lg",
            "bg-gray-100 border-gray-200",
          )}
        >
          <div className="flex items-center gap-2">
            {/* macOS traffic light buttons */}
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center">
            <span className={cn("text-xs font-medium", "text-gray-700")}>
              Google Chrome
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-1 p-0.5 border-b bg-gray-200 border-gray-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-700 hover:bg-gray-300"
          >
            <ArrowLeft className="  " />
            <span className="sr-only">Go Back</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-700 hover:bg-gray-300"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Go Forward</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-700 hover:bg-gray-300"
          >
            <RotateCw className={cn("h-4 w-4")} />
            <span className="sr-only">Reload</span>
          </Button>

          <div className="relative flex-1 flex items-center bg-gray-100 border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 rounded-full shadow-inner">
            <Globe className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="url"
              placeholder="Search Google or type a URL"
              value={iframeurl}
              className="h-7 pl-9 pr-10 rounded-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-gray-800"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-gray-500 hover:bg-gray-200"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Go</span>
            </Button>
          </div>

          <div className='h-5 w-5 rounded-full bg-gray-600 flex justify-center items-center'>V</div>


        </div>


        {/* Content */}
        <div className="flex-1 bg-white relative " style={{ height: "calc(100% - 96px)" }}>
          <iframe
            src={sandboxReady && phase === "sandbox" ? iframeurl : "about:blank"}
            className="w-full h-full absolute top-0 left-0"
            title="Project Preview"
            style={{ background: "white" }}
            ref={iframeRef}
          />
        </div>
      </div>
    </>

  );
}

export default Window;