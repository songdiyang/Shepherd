/**
 * 牧羊人架构 - 计算机设计实验
 * 用SAF框架设计一个简化计算机系统
 */

const fs = require('fs');
const path = require('path');

// 计算机系统组件
const COMPUTER_COMPONENTS = {
  cpu: {
    name: 'CPU',
    description: '中央处理器',
    complexity: 5,
    modules: [
      { name: 'ALU', description: '算术逻辑单元', complexity: 4 },
      { name: 'Control Unit', description: '控制单元', complexity: 5 },
      { name: 'Registers', description: '寄存器组', complexity: 3 },
      { name: 'Cache', description: '缓存系统', complexity: 4 },
      { name: 'Pipeline', description: '流水线', complexity: 5 }
    ]
  },
  memory: {
    name: 'Memory System',
    description: '内存系统',
    complexity: 4,
    modules: [
      { name: 'RAM', description: '随机存取存储器', complexity: 3 },
      { name: 'ROM', description: '只读存储器', complexity: 2 },
      { name: 'MMU', description: '内存管理单元', complexity: 4 },
      { name: 'Virtual Memory', description: '虚拟内存', complexity: 4 }
    ]
  },
  io: {
    name: 'I/O System',
    description: '输入输出系统',
    complexity: 3,
    modules: [
      { name: 'Display Controller', description: '显示控制器', complexity: 3 },
      { name: 'Keyboard Controller', description: '键盘控制器', complexity: 2 },
      { name: 'Disk Controller', description: '磁盘控制器', complexity: 3 },
      { name: 'Network Interface', description: '网络接口', complexity: 4 }
    ]
  },
  bus: {
    name: 'Bus System',
    description: '总线系统',
    complexity: 3,
    modules: [
      { name: 'Data Bus', description: '数据总线', complexity: 2 },
      { name: 'Address Bus', description: '地址总线', complexity: 2 },
      { name: 'Control Bus', description: '控制总线', complexity: 3 }
    ]
  }
};

// 简化计算机模拟器
class SimpleComputer {
  constructor() {
    this.memory = new Array(1024).fill(0);  // 1KB内存
    this.registers = {
      A: 0, B: 0, C: 0, D: 0,    // 通用寄存器
      PC: 0,                      // 程序计数器
      SP: 1023,                   // 栈指针
      FLAGS: 0                    // 标志寄存器
    };
    this.running = false;
    this.output = [];
    this.cycles = 0;
    this.instructions = {
      0x01: { name: 'LOAD', fn: this.load.bind(this) },
      0x02: { name: 'STORE', fn: this.store.bind(this) },
      0x03: { name: 'ADD', fn: this.add.bind(this) },
      0x04: { name: 'SUB', fn: this.sub.bind(this) },
      0x05: { name: 'MUL', fn: this.mul.bind(this) },
      0x06: { name: 'DIV', fn: this.div.bind(this) },
      0x07: { name: 'JMP', fn: this.jump.bind(this) },
      0x08: { name: 'JZ', fn: this.jumpZero.bind(this) },
      0x09: { name: 'PUSH', fn: this.push.bind(this) },
      0x0A: { name: 'POP', fn: this.pop.bind(this) },
      0x0B: { name: 'CMP', fn: this.cmp.bind(this) },
      0x0C: { name: 'AND', fn: this.and.bind(this) },
      0x0D: { name: 'OR', fn: this.or.bind(this) },
      0x0E: { name: 'XOR', fn: this.xor.bind(this) },
      0x0F: { name: 'NOT', fn: this.not.bind(this) },
      0x10: { name: 'SHL', fn: this.shl.bind(this) },
      0x11: { name: 'SHR', fn: this.shr.bind(this) },
      0x12: { name: 'IN', fn: this.input.bind(this) },
      0x13: { name: 'OUT', fn: this.outputFn.bind(this) },
      0x14: { name: 'CALL', fn: this.call.bind(this) },
      0x15: { name: 'RET', fn: this.ret.bind(this) },
      0xFF: { name: 'HALT', fn: this.halt.bind(this) }
    };
  }

