import React from 'react';
import { cn } from '@/lib/utils';

function Window({ iframeurl, iframeRef, sandboxReady, phase }: any) {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden text-xs">
      {/* Content */}
      <div className="flex-1 bg-white relative">
        <iframe
          src={sandboxReady && phase === "sandbox" ? iframeurl : "about:blank"}
          className="w-full h-full absolute top-0 left-0 border-none"
          title="Project Preview"
          style={{ background: "white" }}
          ref={iframeRef}
          allow="cross-origin-isolated; autoplay; camera; clipboard-read; clipboard-write; fullscreen; geolocation; microphone; midi; payment; sensor; xr-spatial-tracking; accelerometer; gyroscope; magnetism;"
        />
      </div>
    </div>
  );
}

export default Window;
