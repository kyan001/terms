#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 定义文件路径
const INDEX_PATH = path.resolve(__dirname, '../meta/index.json');
const META_DIR = path.resolve(__dirname, '../meta');

// 主函数
async function overrideIndex() {
  try {
    // 读取 meta/index.json 文件
    const indexData = fs.readFileSync(INDEX_PATH, 'utf8');
    const stringArray = JSON.parse(indexData);
    
    if (!Array.isArray(stringArray)) {
      throw new Error('meta/index.json 内容不是数组格式');
    }
    
    console.log(`读取到 ${stringArray.length} 个主题标识符`);
    
    // 创建结果数组
    const resultArray = [];
    
    // 遍历字符串数组
    for (const item of stringArray) {
      const metaFilePath = path.join(META_DIR, `${item}.json`);
      
      try {
        // 读取对应的 meta 文件
        const metaData = fs.readFileSync(metaFilePath, 'utf8');
        const metaObject = JSON.parse(metaData);
        
        // 将解析后的对象添加到结果数组
        resultArray.push(metaObject);
        console.log(`成功处理: ${item}.json`);
      } catch (err) {
        console.error(`处理 ${item}.json 时出错:`, err.message);
        // 如果无法读取或解析特定文件，将原始字符串添加回数组
        resultArray.push(item);
      }
    }
    
    // 将结果数组序列化为JSON字符串（使用2个空格缩进以增强可读性）
    const resultJson = JSON.stringify(resultArray, null, 2);
    
    // 将结果写回 meta/index.json
    fs.writeFileSync(INDEX_PATH, resultJson);
    
    console.log('成功！meta/index.json 已更新');
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
}

// 执行主函数
overrideIndex(); 