  // 指令实现
  load(addr) { this.registers.A = this.memory[addr]; }
  store(addr) { this.memory[addr] = this.registers.A; }
  add(addr) { this.registers.A += this.memory[addr]; this.updateFlags(); }
  sub(addr) { this.registers.A -= this.memory[addr]; this.updateFlags(); }
  mul(addr) { this.registers.A *= this.memory[addr]; this.updateFlags(); }
  div(addr) { this.registers.A = Math.floor(this.registers.A / this.memory[addr]); this.updateFlags(); }
  jump(addr) { this.registers.PC = addr; }
  jumpZero(addr) { if (this.registers.FLAGS === 0) this.registers.PC = addr; }
  push() { this.memory[this.registers.SP--] = this.registers.A; }
  pop() { this.registers.A = this.memory[++this.registers.SP]; }
  cmp(addr) { this.registers.FLAGS = this.registers.A - this.memory[addr]; }
  and(addr) { this.registers.A &= this.memory[addr]; this.updateFlags(); }
  or(addr) { this.registers.A |= this.memory[addr]; this.updateFlags(); }
  xor(addr) { this.registers.A ^= this.memory[addr]; this.updateFlags(); }
  not() { this.registers.A = ~this.registers.A; this.updateFlags(); }
  shl() { this.registers.A <<= 1; this.updateFlags(); }
  shr() { this.registers.A >>= 1; this.updateFlags(); }
  input(port) { this.registers.A = port; }  // 模拟输入
  outputFn(port) { this.output.push({ port, value: this.registers.A }); }
  call(addr) { this.memory[this.registers.SP--] = this.registers.PC; this.registers.PC = addr; }
  ret() { this.registers.PC = this.memory[++this.registers.SP]; }
  halt() { this.running = false; }

  updateFlags() {
    this.registers.FLAGS = this.registers.A === 0 ? 0 : (this.registers.A > 0 ? 1 : -1);
  }

  // 加载程序
  loadProgram(program) {
    program.forEach((instruction, index) => {
      this.memory[index] = instruction;
    });
  }

  // 执行一个周期
  step() {
    if (!this.running) return false;
    
    const opcode = this.memory[this.registers.PC++];
    const operand = this.memory[this.registers.PC++];
    
    if (this.instructions[opcode]) {
      this.instructions[opcode].fn(operand);
      this.cycles++;
    }
    
    return this.running;
  }

  // 运行程序
  run() {
    this.running = true;
    while (this.running && this.cycles < 10000) {
      this.step();
    }
    return this.getState();
  }

  // 获取状态
  getState() {
    return {
      registers: { ...this.registers },
      memory: this.memory.slice(0, 64),  // 只显示前64字节
      output: this.output,
      cycles: this.cycles,
      running: this.running
    };
  }

  reset() {
    this.memory.fill(0);
    this.registers = { A: 0, B: 0, C: 0, D: 0, PC: 0, SP: 1023, FLAGS: 0 };
    this.running = false;
    this.output = [];
    this.cycles = 0;
  }
}

// 牧羊人架构计算机开发模拟
class ShepherdComputerDev {
  constructor() {
    this.components = [];
    this.tasks = [];
    this.sheep = [];
    this.dogs = [];
    this.results = [];
  }

