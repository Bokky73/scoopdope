#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const currentFile = process.argv[2];
const baselineFile = process.argv[3];

if (!currentFile || !fs.existsSync(currentFile)) {
  console.error('Usage: compare-performance.js <current.json> <baseline.json>');
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
const baseline = baselineFile && fs.existsSync(baselineFile)
  ? JSON.parse(fs.readFileSync(baselineFile, 'utf8'))
  : null;

const comparison = {
  timestamp: new Date().toISOString(),
  current_metrics: current.metrics,
  baseline_metrics: baseline?.metrics || {},
  metrics: {},
};

Object.keys(current.metrics).forEach(metric => {
  const currentValue = current.metrics[metric];
  const baselineValue = baseline?.metrics?.[metric] || currentValue;
  
  comparison.metrics[metric] = {
    baseline: baselineValue,
    current: currentValue,
    change: currentValue - baselineValue,
    change_percent: baselineValue > 0 ? ((currentValue - baselineValue) / baselineValue) * 100 : 0,
  };
});

console.log(JSON.stringify(comparison, null, 2));
