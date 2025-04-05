.PHONY: test test-perf overrideIndex split-glossaries

# 运行所有测试
test:
	deno test --allow-read

# 运行性能测试
test-perf:
	deno test --allow-read test/performance.test.ts 

# 重写index.json，用meta/*.json文件的内容替换字符串数组
overrideIndex:
	node scripts/overrideIndex.js 

# 根据第三列语言拆分glossaries目录下的CSV文件
splitGlossaries:
	node scripts/splitGlossaries.js 