  init() {
    console.log('\n🏗️  初始化计算机设计项目...\n');
    
    // 创建羊（开发者）
    this.sheep = [
      { id: 'sheep_cpu', name: 'AI CPU Designer', type: 'AI', specialty: 'cpu', efficiency: 0.9 },
      { id: 'sheep_mem', name: 'AI Memory Designer', type: 'AI', specialty: 'memory', efficiency: 0.85 },
      { id: 'sheep_io', name: 'AI I/O Designer', type: 'AI', specialty: 'io', efficiency: 0.8 },
      { id: 'sheep_bus', name: 'AI Bus Designer', type: 'AI', specialty: 'bus', efficiency: 0.85 },
      { id: 'sheep_arch', name: 'Human Architect', type: 'HUMAN', specialty: 'all', efficiency: 0.95 },
      { id: 'sheep_test', name: 'Human Tester', type: 'HUMAN', specialty: 'testing', efficiency: 0.9 }
    ];
    
    // 创建牧羊犬（管理者）
    this.dogs = [
      { id: 'dog_hw', name: 'AI Hardware Manager', type: 'AI', role: 'task_manager', flock: ['sheep_cpu', 'sheep_mem', 'sheep_bus'] },
      { id: 'dog_sw', name: 'Human Software Manager', type: 'HUMAN', role: 'quality_inspector', flock: ['sheep_io', 'sheep_arch', 'sheep_test'] }
    ];
    
    // 创建任务
    this.createTasks();
    
    console.log('✅ 项目初始化完成');
    console.log(`   - 羊: ${this.sheep.length} 只`);
    console.log(`   - 牧羊犬: ${this.dogs.length} 只`);
    console.log(`   - 任务: ${this.tasks.length} 个`);
    console.log('');
  }

  createTasks() {
    let taskId = 0;
    
    Object.values(COMPUTER_COMPONENTS).forEach(component => {
      // 主组件任务
      this.tasks.push({
        id: `task_${taskId++}`,
        name: `${component.name} Design`,
        component: component.name,
        complexity: component.complexity,
        type: 'design',
        estimatedDays: component.complexity * 5,
        startDay: 1,
        completed: false
      });
      
      // 子模块任务
      component.modules.forEach(module => {
        this.tasks.push({
          id: `task_${taskId++}`,
          name: `${module.name} Implementation`,
          component: component.name,
          module: module.name,
          complexity: module.complexity,
          type: 'implement',
          estimatedDays: module.complexity * 3,
          startDay: 1,
          completed: false
        });
      });
      
      // 测试任务
      this.tasks.push({
        id: `task_${taskId++}`,
        name: `${component.name} Testing`,
        component: component.name,
        complexity: 2,
        type: 'test',
        estimatedDays: 3,
        startDay: 1,
        completed: false
      });
    });
    
    // 系统集成任务
    this.tasks.push({
      id: `task_${taskId++}`,
      name: 'System Integration',
      complexity: 4,
      type: 'integrate',
      estimatedDays: 10,
      startDay: 1,
      completed: false
    });
    
    this.tasks.push({
      id: `task_${taskId++}`,
      name: 'System Testing',
      complexity: 3,
      type: 'test',
      estimatedDays: 7,
      startDay: 1,
      completed: false
    });
  }

  simulateDevelopment() {
    console.log('🚀 开始计算机设计模拟...\n');
    
    let totalDays = 0;
    const dailyLog = [];
    
    // 模拟30天开发
    for (let day = 1; day <= 30; day++) {
      const dayTasks = this.tasks.filter(t => !t.completed && t.startDay <= day);
      const completed = [];
      
      dayTasks.forEach(task => {
        // 分配羊
        const sheep = this.assignSheep(task);
        if (!sheep) return;
        
        // 模拟执行
        const success = Math.random() < (sheep.efficiency * 0.9);
        const quality = success ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;
        
        if (success) {
          task.completed = true;
          task.completedDay = day;
          task.quality = quality;
          task.completedBy = sheep.name;
          completed.push(task);
          
          // 发放草奖励
          sheep.grass = (sheep.grass || 0) + Math.floor(quality * 50);
          sheep.reputation = (sheep.reputation || 0) + 10;
        }
      });
      
      if (completed.length > 0) {
        dailyLog.push({ day, completed: completed.length, tasks: completed.map(t => t.name) });
      }
      
      totalDays = day;
      
      // 检查是否完成
      if (this.tasks.every(t => t.completed)) {
        console.log(`✅ 所有任务完成于第 ${day} 天`);
        break;
      }
    }
    
    console.log(`\n📊 开发统计:`);
    console.log(`   总天数: ${totalDays}`);
    console.log(`   完成任务: ${this.tasks.filter(t => t.completed).length}/${this.tasks.length}`);
    console.log(`   完成率: ${(this.tasks.filter(t => t.completed).length / this.tasks.length * 100).toFixed(1)}%`);
    console.log(`   平均质量: ${(this.tasks.filter(t => t.completed).reduce((s, t) => s + t.quality, 0) / this.tasks.filter(t => t.completed).length).toFixed(2)}`);
    console.log('');
    
    return { totalDays, dailyLog };
  }

