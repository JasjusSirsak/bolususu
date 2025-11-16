#!/usr/bin/env node
/**
 * Quick test script untuk verify setup
 */

console.log('🔍 Checking Insight Auth Setup...\n');

// 1. Check Node.js version
console.log('✅ Node.js version:', process.version);

// 2. Check required modules
const requiredModules = ['express', 'cors', 'pg', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
const missingModules = [];

requiredModules.forEach(module => {
    try {
        require.resolve(module);
        console.log(`✅ ${module} - installed`);
    } catch (e) {
        console.log(`❌ ${module} - NOT installed`);
        missingModules.push(module);
    }
});

// 3. Check files
const fs = require('fs');
const path = require('path');

console.log('\n📁 Checking files...');
const files = [
    '../.env',
    './server.js',
    '../auth/script.js',
    '../auth/auth.js',
    '../auth/auth.html'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Summary
console.log('\n' + '='.repeat(50));
if (missingModules.length === 0) {
    console.log('✅ All checks passed! Ready to start server.');
    console.log('\n📝 To start server:');
    console.log('   cd api');
    console.log('   npm start');
} else {
    console.log(`❌ Missing modules: ${missingModules.join(', ')}`);
    console.log('\n📝 Fix with:');
    console.log('   npm install ' + missingModules.join(' '));
}
console.log('='.repeat(50));
