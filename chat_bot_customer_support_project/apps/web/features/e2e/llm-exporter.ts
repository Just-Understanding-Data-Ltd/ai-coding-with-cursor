import {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
  TestError,
} from "@playwright/test/reporter";
import * as path from "path";
import * as fs from "fs/promises";

class ChatGPTReporter implements Reporter {
  private testResults: Array<{
    title: string;
    status: string;
    error?: string;
    duration: number;
    steps: string[];
  }> = [];

  onTestEnd(test: TestCase, result: TestResult) {
    const steps = result.steps.map((step) => this.formatStep(step));

    this.testResults.push({
      title: test.title,
      status: result.status,
      error: result.error?.message,
      duration: result.duration,
      steps,
    });
  }

  private formatStep(step: TestStep): string {
    return `${step.title} (${step.duration}ms)`;
  }

  async onEnd() {
    const summary = {
      totalTests: this.testResults.length,
      passed: this.testResults.filter((t) => t.status === "passed").length,
      failed: this.testResults.filter((t) => t.status === "failed").length,
      skipped: this.testResults.filter((t) => t.status === "skipped").length,
      results: this.testResults,
    };

    // Create a formatted string for ChatGPT
    const output = `
Test Results Summary:
Total Tests: ${summary.totalTests}
Passed: ${summary.passed}
Failed: ${summary.failed}
Skipped: ${summary.skipped}

Detailed Results:
${this.testResults
  .map(
    (test) => `
Test: ${test.title}
Status: ${test.status}
Duration: ${test.duration}ms
${test.error ? `Error: ${test.error}\n` : ""}
Steps:
${test.steps.map((step) => `- ${step}`).join("\n")}
`
  )
  .join("\n")}`;

    // Ensure the test-results directory exists
    const resultsDir = path.join(process.cwd(), "test-results");
    await fs.mkdir(resultsDir, { recursive: true });

    // Write to a file in the test-results directory
    const outputPath = path.join(resultsDir, "test-results-for-chatgpt.txt");
    await fs.writeFile(outputPath, output);
    console.log(`Test results written to: ${outputPath}`);
  }
}

export default ChatGPTReporter;