  assignSheep(task) {
    // 根据任务类型匹配羊
    const candidates = this.sheep.filter(s => {
      if (task.component && s.specialty === task.component.toLowerCase()) return true;
      if (task.type === 'test' && s.specialty === 'testing') return true;
      if (task.type === 'integrate' && s.specialty === 'all') return true;
      return false;
    });
    
    if (candidates.length === 0) return null;
    
    // 选择效率最高的
    candidates.sort((a, b) => b.efficiency - a.efficiency);
    return candidates[0];
  }

  testComputer() {
    console.log('🧪 测试计算机系统...\n');
    
    const computer = new SimpleComputer();
    
    // 测试程序1: 简单加法 5+3=8
    const program1 = [
      0x01, 20,     // LOAD 20 (5)
      0x03, 21,     // ADD 21 (3)
      0x13, 0,      // OUT 0
      0xFF, 0       // HALT
    ];
    
    computer.memory[20] = 5;
    computer.memory[21] = 3;
    
    console.log('测试1: 简单加法 5+3');
    computer.reset();
    computer.loadProgram(program1);
    computer.memory[20] = 5;
    computer.memory[21] = 3;
    const result1 = computer.run();
    console.log(`   结果: A=${result1.registers.A}, 周期=${result1.cycles}`);
    console.log(`   预期: 8`);
    console.log(`   输出: ${JSON.stringify(result1.output)}`);
    console.log(`   状态: ${result1.running ? '运行中' : '已停止'}`);
    console.log('');
    
    // 测试程序2: 减法 10-4=6
    const program2 = [
      0x01, 20,     // LOAD 20 (10)
      0x04, 21,     // SUB 21 (4)
      0x13, 1,      // OUT 1
      0xFF, 0       // HALT
    ];
    
    computer.memory[20] = 10;
    computer.memory[21] = 4;
    
    console.log('测试2: 减法 10-4');
    computer.reset();
    computer.loadProgram(program2);
    computer.memory[20] = 10;
    computer.memory[21] = 4;
    const result2 = computer.run();
    console.log(`   结果: A=${result2.registers.A}, 周期=${result2.cycles}`);
    console.log(`   预期: 6`);
    console.log(`   输出: ${JSON.stringify(result2.output)}`);
    console.log('');
    
    // 测试程序3: 乘法 6×7=42
    const program3 = [
      0x01, 20,     // LOAD 20 (6)
      0x05, 21,     // MUL 21 (7)
      0x13, 2,      // OUT 2
      0xFF, 0       // HALT
    ];
    
    computer.memory[20] = 6;
    computer.memory[21] = 7;
    
    console.log('测试3: 乘法 6×7');
    computer.reset();
    computer.loadProgram(program3);
    computer.memory[20] = 6;
    computer.memory[21] = 7;
    const result3 = computer.run();
    console.log(`   结果: A=${result3.registers.A}, 周期=${result3.cycles}`);
    console.log(`   预期: 42`);
    console.log(`   输出: ${JSON.stringify(result3.output)}`);
    console.log('');
    
    // 测试程序4: 逻辑运算 AND 5(0101)&3(0011)=1(0001)
    const program4 = [
      0x01, 20,     // LOAD 20 (5)
      0x0C, 21,     // AND 21 (3)
      0x13, 3,      // OUT 3
      0xFF, 0       // HALT
    ];
    
    computer.memory[20] = 5;
    computer.memory[21] = 3;
    
    console.log('测试4: 逻辑与 5&3');
    computer.reset();
    computer.loadProgram(program4);
    computer.memory[20] = 5;
    computer.memory[21] = 3;
    const result4 = computer.run();
    console.log(`   结果: A=${result4.registers.A}, 周期=${result4.cycles}`);
    console.log(`   预期: 1`);
    console.log(`   输出: ${JSON.stringify(result4.output)}`);
    console.log('');
    
    // 测试程序5: 移位运算 4<<1=8
    const program5 = [
      0x01, 20,     // LOAD 20 (4)
      0x10, 0,      // SHL
      0x13, 4,      // OUT 4
      0xFF, 0       // HALT
    ];
    
    computer.memory[20] = 4;
    
    console.log('测试5: 左移位 4<<1');
    computer.reset();
    computer.loadProgram(program5);
    computer.memory[20] = 4;
    const result5 = computer.run();
    console.log(`   结果: A=${result5.registers.A}, 周期=${result5.cycles}`);
    console.log(`   预期: 8`);
    console.log(`   输出: ${JSON.stringify(result5.output)}`);
    console.log('');
    
    return { result1, result2, result3, result4, result5 };
  }

