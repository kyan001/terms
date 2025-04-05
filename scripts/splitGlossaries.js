/**
 * 根据第三列(tgt_lng)拆分glossaries目录下的所有CSV文件
 * 如果第三列为空，则行保留在原始文件中
 * 如果第三列不为空，则移动到对应语言的CSV文件中(例如 game_zh-CN.csv)
 */

const fs = require('fs');
const path = require('path');

// 获取glossaries目录路径
const glossariesDir = path.join(__dirname, '..', 'glossaries');

// 读取CSV字符串
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  return lines.map(line => line.split(','));
}

// 将行数组转换为CSV字符串
function unparseCSV(rows) {
  return rows.map(row => row.join(',')).join('\n');
}

// 过滤目录中的CSV文件，排除已经拆分过的文件（文件名包含下划线）
function getOriginalCSVFiles() {
  return fs.readdirSync(glossariesDir)
    .filter(file => file.endsWith('.csv') && !file.includes('_'));
}

// 处理单个CSV文件
function processCSVFile(filename) {
  const filePath = path.join(glossariesDir, filename);
  
  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent.trim()) {
      console.log(`文件 ${filename} 为空，跳过处理`);
      return;
    }
    
    // 解析CSV
    const rows = parseCSV(fileContent);
    if (rows.length < 2) {
      console.log(`文件 ${filename} 只有标题行或为空，跳过处理`);
      return;
    }
    
    const header = rows[0]; // 保存表头
    const rowsToKeep = [header]; // 初始化要保留的行（包含表头）
    const rowsToMoveByLang = {}; // 按语言分类要移动的行
    
    // 遍历每一行（跳过表头）
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) {
        // 如果行的列数不足3，保留在原文件
        rowsToKeep.push(row);
        continue;
      }
      
      const lang = row[2].trim(); // 获取第三列的语言代码
      
      if (!lang) {
        // 如果语言为空，保留在原文件
        rowsToKeep.push(row);
      } else {
        // 如果语言不为空，按语言分类
        if (!rowsToMoveByLang[lang]) {
          rowsToMoveByLang[lang] = [header]; // 每个语言文件也需要表头
        }
        rowsToMoveByLang[lang].push(row);
      }
    }
    
    // 将筛选后的行写回原始文件（破坏性操作）
    fs.writeFileSync(filePath, unparseCSV(rowsToKeep));
    console.log(`已更新原始文件 ${filename}，保留了 ${rowsToKeep.length - 1} 行`);
    
    // 处理每种语言
    const baseFileName = path.basename(filename, '.csv');
    Object.entries(rowsToMoveByLang).forEach(([lang, rows]) => {
      if (rows.length <= 1) return; // 只有表头，跳过
      
      const langFileName = `${baseFileName}_${lang}.csv`;
      const langFilePath = path.join(glossariesDir, langFileName);
      
      let contentToWrite = '';
      const fileExists = fs.existsSync(langFilePath) && 
                         fs.statSync(langFilePath).size > 0;
                         
      if (fileExists) {
        // 如果文件已存在且非空，只追加数据行（不包括表头）
        contentToWrite = '\n' + unparseCSV(rows.slice(1));
      } else {
        // 如果文件不存在或为空，写入完整内容（包括表头）
        contentToWrite = unparseCSV(rows);
      }
      
      fs.appendFileSync(langFilePath, contentToWrite);
      console.log(`已追加到语言文件 ${langFileName}，添加了 ${rows.length - 1} 行`);
    });
    
  } catch (error) {
    console.error(`处理文件 ${filename} 时出错:`, error);
  }
}

// 主函数
function main() {
  try {
    const csvFiles = getOriginalCSVFiles();
    console.log(`找到 ${csvFiles.length} 个原始CSV文件需要处理`);
    
    csvFiles.forEach(filename => {
      console.log(`开始处理 ${filename}...`);
      processCSVFile(filename);
    });
    
    console.log('所有文件处理完成');
  } catch (error) {
    console.error('程序执行出错:', error);
  }
}

// 执行主函数
main(); 