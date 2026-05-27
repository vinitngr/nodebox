"use client"
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useLogStore } from "@/store/logs";
import "@xterm/xterm/css/xterm.css";
import { hostContainer } from "@/lib/webContainer";
import { parseGitHubUrl } from "@/lib/githubUtils";

// Components
import { SandboxDashboard } from "./components/SandboxDashboard";
import { DeploymentForm } from "./components/DeploymentForm";

type DeploymentPhase = "form" | "sandbox" | "deploying";

export default function ProjectDeploy() {
  const [phase, setPhase] = useState<DeploymentPhase>("form");
  const [sourceType, setSourceType] = useState<"github" | "folder">("github");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [customBranch, setCustomBranch] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [rootFolder, setRootFolder] = useState("");
  const [repoFolders, setRepoFolders] = useState<string[]>([]);
  const [repoFiles, setRepoFiles] = useState<string[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));
  const [detectedFramework, setDetectedFramework] = useState<string | null>(null);
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [rundev, setRundev] = useState("npm run dev");
  const [outFolder, setoutFolder] = useState('dist')
  
  const [envVars, setEnvVars] = useState("");
  const [envList, setEnvList] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const [terminalInput, setTerminalInput] = useState("");
  const [sandboxReady, setSandboxReady] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [containerUrl, setContainerUrl] = useState<string | undefined>();
  const [host, setHost] = useState<hostContainer | null>(null);
  const [availableFiles, setavailableFiles] = useState<string[]>([]);
  const [executionTime, setexexecutionTime] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);
  const logs = useLogStore((s) => s.logs);
  const [ProductionDone, setProductionDone] = useState(false);

  useEffect(() => {
    document.title = "Nodebox | Deploy";
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      const parsed = parseGitHubUrl(githubUrl);
      if (parsed) {
        setLoadingBranches(true);
        setBranches([]);
        try {
          const response = await fetch(`/api/github/branches?owner=${parsed.owner}&repo=${parsed.repo}`);
          const data = await response.json();
          if (data.branches) {
            setBranches(data.branches);
            if (!data.branches.includes(branch) && branch !== "custom") {
              setBranch(data.branches[0] || "main");
            }
          }
        } catch (error) {
          console.error("Error fetching branches:", error);
        } finally {
          setLoadingBranches(false);
        }
      }
    };

    const timer = setTimeout(fetchBranches, 500);
    return () => clearTimeout(timer);
  }, [githubUrl]);

  useEffect(() => {
    const fetchTree = async () => {
      const parsed = parseGitHubUrl(githubUrl);
      if (parsed) {
        setLoadingTree(true);
        try {
          const b = branch === "custom" ? customBranch : branch;
          const response = await fetch(`/api/github/tree?owner=${parsed.owner}&repo=${parsed.repo}&branch=${b}`);
          const data = await response.json();
          if (data.folders) {
            setRepoFolders(["", ...data.folders]);
            setRepoFiles(data.files || []);
          }
        } catch (error) {
          console.error("Error fetching tree:", error);
        } finally {
          setLoadingTree(false);
        }
      }
    };
    const timer = setTimeout(fetchTree, 800);
    return () => clearTimeout(timer);
  }, [githubUrl, branch, customBranch]);

  useEffect(() => {
    const detect = async () => {
      const parsed = parseGitHubUrl(githubUrl);
      if (parsed) {
        try {
          const response = await fetch(
            `/api/github/detect?owner=${parsed.owner}&repo=${
              parsed.repo
            }&branch=${
              branch === "custom" ? customBranch : branch
            }&path=${rootFolder}`
          );
          const data = await response.json();
          if (data.framework && data.framework !== "none") {
            setDetectedFramework(data.framework);
            if (!projectName) setProjectName(data.pkgName || parsed.repo);
          } else {
            setDetectedFramework(null);
          }
        } catch (error) {
          setDetectedFramework(null);
        }
      }
    };
    const timer = setTimeout(detect, 1000);
    return () => clearTimeout(timer);
  }, [githubUrl, branch, customBranch, rootFolder]);

  useEffect(() => {
    if (host) {
      host
        .getFilesName("/")
        .then((files) => {
          setavailableFiles(files);
        })
        .catch((err) => {
          console.error("Error fetching root files:", err);
        });
    }
  }, [host, refreshKey]);

  const startSandbox = async () => {
    const start = performance.now();
    setPhase("sandbox");
    useLogStore.setState({ logs: [] });
    setSandboxReady(false);
    
    // Process envList to envVars string
    const filtered = envList.filter((item) => item.key.trim() !== "");
    const envString = filtered.map((item) => `${item.key}=${item.value}`).join("\n");

    try {
      let newHost;
      if (files?.length)
        newHost = await hostContainer.initialize({
          option: "folder",
          projectName: projectName,
          metadata: { env: envString, buildCommand, rundev, description, outFolder, rootFolder },
          files,
        });
      else if (githubUrl.trim()) {
        newHost = await hostContainer.initialize({
          option: "github",
          projectName: projectName,
          url: githubUrl,
          metadata: {
            env: envString,
            branch: customBranch || branch,
            buildCommand,
            rundev,
            description,
            outFolder,
            rootFolder
          },
        });
      } else return alert("Please provide either a GitHub URL or a folder");

      newHost.wc.on("server-ready", (port, url) => {
          setSandboxReady(true);
          setContainerUrl(url);
          setHost(newHost);
          const end = performance.now();
          newHost.metadata.devtime = end - start;
          setexexecutionTime(end - start);
      });
      await newHost.getTheWorkDone();
      setHost(newHost);
      setSandboxReady(true);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const deployToProduction = async () => {
    setProductionDone(false);
    setPhase("deploying");
    setTerminalInput("");
    useLogStore.setState({ logs: [] });
    useLogStore.getState().addLog("normal", "> deploy initialize");
    try {
      if (!host) throw new Error("Host is not initialized");
      const { success } = await host.DeployToProduction();
      if (success) {
        setProductionDone(true);
      } else {
        const retry = confirm("Deployment failed. Go back to sandbox?");
        if (retry) setPhase("sandbox");
      }
    } catch (error) {
      console.error("Error deploying to production:", error);
    }
  };

  const downloadFolder = async (path: string) => {
    if (!host) return;
    try {
      await host.exportFile(path, "zip", projectName);
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };

  const handleTerminalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!host) return;
      const { executeCommand } = require("@/lib/utils");
      executeCommand(terminalInput, host, projectName, setTerminalInput);
      setRefreshKey((k) => k + 1);
    }
  };

  if (phase === "form") {
    return (
        <DeploymentForm 
            sourceType={sourceType}
            setSourceType={setSourceType}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            branch={branch}
            setBranch={setBranch}
            branches={branches}
            loadingBranches={loadingBranches}
            customBranch={customBranch}
            setCustomBranch={setCustomBranch}
            rootFolder={rootFolder}
            setRootFolder={setRootFolder}
            repoFolders={repoFolders}
            loadingTree={loadingTree}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            repoFiles={repoFiles}
            projectName={projectName}
            setProjectName={setProjectName}
            description={description}
            setDescription={setDescription}
            rundev={rundev}
            setRundev={setRundev}
            buildCommand={buildCommand}
            setBuildCommand={setBuildCommand}
            outFolder={outFolder}
            setoutFolder={setoutFolder}
            envList={envList}
            setEnvList={setEnvList}
            startSandbox={startSandbox}
            files={files}
            setFiles={setFiles}
            folderRef={folderRef}
            isFolderModalOpen={isFolderModalOpen}
            setIsFolderModalOpen={setIsFolderModalOpen}
        />
    );
  }

  return (
    <SandboxDashboard 
      projectName={projectName}
      phase={phase}
      setPhase={setPhase}
      sandboxReady={sandboxReady}
      containerUrl={containerUrl}
      iframeRef={iframeRef}
      logs={logs}
      host={host}
      terminalInput={terminalInput}
      setTerminalInput={setTerminalInput}
      handleTerminalKeyPress={handleTerminalKeyPress}
      termRef={termRef}
      executionTime={executionTime}
      buildCommand={buildCommand}
      outFolder={outFolder}
      availableFiles={availableFiles}
      setAvailableFiles={setavailableFiles}
      refreshKey={refreshKey}
      deployToProduction={deployToProduction}
      downloadFolder={downloadFolder}
      productionDone={ProductionDone}
    />
  );
}
