# 基准测试脚本
# 用于测试 SAF 框架的性能指标

#!/bin/bash

set -e

API_URL="${API_URL:-http://localhost:3000}"
CONCURRENT_USERS="${CONCURRENT_USERS:-50}"
DURATION="${DURATION:-30}"

echo "🐑 Shepherd Architecture Benchmark"
echo "================================="
echo "API URL: $API_URL"
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Duration: $DURATION seconds"
echo ""

# Check prerequisites
command -v ab >/dev/null 2>&1 || { echo "❌ Apache Bench (ab) is required. Install with: apt-get install apache2-utils"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required. Install with: apt-get install jq"; exit 1; }

# Health check
echo "1. Health Check"
echo "---------------"
curl -s "$API_URL/health" | jq .

# Task delegation benchmark
echo ""
echo "2. Task Delegation Benchmark"
echo "---------------------------"

# Initialize system first
curl -s -X POST "$API_URL/v1/system/init" \
  -H "Content-Type: application/json" \
  -d '{"humanName": "Benchmark", "humanRole": "Tester"}' > /dev/null

# Benchmark task delegation
ab -n 1000 -c $CONCURRENT_USERS \
  -T "application/json" \
  -p /dev/stdin \
  "$API_URL/v1/tasks/delegate" <<EOF
{
  "title": "Benchmark Task",
  "description": "Performance benchmark task",
  "tags": ["benchmark"],
  "priority": 3
}
EOF

# Agent registration benchmark
echo ""
echo "3. Agent Registration Benchmark"
echo "-------------------------------"
ab -n 500 -c $CONCURRENT_USERS \
  -T "application/json" \
  -p /dev/stdin \
  "$API_URL/v1/agents/register" <<EOF
{
  "name": "Benchmark Agent",
  "level": "EXECUTIVE",
  "capabilities": ["benchmark"],
  "autonomyLevel": 0.8
}
EOF

# Audit log benchmark
echo ""
echo "4. Audit Log Query Benchmark"
echo "---------------------------"
ab -n 1000 -c $CONCURRENT_USERS "$API_URL/v1/audit/logs"

echo ""
echo "✅ Benchmark completed!"
