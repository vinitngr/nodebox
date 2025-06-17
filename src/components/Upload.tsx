'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { hostContainer } from '@/lib/webContainer'
import { useLogStore } from '@/store/logs'
import { borderColors } from '@/lib/other'

function Upload() {
    const folderRef = useRef<HTMLInputElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const terminalRef = useRef<HTMLTextAreaElement>(null)
    const logContainerRef = useRef<HTMLDivElement>(null)
    const [url, setUrl] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [host, setHost] = useState<hostContainer | null>(null);
    const [containerUrl, setContainerUrl] = useState<string | undefined>();
    const [showExport, setShowExport] = useState<boolean>(false);

    const logs = useLogStore(s => s.logs)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let newHost

            if (files?.length) newHost = await hostContainer.initialize({ option: 'folder', files })
            else if (url.trim()) {
                console.time('hostContainer')
                newHost = await hostContainer.initialize({ option: 'github', url })
            } else return alert('Please provide either a GitHub URL or a folder')

            newHost.wc.on('server-ready', (port, url) => {
                if (iframeRef.current) {
                    setContainerUrl(url)
                    setHost(newHost)
                    console.timeEnd('hostContainer')
                }
            })
            await newHost.getTheWorkDone()
        } catch (error) { console.log("Error:", error) }
    }

    const runContainerCommand = async () => {
        if (!host) return

        const value = inputRef.current?.value ?? ''
        if (!value) return
        const [command, ...args] = value.split(' ')

        useLogStore.getState().addLog('normal', `Runnin command ${value}`)

        if (terminalRef.current) terminalRef.current.value += `\n$ ${value}\n`

        if (command === 'export' && ['zip', 'json'].includes(args[1])) {
            await host.exportFile(args[0], args[1] = 'zip'  as 'zip' | 'json' )
            return
        }
        if (command === 'clear') {
            if (terminalRef.current) terminalRef.current.value = ''
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        const output = await host.wc.spawn('sh', ['-c', value])
        output.output.pipeTo(new WritableStream({
            write(data) {
                if (!terminalRef.current) return
                terminalRef.current.value += host.cleanOutput(data)
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight
            }
        }))

        if (await output.exit == 0) {
            useLogStore.getState().addLog('normal', `command successfully executed`)
            if (inputRef.current) inputRef.current.value = ''
            return output.exit
        }

        useLogStore.getState().addLog('error', `command failed with exist code 1`)
    }

    useEffect(() => {
        if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }, [logs])

    return <>
        <div className="grid grid-cols-1 h-[120vh] pb-4 relative bg-gray-200 p-5 mb-16 rounded-2xl lg:grid-cols-3 gap-12 items-start">

            <div className="flex flex-col max-h-full overflow-y-auto">
                <h2 className="text-3xl lg:text-4xl font-light leading-tight mb-4">Upload your Project Here<br /><span className="text-gray-400">easy upload</span></h2>
                <div className="border-2 rounded-2xl noscrollbar overflow-y-scroll border-black border-dashed p-3 flex-1" ref={logContainerRef} style={{ maxHeight: '100%' }}>
                    <div className="border-2 border-dashed font-bold rounded-md">logs here</div>
                    {logs.map((log, i) => <div key={i} className={`border-2 border-dashed p-4 my-2 rounded-md text-sm ${borderColors[log.type]}`}>{log.msg}</div>)}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 col-span-2">

                <p className="text-sm leading-relaxed text-gray-700">Upload valid GitHub URL or project folder to host your React.js web app.<br /><span className="text-yellow-500">Note:</span> Project must be React.js and have a valid <code>build</code> script.</p>
                <Separator className="my-4" />

                <div className="grid gap-3">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" type="text" maxLength={20} value={projectName} onChange={e => setProjectName(e.target.value)} />
                </div>

                <Separator className="my-4" />

                <div className="flex gap-5 items-center justify-center">
                    <div className="grid flex-1 gap-3">
                        <Label htmlFor="githubUrl">GitHub URL</Label>
                        <Input id="githubUrl" placeholder="Git URL" type="url" value={url} onChange={e => setUrl(e.target.value)} />
                    </div>

                    <span>Or</span>

                    <div className="grid flex-1 gap-3">
                        <Label htmlFor="filefolder">Project Folder</Label>
                        <input id="filefolder" type="file" multiple ref={folderRef} className="border rounded px-3 py-2" onChange={e => setFiles(e.target.files)}
                            //@ts-ignore
                            webkitdirectory="true" />
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Add description about project" className="h-20 max-h-28" value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8 py-3 mt-4">Upload</Button>
                    {!showExport && host ? <Button type='button' className="hover:bg-gray-800 px-8 py-3 mt-4" onClick={async () => {
                        useLogStore.getState().addLog('normal', `running Build command : npm run build`)
                        if (inputRef.current) inputRef.current.value = 'npm run build'
                        if (await runContainerCommand() == 0) {
                            useLogStore.getState().addLog('normal', `build command successfull`)
                            setShowExport(true)
                            return
                        }
                        useLogStore.getState().addLog('error', `build command failed`)
                    }}>Build</Button> : host && <>
                        <Button type='button' variant="secondary" onClick={() => host.exportFile('dist', 'zip')} className="hover:bg-gray-800 px-8 py-3 mt-4">Export ZIP</Button>
                        <Button type='button' variant="outline" onClick={() => host.exportFile('dist', 'json')} className="hover:bg-gray-800 px-8 py-3 mt-4">Export JSON</Button>
                    </>}
                </div>

                <div className="mb-5">
                    <div className="font-bold">terminal</div>
                    <textarea ref={terminalRef} readOnly className="w-full h-50 bg-black text-white border border-white rounded-t px-3 py-2 overflow-y-auto resize-none" />
                    <input ref={inputRef} type="text" disabled={!host} className="w-full h-12 bg-black text-white border-t border-white rounded-b px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={e => { if (e.key === 'Enter' && host) { e.preventDefault(); runContainerCommand() } }} />
                </div>

            </form>
        </div>

        <iframe className="mb-10" src={containerUrl} ref={iframeRef} width="100%" height="500" style={{ border: '1px solid #ccc' }} />
    </>
}

export default Upload
