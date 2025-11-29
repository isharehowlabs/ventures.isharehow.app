#!/usr/bin/env node

/**
 * Script to check for invalid 'class' attributes in JSX/TSX files
 * React requires 'className' instead of 'class' in JSX
 */

const fs = require('fs');
const path = require('path');

const JSX_PATTERN = /<[^>]+\sclass\s*=/g;
const EXCLUDE_DIRS = ['node_modules', '.next', 'out', '.git'];

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (/\.(tsx|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const matches = line.match(JSX_PATTERN);
    if (matches) {
      issues.push({
        line: index + 1,
        content: line.trim(),
        matches: matches.length,
      });
    }
  });

  return issues;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
let hasIssues = false;

if (!fs.existsSync(srcDir)) {
  console.log('❌ src directory not found');
  process.exit(1);
}

console.log('🔍 Checking for invalid "class" attributes in JSX/TSX files...\n');

const files = findFiles(srcDir);
let totalIssues = 0;

files.forEach((file) => {
  const issues = checkFile(file);
  if (issues.length > 0) {
    hasIssues = true;
    totalIssues += issues.length;
    const relativePath = path.relative(__dirname, file);
    console.log(`❌ ${relativePath}`);
    issues.forEach((issue) => {
      console.log(`   Line ${issue.line}: ${issue.content.substring(0, 80)}...`);
    });
    console.log('');
  }
});

if (hasIssues) {
  console.log(`\n⚠️  Found ${totalIssues} issue(s) using 'class' instead of 'className'`);
  console.log('   Fix: Replace all instances of "class=" with "className=" in JSX\n');
  process.exit(1);
} else {
  console.log(`✅ No issues found! Checked ${files.length} file(s)\n`);
  process.exit(0);
}

