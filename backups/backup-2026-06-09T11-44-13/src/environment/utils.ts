/**
 * Environment utilities
 * Shared environment state management helpers
 */

import { EnvironmentState, Task, CodebaseState, SystemMetrics } from '../core/models';

export class EnvironmentUtils {
  /**
   * Calculate system metrics from tasks and codebase
   */
  static calculateMetrics(state: EnvironmentState): SystemMetrics {
    const tasks = state.taskRegistry.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const failedTasks = tasks.filter(t => t.status === 'FAILED').length;
    
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const successRate = totalTasks > 0 ? (completedTasks - failedTasks) / totalTasks : 0;

    return {
      ...state.metrics,
      agentUtilization: {
        ...state.metrics.agentUtilization,
        tasksCompleted: completedTasks,
        tasksFailed: failedTasks,
      },
    };
  }

  /**
   * Check if environment constraints are met
   */
  static checkConstraints(state: EnvironmentState): Array<{ constraint: string; passed: boolean; message: string }> {
    const results = [];
    
    // Check test coverage
    if (state.metrics.testCoverage < 0.8) {
      results.push({
        constraint: 'testCoverage',
        passed: false,
        message: `Test coverage ${(state.metrics.testCoverage * 100).toFixed(1)}% is below 80%`,
      });
    }
    
    // Check security score
    if (state.metrics.securityScore < 0.7) {
      results.push({
        constraint: 'securityScore',
        passed: false,
        message: `Security score ${(state.metrics.securityScore * 100).toFixed(1)}% is below 70%`,
      });
    }
    
    // Check code complexity
    if (state.metrics.codeQuality.cyclomaticComplexity > 20) {
      results.push({
        constraint: 'cyclomaticComplexity',
        passed: false,
        message: `Cyclomatic complexity ${state.metrics.codeQuality.cyclomaticComplexity} exceeds 20`,
      });
    }
    
    return results;
  }

  /**
   * Update codebase state from git repository
   */
  static updateCodebaseFromGit(state: EnvironmentState, gitRepo: any): EnvironmentState {
    return {
      ...state,
      codebase: {
        ...state.codebase,
        repositoryUrl: gitRepo.remoteUrl,
        branch: gitRepo.branch,
        commitHash: gitRepo.commitHash,
        recentChanges: gitRepo.recentCommits,
      },
    };
  }

  /**
   * Merge task updates into environment state
   */
  static updateTaskState(state: EnvironmentState, task: Task): EnvironmentState {
    const tasks = state.taskRegistry.tasks.map(t => t.id === task.id ? task : t);
    
    return {
      ...state,
      taskRegistry: {
        ...state.taskRegistry,
        tasks,
      },
    };
  }
}

export default EnvironmentUtils;
