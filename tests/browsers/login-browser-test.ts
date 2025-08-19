// login-test.ts - Playwright test functions with increased timeouts
import { Page, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function performLogin(page: Page, vuId: string) {
  console.log(`🔑 VU-${vuId}: Performing login...`);

  try {
    // Navigate dengan timeout lebih besar
    await page.goto("/login", { waitUntil: "networkidle", timeout: 60000 });

    // Wait for elements to be ready
    await page.waitForSelector('input[formcontrolname="email"]', {
      state: "visible",
      timeout: 30000,
    });

    // Fill dengan timeout explicit
    await page.fill(
      'input[formcontrolname="email"]',
      process.env.LOGIN_EMAIL || "",
      { timeout: 15000 }
    );

    await page.fill(
      'input[formcontrolname="password"]',
      process.env.LOGIN_PASSWORD || "",
      { timeout: 15000 }
    );

    // Wait for button to be clickable
    const loginButton = page.locator(
      'button.mat-mdc-raised-button:has-text("Login")'
    );
    await loginButton.waitFor({ state: "visible", timeout: 10000 });
    await loginButton.click();

    // Longer wait after login
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log(`❌ VU-${vuId}: Login failed - ${error.message}`);
    throw error;
  }
}

async function loginAndPortal(page: Page, vuContext: any, events: any) {
  const start = Date.now();
  const vuId = vuContext.vars.$uuid.slice(0, 6);

  try {
    console.log(`🔄 VU-${vuId}: Starting login process...`);

    // Use helper function
    await performLogin(page, vuId);

    // Navigate to portal dengan timeout
    await page.goto("/dportal/portal", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Wait longer for portal to load
    await page.waitForTimeout(3000);

    // Verify Data Portal page dengan timeout lebih besar
    await page.waitForSelector('input[formcontrolname="projectName"]', {
      state: "visible",
      timeout: 30000,
    });

    const duration = Date.now() - start;
    console.log(
      `✅ VU-${vuId}: Login and portal navigation successful (${duration}ms)`
    );

    events.emit("counter", "login.success", 1);
    events.emit("histogram", "login.duration", duration);
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ VU-${vuId}: FAILED (${duration}ms) - ${error.message}`);

    events.emit("counter", "login.failed", 1);
    throw error;
  }
}

async function projectOnBoardAndUpload(
  page: Page,
  vuContext: any,
  events: any
) {
  const start = Date.now();
  const vuId = vuContext.vars.$uuid.slice(0, 6);

  try {
    console.log(`🔄 VU-${vuId}: Starting project onboard and upload...`);

    // Wait for form to be fully loaded
    await page.waitForSelector('input[formcontrolname="projectName"]', {
      state: "visible",
      timeout: 30000,
    });

    // Fill dengan timeout explicit dan wait
    await page.fill(
      'input[formcontrolname="projectName"]',
      `Project-load-testing-${vuId}`,
      { timeout: 15000 }
    );

    await page.waitForTimeout(500); // Small wait between fills

    await page.fill(
      'textarea[formcontrolname="projectDescription"]',
      `This is a test project for load testing with VU-${vuId}`,
      { timeout: 15000 }
    );

    // Upload multiple files
    console.log(`🔄 VU-${vuId}: Starting file upload...`);

    // Try different path strategies
    const baseDir = process.cwd();
    const testFiles = [
      path.join(baseDir, "tests", "browsers", "fixtures", "chr1.vcf.gz"),
      path.join(baseDir, "tests", "browsers", "fixtures", "metadata.json"),
      path.join(baseDir, "tests", "browsers", "fixtures", "pgx.vcf.gz"),
      path.join(
        baseDir,
        "tests",
        "browsers",
        "fixtures",
        "rare_disease.vcf.gz"
      ),
      path.join(baseDir, "tests", "browsers", "fixtures", "output.bam"),
    ];

    // Check if files exist before upload
    console.log(`🔍 VU-${vuId}: Checking file existence...`);
    const validFiles: string[] = [];
    for (const filePath of testFiles) {
      if (fs.existsSync(filePath)) {
        validFiles.push(filePath);
        console.log(`✅ Found: ${filePath}`);
      } else {
        console.log(`❌ Not found: ${filePath}`);
      }
    }

    if (validFiles.length === 0) {
      throw new Error("No valid files found for upload");
    }

    console.log(
      `📁 VU-${vuId}: Using ${validFiles.length} valid files for upload`
    );

    // Wait for file input dengan timeout lebih besar
    const fileInput = page.locator(
      'app-file-dropper input[type="file"][multiple]'
    );

    await fileInput.waitFor({ state: "attached", timeout: 30000 });
    console.log(`✅ VU-${vuId}: File input found`);

    await fileInput.setInputFiles(validFiles);
    console.log(`✅ VU-${vuId}: Files set to input successfully`);

    // Wait longer for file upload processing
    await page.waitForTimeout(8000);

    // Wait for submit button and click
    const submitButton = page.locator(
      'button.mat-mdc-raised-button:has-text("Submit")'
    );
    await submitButton.waitFor({ state: "visible", timeout: 10000 });
    await submitButton.click();

    // Wait longer for submission processing
    await page.waitForTimeout(10000);

    const duration = Date.now() - start;

    console.log(
      `✅ VU-${vuId}: Project onboard and upload successful (${duration}ms)`
    );

    events.emit("counter", "project.onboard.success", 1);
    events.emit("counter", "file.upload.success", 1);
    events.emit("histogram", "project.onboard.duration", duration);
  } catch (error) {
    const duration = Date.now() - start;
    console.log(
      `❌ VU-${vuId}: Project onboard FAILED (${duration}ms) - ${error.message}`
    );

    events.emit("counter", "project.onboard.failed", 1);
    events.emit("counter", "file.upload.failed", 1);
    throw error;
  }
}

export async function fullWorkflow(page: Page, vuContext: any, events: any) {
  const start = Date.now();
  const vuId = vuContext.vars.$uuid.slice(0, 6);

  try {
    console.log(`🔄 VU-${vuId}: Starting full workflow test...`);

    // Step 1: Login
    await loginAndPortal(page, vuContext, events);

    // Step 2: Project onboard and upload
    await projectOnBoardAndUpload(page, vuContext, events);

    const duration = Date.now() - start;
    console.log(
      `✅ VU-${vuId}: Full workflow completed successfully (${duration}ms)`
    );

    events.emit("counter", "workflow.full.success", 1);
    events.emit("histogram", "workflow.full.duration", duration);
  } catch (error) {
    const duration = Date.now() - start;
    console.log(
      `❌ VU-${vuId}: Full workflow FAILED (${duration}ms) - ${error.message}`
    );

    events.emit("counter", "workflow.full.failed", 1);
    throw error;
  }
}

// Custom metrics calculation function
export function calculateCustomMetrics(events: any, done: any) {
  console.log("📊 Calculating custom metrics...");

  try {
    // Get counter values (default to 0 if undefined)
    const loginSuccess = events.counters["login.success"] || 0;
    const loginFailed = events.counters["login.failed"] || 0;
    const navigationSuccess = events.counters["navigation.success"] || 0;
    const navigationFailed = events.counters["navigation.failed"] || 0;
    const uploadSuccess = events.counters["file.upload.success"] || 0;
    const uploadFailed = events.counters["file.upload.failed"] || 0;
    const workflowSuccess = events.counters["workflow.full.success"] || 0;
    const workflowFailed = events.counters["workflow.full.failed"] || 0;

    // Calculate success rates
    const loginTotal = loginSuccess + loginFailed;
    const navigationTotal = navigationSuccess + navigationFailed;
    const uploadTotal = uploadSuccess + uploadFailed;
    const workflowTotal = workflowSuccess + workflowFailed;

    if (loginTotal > 0) {
      const loginSuccessRate = (loginSuccess / loginTotal) * 100;
      events.emit("customStat", "login_success_rate", loginSuccessRate);
      console.log(`📈 Login Success Rate: ${loginSuccessRate.toFixed(2)}%`);
    }

    if (navigationTotal > 0) {
      const navigationSuccessRate = (navigationSuccess / navigationTotal) * 100;
      events.emit(
        "customStat",
        "navigation_success_rate",
        navigationSuccessRate
      );
      console.log(
        `📈 Navigation Success Rate: ${navigationSuccessRate.toFixed(2)}%`
      );
    }

    if (uploadTotal > 0) {
      const uploadSuccessRate = (uploadSuccess / uploadTotal) * 100;
      events.emit("customStat", "upload_success_rate", uploadSuccessRate);
      console.log(`📈 Upload Success Rate: ${uploadSuccessRate.toFixed(2)}%`);
    }

    if (workflowTotal > 0) {
      const workflowSuccessRate = (workflowSuccess / workflowTotal) * 100;
      events.emit("customStat", "workflow_success_rate", workflowSuccessRate);
      console.log(
        `📈 Workflow Success Rate: ${workflowSuccessRate.toFixed(2)}%`
      );
    }

    // Calculate average response times if histograms exist
    if (events.histograms["login.duration"]) {
      const loginDuration = events.histograms["login.duration"];
      const avgLoginTime = loginDuration.mean || 0;
      events.emit("customStat", "avg_login_time_ms", avgLoginTime);
      console.log(`⏱️  Average Login Time: ${avgLoginTime.toFixed(0)}ms`);
    }

    if (events.histograms["navigation.duration"]) {
      const navDuration = events.histograms["navigation.duration"];
      const avgNavTime = navDuration.mean || 0;
      events.emit("customStat", "avg_navigation_time_ms", avgNavTime);
      console.log(`⏱️  Average Navigation Time: ${avgNavTime.toFixed(0)}ms`);
    }

    if (events.histograms["project.onboard.duration"]) {
      const uploadDuration = events.histograms["project.onboard.duration"];
      const avgUploadTime = uploadDuration.mean || 0;
      events.emit("customStat", "avg_upload_time_ms", avgUploadTime);
      console.log(`⏱️  Average Upload Time: ${avgUploadTime.toFixed(0)}ms`);
    }

    // Calculate error rate
    const totalRequests =
      loginTotal + navigationTotal + uploadTotal + workflowTotal;
    const totalErrors =
      loginFailed + navigationFailed + uploadFailed + workflowFailed;

    if (totalRequests > 0) {
      const errorRate = (totalErrors / totalRequests) * 100;
      events.emit("customStat", "overall_error_rate", errorRate);
      console.log(`❌ Overall Error Rate: ${errorRate.toFixed(2)}%`);
    }

    // Summary report
    console.log("📊 Custom Metrics Summary:");
    console.log(`   Total Login Attempts: ${loginTotal}`);
    console.log(`   Total Navigation Attempts: ${navigationTotal}`);
    console.log(`   Total Upload Attempts: ${uploadTotal}`);
    console.log(`   Total Workflow Attempts: ${workflowTotal}`);
    console.log(`   Total Errors: ${totalErrors}`);
  } catch (error) {
    console.error("❌ Error calculating custom metrics:", error.message);
  }

  done();
}
