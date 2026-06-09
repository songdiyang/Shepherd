/**
 * 代码分析工具
 * 静态分析、复杂度计算、安全扫描、质量评估
 */

import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

export interface CodeAnalysisResult {
  file: string;
  metrics: CodeMetrics;
  issues: CodeIssue[];
  security: SecurityIssue[];
  dependencies: string[];
}

export interface CodeMetrics {
  lines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  halsteadVolume: number;
  functions: number;
  classes: number;
  averageFunctionLength: number;
}

export interface CodeIssue {
  type: 'style' | 'complexity' | 'duplication' | 'naming' | 'structure';
  severity: 'info' | 'warning' | 'error' | 'critical';
  line: number;
  column: number;
  message: string;
  rule: string;
  suggestion?: string;
}

export interface SecurityIssue {
  type: 'injection' | 'xss' | 'csrf' | 'secrets' | 'auth' | 'crypto' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  message: string;
  cwe?: string;
  owasp?: string;
  fix?: string;
}

export interface ProjectAnalysis {
  files: CodeAnalysisResult[];
  summary: {
    totalFiles: number;
    totalLines: number;
    totalIssues: number;
    totalSecurityIssues: number;
    averageComplexity: number;
    averageMaintainability: number;
    testCoverage: number;
    securityScore: number;
    qualityScore: number;
  };
}

// ==================== 代码分析器 ====================

export class CodeAnalyzer {
  private patterns: Record<string, RegExp[]> = {
    injection: [
      /eval\s*\(/,
      /new\s+Function\s*\(/,
      /exec\s*\(/,
      /innerHTML\s*=/.source,
    ].map(p => new RegExp(p)),
    secrets: [
      /password\s*[=:]\s*["'][^"']+["']/,
      /api[_-]?key\s*[=:]\s*["'][^"']+["']/,
      /secret\s*[=:]\s*["'][^"']+["']/,
      /token\s*[=:]\s*["'][^"']+["']/,
    ],
    auth: [
      /\/\/\s*TODO.*auth/i,
      /\/\/\s*FIXME.*auth/i,
      /disable.*security/i,
      /skip.*verification/i,
    ],
  };

  /**
   * 分析单个文件
   */
  analyzeFile(filePath: string): CodeAnalysisResult {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const metrics = this.calculateMetrics(content, lines);
    const issues = this.detectIssues(content, lines, filePath);
    const security = this.detectSecurityIssues(content, lines, filePath);
    const dependencies = this.extractDependencies(content, filePath);

    return {
      file: filePath,
      metrics,
      issues,
      security,
      dependencies,
    };
  }

  /**
   * 分析整个项目
   */
  analyzeProject(projectPath: string, extensions: string[] = ['.ts', '.js', '.tsx', '.jsx']): ProjectAnalysis {
    const { execSync } = require('child_process');
    const { globSync } = require('glob');

    // Find all source files
    const pattern = join(projectPath, '**', `*.{${extensions.map(e => e.replace('.', '')).join(',')}}`);
    const files = globSync(pattern, { ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] });

    const results: CodeAnalysisResult[] = [];
    for (const file of files) {
      try {
        results.push(this.analyzeFile(file));
      } catch (err) {
        console.warn(`Failed to analyze ${file}:`, err);
      }
    }

    const summary = this.calculateSummary(results);

    return {
      files: results,
      summary,
    };
  }

  /**
   * 计算代码度量
   */
  private calculateMetrics(content: string, lines: string[]): CodeMetrics {
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;
    let inMultiLineComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        blankLines++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        commentLines++;
      } else if (trimmed.includes('/*')) {
        commentLines++;
        inMultiLineComment = true;
      } else if (trimmed.includes('*/')) {
        commentLines++;
        inMultiLineComment = false;
      } else if (inMultiLineComment) {
        commentLines++;
      } else {
        codeLines++;
      }
    }

    const complexity = this.calculateCyclomaticComplexity(content);
    const functions = this.countFunctions(content);
    const classes = this.countClasses(content);

    return {
      lines: lines.length,
      codeLines,
      commentLines,
      blankLines,
      cyclomaticComplexity: complexity,
      cognitiveComplexity: complexity * 1.2, // Simplified
      maintainabilityIndex: this.calculateMaintainabilityIndex(codeLines, complexity, commentLines),
      halsteadVolume: this.calculateHalsteadVolume(content),
      functions,
      classes,
      averageFunctionLength: functions > 0 ? codeLines / functions : 0,
    };
  }

