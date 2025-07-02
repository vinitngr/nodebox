import React from 'react'
import { ProjectDashboard } from './dashboard'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Nodebox | dashboard",
  description: "brings node in your browser",
};


function page() {
  return (
    <div>
        <ProjectDashboard/>
    </div>
  )
}

export default page