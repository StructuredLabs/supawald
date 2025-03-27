#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");

const targetDir = process.argv[2] || "supawald-app";
const cwd = process.cwd();
const dest = path.join(cwd, targetDir);
const template = path.join(__dirname, "template");

if (fs.existsSync(dest)) {
  console.error(`❌ Directory "${targetDir}" already exists.`);
  process.exit(1);
}

fs.copySync(template, dest);
console.log(`✅ Supawald project created in "${targetDir}"`);
console.log(`👉 cd ${targetDir}`);
console.log("📦 Run `npm install` to get started!"); 