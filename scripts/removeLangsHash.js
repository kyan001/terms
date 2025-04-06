#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 要删除的键名
const KEY_TO_REMOVE = 'langsHash';

// meta 目录路径
const META_DIR = path.join(__dirname, '..', 'meta');

// 处理单个 meta 文件
function processMetaFile(metaFilePath) {
  try {
    // 读取并解析 meta JSON 文件
    const metaContent = fs.readFileSync(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);
    
    // 检查是否存在要删除的键
    if (KEY_TO_REMOVE in metaData) {
      // 删除指定的键
      delete metaData[KEY_TO_REMOVE];
      
      // 格式化并写回文件
      const updatedContent = JSON.stringify(metaData, null, 2);
      fs.writeFileSync(metaFilePath, updatedContent, 'utf8');
      
      console.log(`已从 ${metaFilePath} 中删除 ${KEY_TO_REMOVE} 键`);
    } else {
      console.log(`文件 ${metaFilePath} 中不存在 ${KEY_TO_REMOVE} 键，无需修改`);
    }
    
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
    console.log(`将删除所有文件中的 '${KEY_TO_REMOVE}' 键`);
    
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