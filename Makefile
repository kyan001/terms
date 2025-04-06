.PHONY: test test-perf overrideIndex split-glossaries add-langs-hash remove-langs-hash

# 运行所有测试
test:
	deno test --allow-read

# 运行性能测试
test-perf:
	deno test --allow-read test/performance.test.ts 

# 重写index.json，用meta/*.json文件的内容替换字符串数组
override-index:
	node scripts/overrideIndex.js 

# 根据第三列语言拆分glossaries目录下的CSV文件
split-glossaries:
	node scripts/splitGlossaries.js 

# 为所有meta文件添加langsHash字段，包含每个语言CSV文件的哈希值
add-langs-hash:
	node scripts/addLangsHash.js

# 删除所有meta文件中的langsHash字段
remove-langs-hash:
	node scripts/removeLangsHash.js 