  /**
   * 计算圈复杂度
   */
  private calculateCyclomaticComplexity(content: string): number {
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b&&\b/g,
      /\b\|\|\b/g,
      /\?\s*:/g,
    ];

    let complexity = 1; // Base complexity
    for (const pattern of complexityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * 计算可维护性指数
   */
  private calculateMaintainabilityIndex(lines: number, complexity: number, comments: number): number {
    // Simplified MI formula
    const avgLinesPerFunction = lines / Math.max(1, complexity);
    const commentRatio = comments / Math.max(1, lines);
    
    let mi = 171 - 5.2 * Math.log(complexity) - 0.23 * Math.log(lines) - 16.2 * Math.log(avgLinesPerFunction);
    mi += 50 * Math.sin(Math.sqrt(2.46 * commentRatio));
    
    return Math.max(0, Math.min(100, mi));
  }

  /**
   * 计算 Halstead 复杂度
   */
  private calculateHalsteadVolume(content: string): number {
    const operators = content.match(/[\+\-\*\/\=\!\&\|\<\>\%\^\~\?\:]/g) || [];
    const operands = content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    
    const uniqueOperators = new Set(operators).size;
    const uniqueOperands = new Set(operands).size;
    const totalOperators = operators.length;
    const totalOperands = operands.length;
    
    const vocabulary = uniqueOperators + uniqueOperands;
    const length = totalOperators + totalOperands;
    
    if (vocabulary === 0) return 0;
    
    return length * Math.log2(vocabulary);
  }

  /**
   * 检测代码问题
   */
  private detectIssues(content: string, lines: string[], filePath: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Check line length
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 120) {
        issues.push({
          type: 'style',
          severity: 'warning',
          line: i + 1,
          column: 120,
          message: `Line exceeds 120 characters (${lines[i].length})`,
          rule: 'max-line-length',
          suggestion: 'Break line into multiple lines',
        });
      }
    }

    // Check function length
    const functionMatches = content.matchAll(/function\s+\w+\s*\([^)]*\)\s*\{/g);
    for (const match of functionMatches) {
      const startIndex = match.index || 0;
      const startLine = content.substring(0, startIndex).split('\n').length;
      
      // Find closing brace (simplified)
      const endIndex = this.findClosingBrace(content, startIndex + match[0].length);
      if (endIndex > 0) {
        const functionContent = content.substring(startIndex, endIndex);
        const functionLines = functionContent.split('\n').length;
        
        if (functionLines > 50) {
          issues.push({
            type: 'complexity',
            severity: 'warning',
            line: startLine,
            column: 1,
            message: `Function is too long (${functionLines} lines)`,
            rule: 'max-function-length',
            suggestion: 'Refactor into smaller functions',
          });
        }
      }
    }

    // Check TODO/FIXME comments
    for (let i = 0; i < lines.length; i++) {
      if (/\/\/\s*TODO/i.test(lines[i]) || /\/\/\s*FIXME/i.test(lines[i])) {
        issues.push({
          type: 'structure',
          severity: 'info',
          line: i + 1,
          column: 1,
          message: 'Unresolved TODO/FIXME comment',
          rule: 'no-todo',
        });
      }
    }

