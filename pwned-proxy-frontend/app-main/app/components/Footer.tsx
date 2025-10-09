// app/components/Footer.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Github } from "lucide-react";

type GitInfo = {
  branch?: string;
  commit?: string;
};

export default function Footer() {
  // Keep track of user’s theme choice. Default is "auto".
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");

  // On first mount, load from localStorage (if present)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as
        | "auto"
        | "light"
        | "dark"
        | null;
      if (storedTheme) {
        setTheme(storedTheme);
      }
    }
  }, []);

  // Whenever `theme` changes, apply the corresponding class logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const htmlEl = document.documentElement;

      if (theme === "dark") {
        htmlEl.classList.add("dark");
      } else if (theme === "light") {
        htmlEl.classList.remove("dark");
      } else {
        // "auto" => system preference
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          htmlEl.classList.add("dark");
        } else {
          htmlEl.classList.remove("dark");
        }
      }

      // Store in localStorage
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [gitError, setGitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitInfo = async () => {
      try {
        const response = await fetch("/api/git-info");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as GitInfo & { error?: string };
        if (data.error) {
          setGitError(data.error);
          return;
        }
        setGitInfo(data);
      } catch (error) {
        setGitError("Unable to load git information");
      }
    };

    fetchGitInfo();
  }, []);

  const versionLabel = useMemo(() => {
    if (!gitInfo) {
      return null;
    }

    const parts = [
      gitInfo.branch ?? null,
      gitInfo.commit ? `(${gitInfo.commit})` : null,
    ].filter((value): value is string => Boolean(value));

    if (parts.length === 0) {
      return null;
    }

    return parts.join(" ");
  }, [gitInfo]);

  return (
    <footer
      className="
        w-full 
        border-t 
        p-4 
        flex 
        items-center 
        justify-between
        bg-tnLight-bg 
        text-tnLight-text
        border-tnLight-border
        dark:bg-tnStorm-bg
        dark:text-tnStorm-text
        dark:border-tnStorm-border
      "
    >
      {/* Left side: The triple-mode selector */}
      <div className="text-sm flex items-center space-x-2">
        <label htmlFor="themeSelector" className="sr-only">
          Theme Selector
        </label>
        <select
          id="themeSelector"
          value={theme}
          onChange={(e) => setTheme(e.target.value as "auto" | "light" | "dark")}
          className="border px-2 py-1 rounded-sm
                     bg-tnLight-bg text-tnLight-text
                     dark:bg-tnStorm-bg dark:text-tnStorm-text
                     border-tnLight-border dark:border-tnStorm-border
                     cursor-pointer
          "
        >
          <option value="auto">Auto (system)</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Right side: GitHub links and message */}
      <div className="text-sm flex items-center space-x-3">
        <span>© {new Date().getFullYear()} Pwned Proxy</span>
        <a
          href="https://github.com/dtuait/pwned-proxy-combined"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:underline"
        >
          <Github className="w-4 h-4 mr-1" />
          GitHub
        </a>
        {versionLabel ? (
          <span className="font-mono">{versionLabel}</span>
        ) : gitError ? (
          <span className="text-xs text-tnLight-muted dark:text-tnStorm-muted">
            {gitError}
          </span>
        ) : null}
        <span>Get involved on GitHub!</span>
      </div>
    </footer>
  );
}
