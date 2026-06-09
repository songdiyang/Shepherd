/**
 * Shepherd Architecture Framework (SAF)
 * 入口文件
 */

export * from './core/models';
export * from './core/algorithms';
export * from './agents';
export * from './orchestrator';

// 版本信息
export const VERSION = '1.0.0-alpha';
export const FRAMEWORK_NAME = 'Shepherd Architecture Framework';

// 核心命题
export const PROPOSITIONS = {
  STRUCTURAL_ISOMORPHISM: '结构同构命题：软件分层架构与多智能体层级架构存在保序映射',
  DELEGATION_ACCOUNTABILITY_SEPARATION: '委托可行性-责任归属分离命题：70%任务可委托（技术维度），30%任务不可替代（治理维度）',
  DEMAND_CONSTANCY: '需求恒常性命题：AI不改变软件本质需求，只改变实现方式',
};

console.log(`🐑 ${FRAMEWORK_NAME} v${VERSION} loaded.`);
console.log('Core Propositions:');
Object.values(PROPOSITIONS).forEach(p => console.log(`  • ${p}`));
