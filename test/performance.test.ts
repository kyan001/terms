import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.220.1/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.220.1/testing/bdd.ts";

// 读取所有术语文件并合并
async function readAllGlossaryTerms(): Promise<string[]> {
    const glossariesDir = "glossaries";
    const files = await Deno.readDir(glossariesDir);
    const allTerms = new Set<string>();

    for await (const file of files) {
        if (file.isFile && file.name.endsWith(".csv")) {
            const text = await Deno.readTextFile(
                `${glossariesDir}/${file.name}`,
            );
            const terms = text.split("\n")
                .slice(1) // 跳过标题行
                .map((line) => line.split(",")[0]) // 只取 source 列
                .filter((term) => term.trim().length > 0); // 过滤空行

            terms.forEach((term) => allTerms.add(term));
        }
    }

    return Array.from(allTerms);
}

// 实际的IT领域测试文本
const IT_TEST_TEXT =
    `The development of large language models (LLMs) has revolutionized the field of artificial intelligence. Models like GPT-4, Claude, and Gemini have demonstrated remarkable capabilities in natural language understanding and generation. These models are trained on massive datasets and utilize transformer architectures with attention mechanisms. The emergence of open-source models like LLaMA and Mistral has democratized access to advanced AI technology. However, challenges remain in areas such as hallucination, bias, and computational efficiency. The industry continues to innovate with techniques like fine-tuning, prompt engineering, and retrieval-augmented generation to address these limitations.`;

// 使用正则表达式匹配
function matchWithRegex(terms_regex: RegExp, text: string): string[] {
    // 对术语进行转义，避免特殊字符影响

    const matches = text.match(terms_regex);
    return matches ? Array.from(new Set(matches)) : [];
}

// 使用 includes 方法匹配
function matchWithIncludes(terms: string[], text: string): string[] {
    const filteredTerms = terms.filter((term) => text.includes(term));
    return Array.from(new Set(filteredTerms));
}

describe("术语匹配性能测试", () => {
    it(`应该正确比较合并后的术语库和实际IT领域文本的匹配性能`, async () => {
        // 强行补充到10000个术语
        const terms = await readAllGlossaryTerms();
        const allTerms = [];
        for (let i = 0; i < 10; i++) {
            allTerms.push(...terms);
        }

        console.log(`合并后的术语库包含 ${allTerms.length} 个术语`);

        console.log(`\n使用合并后的术语库 (${allTerms.length} 个术语)`);
        console.log(`测试文本长度: ${IT_TEST_TEXT.length} 字符`);
        console.log(`测试文本内容:\n${IT_TEST_TEXT}\n`);
        const escapedTerms = terms.map((term) =>
            term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        );
        const regex = new RegExp(escapedTerms.join("|"), "g");
        // 测试正则表达式匹配
        const regexStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            const regexResult = matchWithRegex(regex, IT_TEST_TEXT);
        }
        const regexEnd = performance.now();
        const regexTime = regexEnd - regexStart;

        // 测试 includes 方法匹配
        const includesStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            const includesResult = matchWithIncludes(allTerms, IT_TEST_TEXT);
        }
        const includesEnd = performance.now();
        const includesTime = includesEnd - includesStart;

        console.log(
            `测试结果 (${allTerms.length} 个术语, ${IT_TEST_TEXT.length} 字符文本):`,
        );
        console.log(`正则表达式耗时: ${regexTime.toFixed(2)}ms`);
        console.log(`includes 方法耗时: ${includesTime.toFixed(2)}ms`);
        console.log(
            `性能差异: ${(regexTime / (includesTime || 1)).toFixed(2)}x`,
        );


        const regexResult = matchWithRegex(regex, IT_TEST_TEXT);

        const includesResult = matchWithIncludes(allTerms, IT_TEST_TEXT);


        console.log("\n匹配到的术语:");
        console.log(`正则表达式匹配到 ${regexResult.length} 个术语:`);
        console.log(`\nincludes 方法匹配到 ${includesResult.length} 个术语:`);

        // 确保两种方法的结果一致
        assertEquals(
            regexResult.length,
            includesResult.length,
            "两种匹配方法匹配到的术语数量应该一致",
        );
        assertEquals(
            new Set(regexResult),
            new Set(includesResult),
            "两种匹配方法匹配到的术语应该一致",
        );
    });
});
