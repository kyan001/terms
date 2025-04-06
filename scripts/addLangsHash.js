#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 目录路径
const META_DIR = path.join(__dirname, '..', 'meta');
const GLOSSARIES_DIR = path.join(__dirname, '..', 'glossaries');

// 计算文件的 SHA-256 哈希值
function calculateFileHash(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256');
    hash.update(fileContent);
    return hash.digest('hex');
  } catch (error) {
    console.error(`计算哈希值失败: ${filePath}`, error);
    return null;
  }
}

// 处理单个 meta 文件
function processMetaFile(metaFilePath) {
  try {
    // 读取并解析 meta JSON 文件
    const metaContent = fs.readFileSync(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);
    
    // 获取 meta_name (id) 和支持的语言列表
    const metaName = metaData.id;
    const langs = metaData.langs || [];
    
    if (!metaName) {
      console.error(`错误: meta 文件 ${metaFilePath} 缺少 id 字段`);
      return;
    }
    
    if (!Array.isArray(langs) || langs.length === 0) {
      console.warn(`警告: meta 文件 ${metaFilePath} 没有定义支持的语言`);
      return;
    }
    
    // 初始化 langsHash 对象
    const langsHash = {};
    
    // 处理每种语言
    for (const lang of langs) {
      let csvFilePath;
      
      // 根据是否为 "auto" 确定 CSV 文件路径
      if (lang === 'auto') {
        csvFilePath = path.join(GLOSSARIES_DIR, `${metaName}.csv`);
      } else {
        csvFilePath = path.join(GLOSSARIES_DIR, `${metaName}_${lang}.csv`);
      }
      
      // 检查 CSV 文件是否存在
      if (fs.existsSync(csvFilePath)) {
        // 计算哈希值并添加到 langsHash 对象
        const fileHash = calculateFileHash(csvFilePath);
        if (fileHash) {
          langsHash[lang] = fileHash;
        }
      } else {
        console.warn(`警告: ${metaName} 的 ${lang} 语言 CSV 文件不存在 (${csvFilePath})`);
        // 不添加此语言到 langsHash 中
      }
    }
    
    // 将 langsHash 添加到 meta 数据中
    metaData.langsHash = langsHash;
    
    // 格式化并写回文件
    const updatedContent = JSON.stringify(metaData, null, 2);
    fs.writeFileSync(metaFilePath, updatedContent, 'utf8');
    
    console.log(`更新成功: ${metaFilePath}`);
    
  } catch (error) {
    console.error(`处理 ${metaFilePath} 时出错:`, error);
  }
}

// 主函数
function main() {
  try {
    // 获取所有 meta JSON 文件
    const metaFiles = fs.readdirSync(META_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(META_DIR, file));
    
    if (metaFiles.length === 0) {
      console.log('未找到 meta JSON 文件。');
      return;
    }
    
    console.log(`找到 ${metaFiles.length} 个 meta 文件，开始处理...`);
    
    // 处理每个 meta 文件
    metaFiles.forEach(processMetaFile);
    
    console.log('所有 meta 文件处理完成。');
    
  } catch (error) {
    console.error('执行过程中出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 