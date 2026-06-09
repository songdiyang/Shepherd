#!/usr/bin/env node
/**
 * 电商系统设计实验 - 五种模式对比
 * 使用DeepSeek API生成真实电商系统架构设计
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_CONFIG = {
  baseUrl: 'api.deepseek.com',
  apiKey: 'sk-7d827829215c4add9ef659ae09e78fc9',
  model: 'deepseek-chat',
  maxTokens: 1200,
  temperature: 0.7
};

async function callDeepSeekAPI(messages, temperature = 0.7) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: API_CONFIG.model,
      messages: messages,
      max_tokens: API_CONFIG.maxTokens,
      temperature: temperature
    });

    const options = {
      hostname: API_CONFIG.baseUrl,
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(data, 'utf8')
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('API响应格式错误'));
          }
        } catch (e) {
          reject(new Error(`API解析错误: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`API请求错误: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

const PROJECT = {
  name: '电商系统',
  description: '设计一个支持高并发的电商平台，支持商品管理、订单处理、支付系统、用户中心',
  requirements: [
    '支持10万QPS高并发',
    '支持秒杀活动',
    '支持多种支付方式',
    '支持库存管理',
    '支持订单追踪',
    '支持用户推荐',
    '支持多语言',
    '支持移动端'
  ]
};

const TEAM = [
  { name: '后端架构师', role: 'backend', prompt: '你是后端架构师，精通高并发系统、分布式事务。' },
  { name: '前端工程师', role: 'frontend', prompt: '你是前端工程师，精通React、性能优化。' },
  { name: '数据库专家', role: 'database', prompt: '你是数据库专家，精通MySQL、Redis、分库分表。' },
  { name: 'DevOps工程师', role: 'devops', prompt: '你是DevOps工程师，精通K8s、CI/CD。' }
];

const EXPERTS = [
  { name: '性能专家', prompt: '你是性能专家，从系统性能、高并发角度评分。' },
  { name: '架构专家', prompt: '你是架构专家，从架构合理性、可扩展性角度评分。' },
  { name: '安全专家', prompt: '你是安全专家，从安全性、数据保护角度评分。' }
];

async function runMode(mode) {
  console.log(`\n🛒 ${mode}模式 - 电商系统设计`);
  const sections = [];
  
  for (const member of TEAM) {
    console.log(`   🐑 ${member.name}...`);
    try {
      const start = Date.now();
      const result = await callDeepSeekAPI([
        { role: 'system', content: member.prompt },
        { role: 'user', content: `[${mode}模式]设计${PROJECT.name}的${member.role}方案（200字）。需求：${PROJECT.requirements.join('、')}` }
      ]);
      const duration = (Date.now() - start) / 1000;
      sections.push({ member: member.name, content: result, duration });
      console.log(`   ✅ ${member.name} (${duration.toFixed(1)}s)`);
    } catch (e) {
      console.log(`   ❌ ${member.name}: ${e.message}`);
    }
  }
  
  const scores = [];
  for (const expert of EXPERTS) {
    console.log(`   👨‍⚖️ ${expert.name}...`);
    try {
      const start = Date.now();
      const doc = sections.map(s => s.content.substring(0, 200)).join('\n\n');
      const result = await callDeepSeekAPI([
        { role: 'system', content: expert.prompt },
        { role: 'user', content: `评分（0-100）：${doc.substring(0, 500)}` }
      ], 0.5);
      const duration = (Date.now() - start) / 1000;
      const score = parseInt(result.match(/\d+/)?.[0] || '0');
      scores.push({ expert: expert.name, score, duration });
      console.log(`   ✅ ${expert.name}: ${score}分`);
    } catch (e) {
      console.log(`   ❌ ${expert.name}: ${e.message}`);
    }
  }
  
  const avg = scores.reduce((s, e) => s + e.score, 0) / scores.length;
  console.log(`   📊 ${mode}平均: ${avg.toFixed(1)}`);
  return { mode, sections, scores, avg };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🛒 电商系统设计 - 五种模式对比                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  const modes = ['Shepherd', 'Agile', 'Waterfall', 'Chaotic', 'Spiral'];
  const results = [];
  
  for (const mode of modes) {
    const result = await runMode(mode);
    results.push(result);
  }
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              电商系统设计对比报告                         ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║ 排名 | 模式      | 性能 | 架构 | 安全 | 平均           ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  
  const sorted = results.sort((a, b) => b.avg - a.avg);
  const ranks = ['🥇', '🥈', '🥉', '4', '5'];
  
  sorted.forEach((r, i) => {
    const s = r.scores.map(e => e.score.toString().padStart(3));
    console.log(`║ ${ranks[i]}   | ${r.mode.padEnd(9)} | ${s.join(' | ')} | ${r.avg.toFixed(1).padEnd(5)} ║`);
  });
  
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('✅ 实验完成！');
}

main().catch(console.error);
