/**
 * Git 集成工具
 * 支持代码库状态获取、变更检测、分支管理
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export interface GitRepository {
  path: string;
  remoteUrl: string;
  branch: string;
  commitHash: string;
  status: GitStatus;
  recentCommits: GitCommit[];
  fileTree: GitFileNode[];
}

export interface GitStatus {
  ahead: number;
  behind: number;
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files: string[];
}

export interface GitFileNode {
  path: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: string;
  hash?: string;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  patch: string;
}

// ==================== Git 工具类 ====================

export class GitIntegration {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * 检查是否为 Git 仓库
   */
  isGitRepository(): boolean {
    return existsSync(join(this.repoPath, '.git'));
  }

  /**
   * 获取仓库完整信息
   */
  getRepository(): GitRepository {
    if (!this.isGitRepository()) {
      throw new Error(`Not a git repository: ${this.repoPath}`);
    }

    return {
      path: this.repoPath,
      remoteUrl: this.getRemoteUrl(),
      branch: this.getCurrentBranch(),
      commitHash: this.getCurrentCommit(),
      status: this.getStatus(),
      recentCommits: this.getRecentCommits(10),
      fileTree: this.getFileTree(),
    };
  }

  /**
   * 获取远程仓库 URL
   */
  getRemoteUrl(): string {
    try {
      return this.exec('remote get-url origin').trim();
    } catch {
      return 'no-remote';
    }
  }

  /**
   * 获取当前分支
   */
  getCurrentBranch(): string {
    try {
      return this.exec('rev-parse --abbrev-ref HEAD').trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * 获取当前 commit hash
   */
  getCurrentCommit(): string {
    try {
      return this.exec('rev-parse HEAD').trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * 获取仓库状态
   */
  getStatus(): GitStatus {
    try {
      const status = this.exec('status --porcelain -b');
      const lines = status.split('\n').filter(line => line.trim());

      const statusResult: GitStatus = {
        ahead: 0,
        behind: 0,
        modified: [],
        added: [],
        deleted: [],
        untracked: [],
      };

      for (const line of lines) {
        if (line.startsWith('##')) {
          // Branch info
          const match = line.match(/ahead\s+(\d+)/);
          if (match) statusResult.ahead = parseInt(match[1]);
          const match2 = line.match(/behind\s+(\d+)/);
          if (match2) statusResult.behind = parseInt(match2[1]);
        } else {
          const statusCode = line.substring(0, 2);
          const file = line.substring(3).trim();

          if (statusCode.includes('M')) statusResult.modified.push(file);
          if (statusCode.includes('A')) statusResult.added.push(file);
          if (statusCode.includes('D')) statusResult.deleted.push(file);
          if (statusCode.includes('?')) statusResult.untracked.push(file);
        }
      }

      return statusResult;
    } catch {
      return {
        ahead: 0, behind: 0,
        modified: [], added: [], deleted: [], untracked: [],
      };
    }
  }

  /**
   * 获取最近提交记录
   */
  getRecentCommits(limit: number = 10): GitCommit[] {
    try {
      const format = '%H|%an|%ae|%ad|%s';
      const output = this.exec(`log --format="${format}" --date=iso -n ${limit}`);
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|');
          return {
            hash: parts[0] || '',
            author: parts[1] || '',
            email: parts[2] || '',
            date: parts[3] || '',
            message: parts[4] || '',
            files: this.getCommitFiles(parts[0]),
          };
        });
    } catch {
      return [];
    }
  }

  /**
   * 获取提交的文件列表
   */
  private getCommitFiles(commitHash: string): string[] {
    try {
      const output = this.exec(`show --name-only --format="" ${commitHash}`);
      return output.split('\n').filter(f => f.trim());
    } catch {
      return [];
    }
  }

  /**
   * 获取文件树
   */
  getFileTree(path: string = ''): GitFileNode[] {
    try {
      const targetPath = join(this.repoPath, path);
      const output = this.exec(`ls-tree -r HEAD ${path}`);
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(/\s+/);
          const type = parts[1] as 'file' | 'directory';
          const hash = parts[2];
          const filePath = parts.slice(3).join(' ');
          
          return {
            path: filePath,
            type,
            size: 0, // Would need additional command to get size
            lastModified: '',
            hash,
          };
        });
    } catch {
      return [];
    }
  }

  /**
   * 获取变更差异
   */
  getDiff(ref: string = 'HEAD~1'): GitDiff[] {
    try {
      const output = this.exec(`diff ${ref} --stat`);
      const lines = output.split('\n').filter(line => line.includes('|'));

      return lines.map(line => {
        const match = line.match(/(.+)\s+\|\s+(\d+)\s+([+-]+)/);
        if (!match) return null;

        const file = match[1].trim();
        const changes = match[3];
        const additions = (changes.match(/\+/g) || []).length;
        const deletions = (changes.match(/-/g) || []).length;

        return {
          file,
          additions,
          deletions,
          patch: this.getFilePatch(file, ref),
        };
      }).filter(Boolean) as GitDiff[];
    } catch {
      return [];
    }
  }

  private getFilePatch(file: string, ref: string): string {
    try {
      return this.exec(`diff ${ref} -- ${file}`);
    } catch {
      return '';
    }
  }

  /**
   * 获取分支列表
   */
  getBranches(): string[] {
    try {
      const output = this.exec('branch -a');
      return output.split('\n')
        .map(b => b.replace('*', '').trim())
        .filter(b => b);
    } catch {
      return [];
    }
  }

  /**
   * 创建新分支
   */
  createBranch(name: string): void {
    this.exec(`checkout -b ${name}`);
  }

  /**
   * 切换分支
   */
  checkoutBranch(name: string): void {
    this.exec(`checkout ${name}`);
  }

  /**
   * 提交变更
   */
  commit(message: string, files?: string[]): void {
    if (files && files.length > 0) {
      for (const file of files) {
        this.exec(`add "${file}"`);
      }
    } else {
      this.exec('add -A');
    }
    this.exec(`commit -m "${message}"`);
  }

  /**
   * 执行 Git 命令
   */
  private exec(command: string): string {
    try {
      return execSync(`git -C "${this.repoPath}" ${command}`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });
    } catch (err: any) {
      throw new Error(`Git command failed: git ${command}\n${err.message}`);
    }
  }
}

export default GitIntegration;
