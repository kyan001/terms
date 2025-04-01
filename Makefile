.PHONY: test

# 运行所有测试
test:
	deno test --allow-read

# 运行性能测试
test-perf:
	deno test --allow-read test/performance.test.ts 