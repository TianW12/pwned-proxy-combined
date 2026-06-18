import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

type GitInfo = {
  branch?: string;
  commit?: string;
};

function getEnvGitInfo(): GitInfo {
  const envBranch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GIT_BRANCH ||
    process.env.NEXT_PUBLIC_GIT_BRANCH;

  const envCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;

  return {
    branch: envBranch ?? undefined,
    commit: envCommit ? envCommit.slice(0, 7) : undefined,
  };
}

function getGitDirInfo(): GitInfo {
  try {
    const gitDir = process.env.GIT_DIR || join(process.cwd(), ".git");

    if (!existsSync(gitDir)) {
      return {};
    }

    const headPath = join(gitDir, "HEAD");
    const headContents = readFileSync(headPath, "utf8").trim();

    if (!headContents) {
      return {};
    }

    if (headContents.startsWith("ref:")) {
      const refPath = headContents.replace("ref: ", "").trim();
      const branch = refPath.split("/").pop();
      const commitPath = join(gitDir, refPath);

      if (existsSync(commitPath)) {
        const commitContents = readFileSync(commitPath, "utf8").trim();
        return { branch: branch ?? undefined, commit: commitContents.slice(0, 7) };
      }

      return { branch: branch ?? undefined };
    }

    // Detached HEAD state
    return { commit: headContents.slice(0, 7) };
  } catch (error) {
    return {};
  }
}

function getGitCommandInfo(): GitInfo {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    const commit = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    return { branch, commit };
  } catch (error) {
    return {};
  }
}

export async function GET() {
  const envInfo = getEnvGitInfo();
  const gitInfo: GitInfo = { ...envInfo };

  if (!gitInfo.branch || !gitInfo.commit) {
    const dirInfo = getGitDirInfo();
    gitInfo.branch = gitInfo.branch ?? dirInfo.branch;
    gitInfo.commit = gitInfo.commit ?? dirInfo.commit;
  }

  if (!gitInfo.branch || !gitInfo.commit) {
    const commandInfo = getGitCommandInfo();
    gitInfo.branch = gitInfo.branch ?? commandInfo.branch;
    gitInfo.commit = gitInfo.commit ?? commandInfo.commit;
  }

  if (!gitInfo.branch && !gitInfo.commit) {
    return NextResponse.json({ error: "Git information unavailable" }, { status: 200 });
  }

  return NextResponse.json(gitInfo);
}
