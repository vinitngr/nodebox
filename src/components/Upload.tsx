'use client'
import { useRef, useState } from 'react'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { hostContainer } from '@/lib/webContainer'
function Upload() {
    const folderRef = useRef<HTMLInputElement>(null)
    const [url, setUrl] = useState('')
    const [files, setFiles] = useState<FileList | null>(null)
    const [projectName, setProjectName] = useState('')
    const [description, setDescription] = useState('')
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let host;
            if (files && files.length > 0) {
                host = await hostContainer.initialize({ option: 'folder', files });
            } else if (url.trim()) {
                console.time('hostContainer');
                host = await hostContainer.initialize({ option: 'github', url });
            } else {
                alert('Please provide either a GitHub URL or a folder');
                return;
            }
            
            host.wc.on('server-ready', (port, url) => {
                if (iframeRef.current) {
                    iframeRef.current.src = url;
                    console.timeEnd('hostContainer');
                }
            });

            await host.getTheWorkDone();

        } catch (error) {
            console.log("Error:", error);
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 bg-gray-200 p-5 mb-16 rounded-2xl lg:grid-cols-3 gap-12 items-start pb-12">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-light leading-tight mb-4">
                        Upload your Project Here<br />
                        <span className="text-gray-400">easy upload</span>
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 col-span-2">
                    <p className="text-sm leading-relaxed text-gray-700">
                        Upload valid GitHub URL or project folder to host your React.js web app.
                        <br />
                        <span className="text-yellow-500">Note:</span> Make sure your project is a React.js app and has a valid build script in <code>package.json</code>.
                    </p>

                    <Separator className="my-4" />

                    <div className="grid flex-1 items-center gap-3">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            type="text"
                            placeholder="Project Name"
                            maxLength={20}
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </div>

                    <Separator className="my-4" />

                    <div id="forInput" className="flex gap-5 items-center justify-center">
                        <div className="grid flex-1 items-center gap-3">
                            <Label htmlFor="githubUrl">GitHub URL</Label>
                            <Input
                                id="githubUrl"
                                placeholder="Git URL"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        <span>Or</span>
                        <div className="grid flex-1 items-center gap-3">
                            <Label htmlFor="filefolder">Project Folder</Label>
                            <input
                                id="filefolder"
                                type="file"
                                multiple
                                ref={folderRef}
                                onChange={(e) => setFiles(e.target.files)}
                                // @ts-ignore
                                webkitdirectory="true"
                                className="border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid flex-1 items-center gap-3">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add description about project"
                            className="h-20 max-h-28"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8 py-3 mt-4 self-start">
                        Upload
                    </Button>
                </form>
            </div>
                    <iframe 
                        className='mb-10'
                        ref={iframeRef}
                        width="100%"
                        height="500"
                        style={{ border: '1px solid #ccc' }}
                    />
        </>
    )
}

export default Upload