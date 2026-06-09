#!/usr/bin/env node
/**
 * 真实API简化实验 - 单模式演示
 * 使用DeepSeek API进行真实工作模拟
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_CONFIG = {
  baseUrl: 'api.deepseek.com',
  apiKey: 'sk-7d827829215c4add9ef659ae09e78fc9',
  model: 'deepseek-chat',
  maxTokens: 1500,
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

async function runShepherdDemo() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🧪 真实API实验 - Shepherd模式演示                    ║');
  console.log('║     使用DeepSeek API进行真实工作模拟                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  const team = [
    { name: '架构师', role: 'architect', prompt: '你是一名系统架构师，擅长微服务架构设计。请给出专业、简洁的方案。' },
    { name: '后端工程师', role: 'backend', prompt: '你是一名Node.js后端工程师，擅长REST API开发。请给出可运行的代码示例。' },
    { name: '前端工程师', role: 'frontend', prompt: '你是一名前端工程师，擅长React开发。请给出组件代码示例。' }
  ];

  const tasks = [
    { name: '电商系统架构设计', role: 'architect', desc: '设计一个电商系统的微服务架构，包含用户服务、商品服务、订单服务' },
    { name: '用户API开发', role: 'backend', desc: '开发用户注册、登录、JWT认证的REST API' },
    { name: '用户登录页面', role: 'frontend', desc: '开发React登录页面，包含表单验证' }
  ];

  const results = [];
  let apiCalls = 0;

  // 阶段1: 架构设计（需审批）
  console.log('📋 阶段1: 架构设计（需牧羊人审批）');
  const archTask = tasks[0];
  const architect = team.find(t => t.role === 'architect');
  
  console.log(`   🐑 ${architect.name} 开始: ${archTask.name}`);
  try {
    apiCalls++;
    const startTime = Date.now();
    const result = await callDeepSeekAPI([
      { role: 'system', content: architect.prompt },
      { role: 'user', content: `任务: ${archTask.name}\n描述: ${archTask.desc}\n\n请给出架构设计（300字以内）。` }
    ]);
    const duration = (Date.now() - startTime) / 1000;
    console.log(`   ✅ 完成 (${duration.toFixed(1)}s)`);
    results.push({ task: archTask.name, role: architect.name, duration, result: result.substring(0, 300) });

    // 牧羊犬审核
    console.log('   🔍 牧羊犬审核架构...');
    apiCalls++;
    const review = await callDeepSeekAPI([
      { role: 'system', content: '你是一名技术主管，负责审核架构设计。给出改进建议。' },
      { role: 'user', content: `请审核以下架构设计（200字以内）：\n\n${result}` }
    ]);
    console.log('   ✅ 审核完成');
    results.push({ task: '架构审核', role: '技术主管', duration: 0, result: review.substring(0, 200) });
  } catch (e) {
    console.log(`   ❌ 失败: ${e.message}`);
  }

  // 阶段2: 并行开发
  console.log('\n📋 阶段2: 并行开发');
  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    const member = team.find(t => t.role === task.role);
    
    console.log(`   🐑 ${member.name} 开始: ${task.name}`);
    try {
      apiCalls++;
      const startTime = Date.now();
      const result = await callDeepSeekAPI([
        { role: 'system', content: member.prompt },
        { role: 'user', content: `任务: ${task.name}\n描述: ${task.desc}\n\n请给出实现方案（300字以内）。` }
      ]);
      const duration = (Date.now() - startTime) / 1000;
      console.log(`   ✅ 完成 (${duration.toFixed(1)}s)`);
      results.push({ task: task.name, role: member.name, duration, result: result.substring(0, 300) });
    } catch (e) {
      console.log(`   ❌ 失败: ${e.message}`);
    }
  }

  // 生成报告
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              实验结果报告                               ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║ 工作模式: Shepherd                                     ║`);
  console.log(`║ API调用: ${apiCalls.toString().padEnd(48)} ║`);
  console.log(`║ 完成任务: ${results.length.toString().padEnd(47)} ║`);
  console.log(`║ 总耗时: ${results.reduce((s, r) => s + r.duration, 0).toFixed(1).padEnd(49)}s ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  
  results.forEach(r => {
    console.log(`║ ${r.role.padEnd(12)} | ${r.task.padEnd(20)} | ${r.duration.toFixed(1).padEnd(5)}s ║`);
  });
  
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // 显示完整结果
  console.log('📄 完整输出:');
  console.log('');
  results.forEach((r, i) => {
    console.log(`─── ${r.task} (${r.role}) ───`);
    console.log(r.result);
    console.log('');
  });

  // 导出结果
  const outputDir = path.join(__dirname, '..', 'simulation_results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filename = path.join(outputDir, `real_api_demo_${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`💾 结果已导出: ${filename}`);
  console.log('');
  console.log('✅ 实验完成！');
}

runShepherdDemo().catch(console.error);