  generateReport() {
    console.log('📊 生成计算机设计报告...\n');
    
    const completed = this.tasks.filter(t => t.completed);
    const avgQuality = completed.reduce((s, t) => s + t.quality, 0) / completed.length;
    
    const report = {
      project: '简化计算机系统',
      totalTasks: this.tasks.length,
      completedTasks: completed.length,
      completionRate: completed.length / this.tasks.length,
      averageQuality: avgQuality,
      sheep: this.sheep.map(s => ({
        name: s.name,
        type: s.type,
        grass: s.grass || 0,
        reputation: s.reputation || 0
      })),
      dogs: this.dogs.map(d => ({
        name: d.name,
        type: d.type,
        flockSize: d.flock.length
      }))
    };
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║          计算机设计项目报告                             ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 总任务: ${report.totalTasks.toString().padEnd(52)} ║`);
    console.log(`║ 已完成: ${report.completedTasks.toString().padEnd(51)} ║`);
    console.log(`║ 完成率: ${(report.completionRate * 100).toFixed(1).padEnd(50)}% ║`);
    console.log(`║ 平均质量: ${report.averageQuality.toFixed(2).padEnd(49)} ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 羊表现:                                                  ║');
    report.sheep.forEach(s => {
      console.log(`║   ${s.name.padEnd(20)} 草: ${s.grass.toString().padEnd(4)} 声望: ${s.reputation.toString().padEnd(4)} ║`);
    });
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 牧羊犬:                                                  ║');
    report.dogs.forEach(d => {
      console.log(`║   ${d.name.padEnd(25)} 管理: ${d.flockSize.toString().padEnd(2)} 只 ║`);
    });
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    
    // 导出数据
    const outputDir = path.join(__dirname, '..', 'simulation_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = path.join(outputDir, `computer_design_${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`💾 报告已导出: ${filename}`);
    console.log('');
    
    return report;
  }
}

// 主函数
function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🖥️  牧羊人架构 - 计算机设计实验                       ║');
  console.log('║     Shepherd Architecture Computer Design                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  const project = new ShepherdComputerDev();
  
  // 初始化项目
  project.init();
  
  // 模拟开发
  project.simulateDevelopment();
  
  // 测试计算机
  project.testComputer();
  
  // 生成报告
  project.generateReport();
  
  console.log('✅ 计算机设计实验完成！');
  console.log('');
  console.log('🖥️  计算机规格:');
  console.log('   - 内存: 1KB');
  console.log('   - 寄存器: 7个 (A, B, C, D, PC, SP, FLAGS)');
  console.log('   - 指令集: 22条指令');
  console.log('   - 总线: 8位数据总线 + 10位地址总线');
  console.log('   - 时钟: 模拟周期');
  console.log('');
  console.log('🐑 感谢使用牧羊人架构框架！');
}

if (require.main === module) {
  main();
}

module.exports = { ShepherdComputerDev, SimpleComputer, COMPUTER_COMPONENTS };