    return issues;
  }

  /**
   * 检测安全问题
   */
  private detectSecurityIssues(content: string, lines: string[], filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for SQL injection
      if (/query\s*\(.*\+/.test(line) || /exec\s*\(.*\+/.test(line)) {
        issues.push({
          type: 'injection',
          severity: 'critical',
          line: i + 1,
          message: 'Potential SQL injection vulnerability',
          cwe: 'CWE-89',
          owasp: 'A03:2021',
          fix: 'Use parameterized queries',
        });
      }

      // Check for XSS
      if (/innerHTML\s*=/.test(line) || /document\.write\s*\(/.test(line)) {
        issues.push({
          type: 'xss',
          severity: 'high',
          line: i + 1,
          message: 'Potential XSS vulnerability',
          cwe: 'CWE-79',
          owasp: 'A03:2021',
          fix: 'Use textContent instead of innerHTML',
        });
      }

      // Check for hardcoded secrets
      for (const pattern of this.patterns.secrets) {
        if (pattern.test(line)) {
          issues.push({
            type: 'secrets',
            severity: 'critical',
            line: i + 1,
            message: 'Hardcoded secret detected',
            cwe: 'CWE-798',
            owasp: 'A07:2021',
            fix: 'Use environment variables or secret management',
          });
        }
      }

      // Check for weak crypto
      if (/md5\s*\(|sha1\s*\(/.test(line)) {
        issues.push({
          type: 'crypto',
          severity: 'medium',
          line: i + 1,
          message: 'Weak hashing algorithm detected',
          cwe: 'CWE-327',
          fix: 'Use SHA-256 or bcrypt',
        });
      }
    }

    return issues;
  }

  /**
   * 提取依赖
   */
  private extractDependencies(content: string, filePath: string): string[] {
    const dependencies: string[] = [];
    const ext = extname(filePath);

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      // ES6 imports
      const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
      for (const match of importMatches) {
        if (!match[1].startsWith('.')) {
          dependencies.push(match[1]);
        }
      }

      // CommonJS requires
      const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const match of requireMatches) {
        if (!match[1].startsWith('.')) {
          dependencies.push(match[1]);
        }
      }
    }

    return [...new Set(dependencies)];
  }

  /**
   * 查找闭合大括号
   */
  private findClosingBrace(content: string, startIndex: number): number {
    let depth = 1;
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') depth--;
      if (depth === 0) return i;
    }
    return -1;
  }

  /**
   * 统计函数数量
   */
  private countFunctions(content: string): number {
    const patterns = [
      /function\s+\w+\s*\(/g,
      /\w+\s*:\s*function\s*\(/g,
      /\w+\s*=\s*\([^)]*\)\s*=>/g,
      /async\s+function\s+\w+\s*\(/g,
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    }

    return count;
  }

  /**
   * 统计类数量
   */
  private countClasses(content: string): number {
    const matches = content.match(/class\s+\w+/g);
    return matches ? matches.length : 0;
  }

  /**
   * 计算项目摘要
   */
  private calculateSummary(results: CodeAnalysisResult[]): ProjectAnalysis['summary'] {
    const totalFiles = results.length;
    const totalLines = results.reduce((sum, r) => sum + r.metrics.lines, 0);
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const totalSecurityIssues = results.reduce((sum, r) => sum + r.security.length, 0);
    const avgComplexity = totalFiles > 0
      ? results.reduce((sum, r) => sum + r.metrics.cyclomaticComplexity, 0) / totalFiles
      : 0;
    const avgMaintainability = totalFiles > 0
      ? results.reduce((sum, r) => sum + r.metrics.maintainabilityIndex, 0) / totalFiles
      : 0;

    // Calculate security score (0-100)
    const securityScore = totalFiles > 0
      ? Math.max(0, 100 - (totalSecurityIssues / totalFiles) * 20)
      : 100;

    // Calculate quality score (0-100)
    const qualityScore = totalFiles > 0
      ? Math.max(0, 100 - (totalIssues / totalFiles) * 10 - avgComplexity * 2)
      : 100;

    return {
      totalFiles,
      totalLines,
      totalIssues,
      totalSecurityIssues,
      averageComplexity: avgComplexity,
      averageMaintainability: avgMaintainability,
      testCoverage: 0, // Would need test coverage data
      securityScore,
      qualityScore,
    };
  }
}

export default CodeAnalyzer;
