"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Github, Folder, Terminal, Play, Settings, Code, Zap, Monitor, CloudUpload } from "lucide-react"
import { CodeEditor } from "./editor"
import { useRouter } from "next/navigation"
type DeploymentPhase = "form" | "sandbox" | "deploying" | "dashboard"

export default function ProjectDeploy() {
  const [phase, setPhase] = useState<DeploymentPhase>("form")
  const [sourceType, setSourceType] = useState<"github" | "folder">("github")
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [branch, setBranch] = useState("main")
  const [customBranch, setCustomBranch] = useState("")
  const [buildCommand, setBuildCommand] = useState("npm run build")
  const [rundev, setRundev] = useState("npm run dev")
  const [envVars, setEnvVars] = useState("")
  const [terminalInput, setTerminalInput] = useState("")
  const [terminalHistory, setTerminalHistory] = useState<string[]>([])
  const [currentDirectory, setCurrentDirectory] = useState("~/my-awesome-project")
  const [logs, setLogs] = useState<string[]>([])
  const [sandboxReady, setSandboxReady] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null);
  const folderRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const availableFiles = [
    "package.json",
    "src/App.js",
    "src/App.css",
    "src/index.js",
    "README.md",
    "public/index.html",
    ".gitignore",
    "tailwind.config.js",
    "tsconfig.json",
  ]

  const startSandbox = () => {
    setPhase("sandbox")
    setLogs([])
    setSandboxReady(false)

    const buildSteps = [
      "Initializing WebContainer...",
      "Cloning repository...",
      "Installing dependencies...",
      "> npm install",
      "Dependencies installed successfully",
      "Starting development server...",
      "> npm run dev",
      "Server running on port 3000",
      "Sandbox ready! 🎉",
    ]

    buildSteps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step])
        if (index === buildSteps.length - 1) {
          setTimeout(() => setSandboxReady(true), 10)
        }
      }, index * 80)
    })
  }

  const deployToProduction = () => {
    setPhase("deploying")
    setLogs([])

    const deploySteps = [
      "Preparing for production deployment...",
      "Building optimized version...",
      "> npm run build",
      "Build completed successfully",
      "Uploading to CDN...",
      "Configuring domain...",
      "Deployment successful! 🚀",
    ]

    deploySteps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step])
        if (index === deploySteps.length - 1) {
          router.push("/dashboard")
        }
      }, index * 1000)
    })
  }

  const resetToForm = () => {
    setPhase("form")
    setLogs([])
    setTerminalHistory([])
    setSandboxReady(false)
    setSelectedFile(null)
  }

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) return

    setTerminalHistory((prev) => [...prev, `${currentDirectory} $ ${trimmedCommand}`])

    // Check if command starts with "edit"
    if (trimmedCommand.toLowerCase().startsWith("edit ")) {
      const filename = trimmedCommand.substring(5).trim()
      const matchedFile = availableFiles.find(
        (file) =>
          file.toLowerCase().includes(filename.toLowerCase()) || filename.toLowerCase().includes(file.toLowerCase()),
      )

      if (matchedFile) {
        setSelectedFile(matchedFile)
        setTerminalHistory((prev) => [...prev, `Opening ${matchedFile} in editor...`])
      } else {
        setTerminalHistory((prev) => [...prev, `File not found: ${filename}`])
        setTerminalHistory((prev) => [...prev, `Available files: ${availableFiles.join(", ")}`])
      }
      setTerminalInput("")
      return
    }

    switch (trimmedCommand.toLowerCase()) {
      case "ls":
      case "ls -la":
      case "ls -l":
        setTerminalHistory((prev) => [
          ...prev,
          "package.json",
          "README.md",
          "public",
          "src",
          "tailwind.config.js",
          "tsconfig.json",
        ])
        break
      case "clear":
        setLogs([])
        setTerminalHistory([])
        break
      case "pwd":
        setTerminalHistory((prev) => [...prev, currentDirectory])
        break
      case "whoami":
        setTerminalHistory((prev) => [...prev, "developer"])
        break
      case "date":
        setTerminalHistory((prev) => [...prev, new Date().toString()])
        break
      case "help":
        setTerminalHistory((prev) => [
          ...prev,
          "Available commands:",
          "  ls           - list directory contents",
          "  export <file>- clear terminal",
          "  pwd          - print working directory",
          "  whoami       - print current user",
          "  date         - show current date",
          "  edit <file>  - open file in editor",
          "  help         - show this help message",
        ])
        break
      default:
        setTerminalHistory((prev) => [...prev, `bash: ${trimmedCommand}: command not found`])
    }

    setTerminalInput("")
  }

  const handleTerminalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(terminalInput)
    }
  }


  return (
    <div className="p-4">
      <div className="max-w-7xl pt-20 mx-auto">
        {/* Header */}
        

        {phase === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Form */}
            <div className="mb-6">
               <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Deploy Project</h1>
              </div>
              <p className="text-zinc-400">Deploy your React project from GitHub or upload files</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader className="pb-4 border-b border-zinc-800">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-zinc-400" />
                  Project Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <div className="space-y-6 pr-4">
                    {/* Source Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-white font-medium">Import Source</Label>
                      <Tabs value={sourceType} onValueChange={(value : any) => setSourceType(value as "github" | "folder")}>
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border-zinc-700">
                          <TabsTrigger
                            value="github"
                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300"
                          >
                            <Github className="h-4 w-4" />
                            GitHub
                          </TabsTrigger>
                          <TabsTrigger
                            value="folder"
                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300"
                          >
                            <Folder className="h-4 w-4" />
                            Upload
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="github" className="space-y-4 mt-4">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="github-url" className="text-white font-medium">
                              Repository URL
                            </Label>
                            <Input
                              id="github-url"
                              multiple
                              placeholder="https://github.com/username/repository"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white font-medium">Branch</Label>
                            <Select value={branch} onValueChange={setBranch}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="main" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                                  main
                                </SelectItem>
                                <SelectItem value="master" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                                  master
                                </SelectItem>
                                <SelectItem value="custom" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                                  Custom branch...
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {branch === "custom" && (
                              <Input
                                placeholder="Enter branch name"
                                value={customBranch}
                                onChange={(e) => setCustomBranch(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500 mt-2"
                              />
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="folder" className="mt-4">
                          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900">
                          <input
                            id="filefolder"
                            type="file"
                            multiple
                            ref={folderRef}
                            onChange={e => setFiles(e.target.files)}
                            // @ts-ignore
                            webkitdirectory="true"
                            className="hidden"
                          />
                          <Upload className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
                          <p className="text-lg font-medium mb-2 text-white">Drop your project folder here</p>
                          <p className="text-zinc-400 text-sm">or click to browse files</p>
                          <Button
                            variant="outline"
                            className="mt-4 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                            onClick={() => folderRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                          {files && <div className="mt-2">{files.length} files</div>}

                        </div>

                        </TabsContent>
                      </Tabs>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Project Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name" className="text-white font-medium">
                          Project Name
                        </Label>
                        <Input
                          id="project-name"
                          placeholder="my-awesome-project"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white font-medium">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="A brief description of your project"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Build Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-white">
                        <Code className="h-4 w-4 text-zinc-400" />
                        Build Settings
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="install-command" className="text-white font-medium">
                          Local Run Command
                        </Label>
                        <Input
                          id="install-command"
                          value={rundev}
                          onChange={(e) => setRundev(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="build-command" className="text-white font-medium">
                          Build Command
                        </Label>
                        <Input
                          id="build-command"
                          value={buildCommand}
                          onChange={(e) => setBuildCommand(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Environment Variables */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white">Environment Variables</h3>
                      <Textarea
                        placeholder="NEXT_PUBLIC_API_URL=https://api.example.com&#10;DATABASE_URL=postgresql://..."
                        value={envVars}
                        onChange={(e) => setEnvVars(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm"
                        rows={4}
                      />
                      <p className="text-xs text-zinc-500">One environment variable per line in KEY=value format</p>
                    </div>

                    {/* Deploy Button */}
                    <Button
                      onClick={startSandbox}
                      disabled={!projectName}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Load Project in Sandbox
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

          </div>
        )}

        {(phase === "sandbox" || phase === "deploying") && (
          <div className="space-y-6">
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Left - Preview */}
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader className="pb-4 border-b border-zinc-800">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Monitor className="h-5 w-5 text-zinc-400" />
                    {phase === "sandbox" ? "Sandbox Preview" : "Production Preview"}
                  </CardTitle>
                  <Badge
                    className={
                      sandboxReady && phase === "sandbox"
                        ? "bg-green-900 text-green-300 border-green-800"
                        : "bg-yellow-900 text-yellow-300 border-yellow-800"
                    }
                  >
                    {sandboxReady && phase === "sandbox" ? "Ready" : "Loading..."}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-96 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                    {sandboxReady && phase === "sandbox" ? (
                      <iframe
                        src="/back.mp4"
                        className="w-full h-full"
                        title="Project Preview"
                        style={{ background: "white" }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
                          <p className="text-zinc-400">
                            {phase === "sandbox" ? "Loading sandbox..." : "Deploying to production..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Right - Logs & Terminal */}
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader className="pb-4 border-b border-zinc-800">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Terminal className="h-5 w-5 text-zinc-400" />
                    {sandboxReady && phase === "sandbox" ? "Terminal" : "Build Logs"}
                  </CardTitle>
                  <Badge
                    className={
                      sandboxReady && phase === "sandbox"
                        ? "bg-green-900 text-green-300 border-green-800"
                        : "bg-yellow-900 text-yellow-300 border-yellow-800"
                    }
                  >
                    {sandboxReady && phase === "sandbox" ? "Interactive" : "Building..."}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <ScrollArea className="h-96 bg-black rounded-lg border border-zinc-800">
                    <div className="p-4 text-sm space-y-1">
                      {/* Build logs */}
                      {logs.map((log, index) => (
                        <div key={`log-${index}`} className="flex items-start gap-2">
                          <span className="text-zinc-600 text-xs mt-0.5">{String(index + 1).padStart(2, "0")}</span>
                          <span
                            className={
                              log.includes("error") || log.includes("Error")
                                ? "text-red-400"
                                : log.includes("success") || log.includes("🎉") || log.includes("🚀")
                                  ? "text-green-400"
                                  : log.startsWith(">")
                                    ? "text-blue-400"
                                    : "text-zinc-300"
                            }
                          >
                            {log}
                          </span>
                        </div>
                      ))}

                      {!sandboxReady && phase === "sandbox" && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <div className="animate-pulse">●</div>
                          <span>Loading sandbox...</span>
                        </div>
                      )}

                      {phase === "deploying" && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <div className="animate-pulse">●</div>
                          <span>Deploying...</span>
                        </div>
                      )}

                      {/* Interactive terminal when sandbox is ready */}
                      {sandboxReady && phase === "sandbox" && (
                        <>
                          {logs.length > 0 && (
                            <div className="border-t border-zinc-800 my-4 pt-4">
                              <div className="text-zinc-500 text-xs mb-2">
                                Interactive Terminal (try: ls, clear, help, edit filename)
                              </div>
                            </div>
                          )}

                          {terminalHistory.map((entry, index) => (
                            <div key={`terminal-${index}`} className="text-zinc-300">
                              {entry}
                            </div>
                          ))}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-green-400">{currentDirectory}</span>
                            <span className="text-white">$</span>
                            <input
                              type="text"
                              value={terminalInput}
                              onChange={(e) => setTerminalInput(e.target.value)}
                              onKeyDown={handleTerminalKeyPress}
                              className="flex-1 bg-transparent border-none outline-none text-white caret-white"
                              placeholder="Enter command..."
                              autoFocus
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Bottom Left - Upload/Publish */}
              {sandboxReady && phase === "sandbox" && (
                <Card className="bg-zinc-900 border-zinc-800 text-white h-full flex flex-col justify-between">
                  <CardHeader className="pb-4 border-b border-zinc-800">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CloudUpload className="h-5 w-5 text-zinc-400" />
                      Deploy to Production
                    </CardTitle>
                    <Badge className="bg-green-900 mt-2 text-green-300 border-green-800">Deploy</Badge>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className=" flex flex-col justify-center">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Ready to Deploy!</h3>
                        <p className="text-zinc-400 text-sm mb-4">
                          Your project is running perfectly in the sandbox. Deploy to production to make it live for
                          everyone.
                        </p>
                        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                          <p className="text-sm text-zinc-400 mb-1">Production URL</p>
                          <p className="text-white font-medium">
                            https://{projectName.toLowerCase().replace(/\s+/g, "-")}.deployhub.app
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button onClick={deployToProduction} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <CloudUpload className="h-4 w-4 mr-2" />
                          Deploy to Production
                        </Button>
                        {/* <Button
                          onClick={resetToForm}
                          variant="outline"
                          className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                          Edit Configuration
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bottom Right - File Editor */}
              {sandboxReady && phase === "sandbox" && (
                <div>
                  <CodeEditor selectedFile={selectedFile} onFileSelect={setSelectedFile} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
