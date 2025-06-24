"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Save, Download, Copy, Check } from "lucide-react"
import { files } from "@/data/fakeData" 

interface CodeEditorProps {
  selectedFile: string | null
  onFileSelect: (filename: string) => void
}

export function CodeEditor({ selectedFile, onFileSelect }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)


  const currentFile = files.find((f) => f.name === selectedFile)

  const copyToClipboard = async () => {
    if (currentFile) {
      await navigator.clipboard.writeText(currentFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "javascript":
        return "bg-yellow-900 text-yellow-300 border-yellow-800"
      case "json":
        return "bg-green-900 text-green-300 border-green-800"
      case "css":
        return "bg-blue-900 text-blue-300 border-blue-800"
      case "markdown":
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
            {currentFile && <Badge className={getLanguageColor(currentFile.language)}>{currentFile.language}</Badge>}
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
                  key={file.name}
                  value={file.name}
                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentFile && (
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
                onClick={() => setIsEditing(!isEditing)}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                {isEditing ? <Save className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 h-full">
        {currentFile ? (
          <ScrollArea className="h-80 bg-black rounded-lg border border-zinc-800">
            <div className="p-4">
              {isEditing ? (
                <textarea
                  className="w-full h-full bg-transparent text-zinc-300 font-mono text-sm resize-none border-none outline-none"
                  value={currentFile.content}
                  onChange={(e) => {}}
                  style={{ minHeight: "300px" }}
                />
              ) : (
                <pre className="text-zinc-300 font-mono text-sm whitespace-pre-wrap">
                  <code>{currentFile.content}</code>
                </pre>
              )}
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
