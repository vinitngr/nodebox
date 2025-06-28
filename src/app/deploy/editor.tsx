"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Save, Download, Copy, Check, Plus, Delete, DeleteIcon, Trash } from "lucide-react"
import { hostContainer } from "@/lib/webContainer"
// import { files } from "@/data/fakeData" 

interface CodeEditorProps {
  files: string[],
  host: hostContainer
}


export function CodeEditor({ files, host , refreshKey , setFiles }: CodeEditorProps & { refreshKey?: number } & { setFiles?: (files: string[]) => void }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentFileContent, setCurrentFileContent] = useState<string>("")
  const [copied, setCopied] = useState(false)


  const SaveFunction = async () => {
  if (selectedFile && currentFileContent) {
    await host.writeFile(selectedFile, currentFileContent)
    setCopied(false)
  }
}

  const copyToClipboard = async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(currentFileContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadFile = async () => {
    console.log(selectedFile);
    if (selectedFile && currentFileContent) {
      try {
        host.downloadFile((selectedFile as string), currentFileContent)
      } catch (error) {
        console.error("Error downloading file:", error)
      }
    }
  }

  useEffect(() => {
    if (!selectedFile) {
      setCurrentFileContent("")
      return
    }
    async function loadContent() {
      if (selectedFile) {
        const content = await host.readFile(selectedFile)
        setCurrentFileContent(content)
      }
    }
    loadContent()
  }, [selectedFile , refreshKey])

  const onFileSelect = (filename: string) => {
    setSelectedFile(filename)
  }

  const createFunction = async () => {
    const newFileName = prompt("Enter new file name (e.g., newfile.js or public/index.js):")
    if (newFileName) {
      try {
        await host.writeFile(newFileName, "")
        setSelectedFile(`//${newFileName}`)
        setCurrentFileContent("")
        setFiles?.([...files, `//${newFileName}`])
      } catch (error) {
        console.error("Error creating file:", error)
      }
    }
  }
  const deleteFile = async () => {
    if (selectedFile) {
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedFile}?`)
      if (confirmDelete) {
        try {
          host.deleteFile(selectedFile)
          setSelectedFile(null)
          setCurrentFileContent("")
          setFiles?.(files.filter(file => file !== selectedFile))
        } catch (error) {
          console.error("Error deleting file:", error)
        }
      }
    }
  }
  const getLanguageColor = (language: string) => {
    switch (language.split('.').pop()?.toLowerCase()) {
      case "js":
        return "bg-yellow-300 text-black border-yellow-800"
      case "html":
        return "bg-yellow-900 text-yellow-300 border-yellow-800"
      case "json":
        return "bg-green-900 text-green-300 border-green-800"
      case "css":
        return "bg-blue-900 text-blue-300 border-blue-800"
      case "md":
        return "bg-purple-900 text-purple-300 border-purple-800"
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-800"
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white">
      <CardHeader className="pb-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-zinc-400" />
            File Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedFile && <Badge className={getLanguageColor(selectedFile)}>{selectedFile.slice(2)}</Badge>}
          </div>
        </div>

        {/* File Selector */}
        <div className="flex items-center gap-2 mt-4">
          <Select value={selectedFile || ""} onValueChange={onFileSelect}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select a file to view" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              {files.map((file) => (
                <SelectItem
                  key={file}
                  value={file}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.slice(2)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFile && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => SaveFunction()}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadFile}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={deleteFile}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Trash className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={createFunction}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 h-full">
        {selectedFile ? (
          <ScrollArea className="h-80 bg-black rounded-lg border border-zinc-800">
            <div className="p-4">
              <textarea
                onChange={(e) => {
                  const val = e.target.value
                  setCurrentFileContent(val)
                  SaveFunction()
                }}
                className="w-full h-full noscrollbar bg-transparent text-zinc-300 font-mono text-sm resize-none border-none outline-none"
                value={currentFileContent}
                style={{ minHeight: "300px" }}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="h-80 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2 text-zinc-400">No file selected</p>
              <p className="text-sm text-zinc-500">
                Select a file from the dropdown above or use "edit filename" in terminal
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
