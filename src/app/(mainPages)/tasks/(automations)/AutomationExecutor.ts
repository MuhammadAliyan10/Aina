// src/automation/AutomationExecutor.ts
import { NodeProps } from "reactflow";
import { chromium, Browser, Page } from "playwright";

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

let browser: Browser | null = null;
const pageMap: Map<string, Page> = new Map();

async function initializeBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export default class AutomationExecutor {
  private nodes: NodeProps[];
  private edges: any[];
  private nodeOutputs: Map<string, any>;
  private currentPage: Page | null = null;

  constructor(nodes: NodeProps[], edges: any[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeOutputs = new Map();
  }

  async execute(): Promise<any> {
    try {
      const triggerNode = this.nodes.find(
        (n) => n.type === "customTriggerNode"
      );
      if (!triggerNode) throw new Error("No trigger node found");

      const result = await this.processNode(triggerNode);
      return {
        data: Object.fromEntries(this.nodeOutputs),
        result,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await this.cleanup();
    }
  }

  private async processNode(node: NodeProps, inputData?: any): Promise<any> {
    try {
      const incomingEdges = this.edges.filter((e) => e.target === node.id);
      const inputs = incomingEdges
        .map((edge) => this.nodeOutputs.get(edge.source))
        .filter((output) => output !== undefined);
      const effectiveInput = inputs.length > 0 ? inputs[0] : inputData;

      let outputData: any;
      let pageToUse: Page | null = this.currentPage;

      const prevNodeId = incomingEdges[0]?.source;
      if (prevNodeId) {
        const prevPage = pageMap.get(prevNodeId);
        if (prevPage) {
          pageToUse = prevPage;
        }
      }

      switch (node.type) {
        case "customTriggerNode":
          outputData = { started: true, timestamp: new Date().toISOString() };
          break;

        case "customWorkFlow":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          outputData = effectiveInput || {
            executed: true,
            subWorkflow: node.data.config?.subWorkflowId || "none",
          };
          break;
        case "customDelay":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const delayTime = Number(node.data.config?.delay) || 1000;
          await new Promise((resolve) => setTimeout(resolve, delayTime));
          outputData = effectiveInput || { delayed: true };
          break;

        case "customExport":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          outputData = {
            exported: true,
            data: effectiveInput || "No data provided",
          };
          break;

        case "customRequest":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const requestUrl = node.data.config?.url || effectiveInput?.url;
          if (!requestUrl) throw new Error("URL required for HTTP request");
          outputData = {
            response: `Fetched data from ${requestUrl}`,
            url: requestUrl,
          };
          break;

        case "customClipBoard":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const clipboardAction = node.data.config?.action || "write";
          const clipboardData = node.data.config?.data || effectiveInput;
          outputData =
            clipboardAction === "write"
              ? { written: true, data: clipboardData }
              : { read: "Simulated clipboard content" };
          break;

        case "customWaitConnections":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          outputData = { waited: true, duration: 1000 };
          break;

        case "customNotifications":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const message =
            node.data.config?.message ||
            effectiveInput?.message ||
            "Notification sent";
          outputData = { notified: true, message };
          break;

        case "customNotes":
          outputData = { note: node.data.config?.text || "No note provided" };
          break;

        case "customErrorHandler":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const errorAction = node.data.config?.errorAction || "log";
          const errorInput = effectiveInput?.error;
          if (errorInput) {
            if (errorAction === "log") {
              log.error(`ErrorHandlerNode ${node.id}: ${errorInput}`);
              outputData = { handled: true, error: errorInput };
            } else if (errorAction === "retry") {
              outputData = {
                handled: false,
                retries: node.data.config?.maxRetries || 3,
              };
            } else {
              outputData = { handled: false, redirected: true };
            }
          } else {
            outputData = { handled: false, reason: "No error provided" };
          }
          break;

        case "customLogger":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const logLevel = node.data.config?.logLevel || "info";
          const logMessage = effectiveInput || "No data to log";
          log[logLevel as keyof typeof log](
            `LogEventNode ${node.id}: ${JSON.stringify(logMessage)}`
          );
          outputData = { logged: true, message: logMessage };
          break;

        case "customVariable":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const variableName = node.data.config?.variableName;
          const valueType = node.data.config?.valueType || "static";
          const value =
            valueType === "static"
              ? node.data.config?.staticValue
              : valueType === "json"
              ? JSON.parse(node.data.config?.jsonValue || "{}")
              : effectiveInput;
          outputData = { variable: variableName, value };
          break;

        case "customTimer":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const scheduleType = node.data.config?.scheduleType || "interval";
          const triggerTime =
            scheduleType === "interval"
              ? new Date(
                  Date.now() + (node.data.config?.interval || 1000)
                ).toISOString()
              : node.data.config?.specificTime;
          outputData = { scheduled: true, triggerTime };
          break;

        // Browser Nodes
        case "activeTab":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const browserInstanceActive = await initializeBrowser();
          const activePage = browserInstanceActive.contexts()[0]?.pages()[0];
          if (!activePage) throw new Error("No active tab found");
          outputData = {
            url: activePage.url(),
            title: await activePage.title(),
          };
          pageMap.set(node.id, activePage);
          this.currentPage = activePage; // Update current page
          break;

        case "newTab":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const url =
            effectiveInput?.url || node.data.config.url || "about:blank";
          const focus =
            effectiveInput?.focus || node.data.config.focus || "yes";
          const timeout = Number(
            effectiveInput?.timeout || node.data.config.timeout || 5000
          );

          const browserInstance = await initializeBrowser();
          const context =
            browserInstance.contexts()[0] ||
            (await browserInstance.newContext());
          const page: Page = await context.newPage();

          if (url && url !== "about:blank") {
            await page.goto(url, { timeout });
          }

          if (focus === "yes") {
            await page.bringToFront();
          }

          log.info(
            `NewTabNode ${node.id}: Opened new tab with URL: ${url}, Focus: ${focus}`
          );
          outputData = { opened: true, url, pageUrl: page.url() };
          pageMap.set(node.id, page);
          this.currentPage = page; // Update current page
          break;

        case "switchTabs":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const tabIndex =
            Number(node.data.config?.tabIndex || effectiveInput?.tabIndex) || 0;
          const browserInstanceSwitch = await initializeBrowser();
          const pages = browserInstanceSwitch.contexts()[0]?.pages();
          if (!pages || tabIndex >= pages.length)
            throw new Error("Invalid tab index");
          const switchPage = pages[tabIndex];
          await switchPage.bringToFront();
          outputData = { switched: true, url: switchPage.url() };
          pageMap.set(node.id, switchPage);
          this.currentPage = switchPage; // Update current page
          break;

        case "newWindow":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const newWindowUrl =
            effectiveInput?.url || node.data.config.url || "about:blank";
          const newWindowBrowser = await initializeBrowser();
          const newContext = await newWindowBrowser.newContext();
          const newWindowPage = await newContext.newPage();
          await newWindowPage.goto(newWindowUrl, {
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { opened: true, url: newWindowPage.url() };
          pageMap.set(node.id, newWindowPage);
          this.currentPage = newWindowPage; // Update current page
          break;

        case "proxy":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const proxyServer =
            node.data.config?.proxyServer || effectiveInput?.proxyServer;
          if (!proxyServer) throw new Error("Proxy server required");
          const proxyBrowser = await chromium.launch({
            headless: false,
            proxy: { server: proxyServer },
          });
          const proxyContext = await proxyBrowser.newContext();
          const proxyPage = await proxyContext.newPage();
          outputData = { proxySet: true, server: proxyServer };
          pageMap.set(node.id, proxyPage);
          this.currentPage = proxyPage; // Update current page
          break;

        case "closeTabs":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`CloseTabNode ${node.id}: No page found to close`);
            outputData = { closed: false, reason: "No page found" };
            break;
          }
          await pageToUse.close();
          pageMap.delete(node.id);
          this.currentPage = null; // Reset current page
          outputData = { closed: true };
          break;

        case "goBack":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`GoBackNode ${node.id}: No page found to navigate back`);
            outputData = { navigatedBack: false, reason: "No page found" };
            break;
          }
          await pageToUse.goBack({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `GoBackNode ${node.id}: Navigated back to ${pageToUse.url()}`
          );
          outputData = { navigatedBack: true, currentUrl: pageToUse.url() };
          break;

        case "goForward":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `GoForwardNode ${node.id}: No page found to navigate forward`
            );
            outputData = { navigatedForward: false, reason: "No page found" };
            break;
          }
          await pageToUse.goForward({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `GoForwardNode ${node.id}: Navigated forward to ${pageToUse.url()}`
          );
          outputData = { navigatedForward: true, currentUrl: pageToUse.url() };
          break;

        case "takeScreenShot":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `ScreenShotNode ${node.id}: No page found to take screenshot`
            );
            outputData = { screenshotTaken: false, reason: "No page found" };
            break;
          }
          const screenshotBuffer = await pageToUse.screenshot({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `ScreenShotNode ${node.id}: Took screenshot of ${pageToUse.url()}`
          );
          outputData = {
            screenshotTaken: true,
            screenshot: screenshotBuffer.toString("base64"),
          };
          break;

        case "browserEvent":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const eventType = node.data.config?.eventType || "load";
          if (!pageToUse) {
            log.warn(
              `BrowserEventNode ${node.id}: No page found to monitor event`
            );
            outputData = { eventTriggered: false, reason: "No page found" };
            break;
          }
          await pageToUse.waitForEvent(eventType, {
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { eventTriggered: true, type: eventType };
          break;

        case "handleDownload":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `HandleDownloadNode ${node.id}: No page found to handle download`
            );
            outputData = { downloaded: false, reason: "No page found" };
            break;
          }
          const download = await pageToUse.waitForEvent("download", {
            timeout: node.data.config?.timeout || 5000,
          });
          const downloadPath = await download.path();
          outputData = { downloaded: true, path: downloadPath };
          break;

        case "reloadTab":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`ReloadTabNode ${node.id}: No page found to reload`);
            outputData = { reloaded: false, reason: "No page found" };
            break;
          }
          await pageToUse.reload({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `ReloadTabNode ${node.id}: Reloaded tab at ${pageToUse.url()}`
          );
          outputData = { reloaded: true, currentUrl: pageToUse.url() };
          break;

        case "getTabURL":
          outputData = {
            url: pageToUse
              ? pageToUse.url()
              : effectiveInput?.url || "No URL provided",
          };
          break;

        case "authentication":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const authType = node.data.config?.authType || "form";
          if (!pageToUse) {
            log.warn(
              `BrowserAuthenticationNode ${node.id}: No page found for authentication`
            );
            outputData = { authenticated: false, reason: "No page found" };
            break;
          }
          if (authType === "form") {
            await pageToUse.fill(
              node.data.config?.usernameSelector || "#username",
              node.data.config?.username || ""
            );
            await pageToUse.fill(
              node.data.config?.passwordSelector || "#password",
              node.data.config?.password || ""
            );
            await pageToUse.click(
              node.data.config?.submitSelector || "#login-button",
              { timeout: node.data.config?.timeout || 5000 }
            );
            await pageToUse.waitForNavigation({
              timeout: node.data.config?.timeout || 5000,
            });
            outputData = { authenticated: true, method: "form" };
          } else {
            await pageToUse.goto(node.data.config?.oauthUrl || "", {
              timeout: node.data.config?.timeout || 5000,
            });
            outputData = { authenticated: true, method: "oauth" };
          }
          break;

        case "clearCookies":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `ClearCookiesNode ${node.id}: No page found to clear cookies`
            );
            outputData = { cleared: false, reason: "No page found" };
            break;
          }
          await pageToUse.context().clearCookies();
          outputData = { cleared: true };
          break;

        case "setUserAgent":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const userAgentType = node.data.config?.userAgentType || "custom";
          const userAgentString =
            userAgentType === "custom"
              ? node.data.config?.customUserAgent
              : node.data.config?.presetUserAgent === "chrome"
              ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              : "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
          if (pageToUse) {
            await pageToUse.setExtraHTTPHeaders({
              "User-Agent": userAgentString,
            });
            outputData = { set: true, userAgent: userAgentString };
          } else {
            outputData = { set: true, userAgent: userAgentString }; // For future pages
          }
          break;

        // Web Interaction Nodes
        case "customClickElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `ClickElementNode ${node.id}: No page found to click element`
            );
            outputData = { clicked: false, reason: "No page found" };
            break;
          }
          const clickSelector = node.data.config?.selector;
          if (!clickSelector) throw new Error("Selector required for click");
          await pageToUse.click(clickSelector, {
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { clicked: true, selector: clickSelector };
          break;

        case "customGetText":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`GetTextNode ${node.id}: No page found to get text`);
            outputData = { text: null, reason: "No page found" };
            break;
          }
          const textSelector = node.data.config?.selector;
          if (!textSelector) throw new Error("Selector required for get text");
          const text = await pageToUse.textContent(textSelector);
          outputData = { text: text || "No text found" };
          break;

        case "customScrollElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`ScrollElementNode ${node.id}: No page found to scroll`);
            outputData = { scrolled: false, reason: "No page found" };
            break;
          }
          const scrollSelector = node.data.config?.selector || "body";
          await pageToUse.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) element.scrollIntoView();
          }, scrollSelector);
          outputData = { scrolled: true, selector: scrollSelector };
          break;

        case "customLink":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`LinkEventNode ${node.id}: No page found to follow link`);
            outputData = { followed: false, reason: "No page found" };
            break;
          }
          const linkSelector = node.data.config?.selector || "a";
          await pageToUse.click(linkSelector, {
            timeout: node.data.config?.timeout || 5000,
          });
          await pageToUse.waitForNavigation({
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { followed: true, url: pageToUse.url() };
          break;

        case "customAttributeVariable":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `GetAttributeNode ${node.id}: No page found to get attribute`
            );
            outputData = { attribute: null, reason: "No page found" };
            break;
          }
          const attrSelector = node.data.config?.selector;
          if (!attrSelector)
            throw new Error("Selector required for get attribute");
          const attrValue = await pageToUse.getAttribute(
            attrSelector,
            node.data.config?.attribute || "value"
          );
          outputData = { attribute: attrValue || "No value found" };
          break;

        case "customForms":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`FillFormNode ${node.id}: No page found to fill form`);
            outputData = { filled: false, reason: "No page found" };
            break;
          }
          const formData =
            node.data.config?.formData || effectiveInput?.formData || {};
          if (Object.keys(formData).length === 0) {
            log.warn(`FillFormNode ${node.id}: No form data provided`);
            outputData = { filled: false, reason: "No form data provided" };
            break;
          }
          try {
            for (const [selector, value] of Object.entries(formData)) {
              if (typeof value !== "string") {
                log.warn(
                  `FillFormNode ${node.id}: Invalid value for ${selector}: ${value}`
                );
                continue;
              }
              await pageToUse.fill(selector, value, {
                timeout: node.data.config?.timeout || 5000,
              });
              log.info(
                `FillFormNode ${node.id}: Filled ${selector} with ${value}`
              );
            }
            const submitSelector =
              node.data.config?.submitSelector || "button[type='submit']";
            await pageToUse.click(submitSelector, {
              timeout: node.data.config?.timeout || 5000,
            });
            log.info(
              `FillFormNode ${node.id}: Submitted form using ${submitSelector}`
            );
            outputData = { filled: true, formData, submitted: true };
          } catch (e: any) {
            log.error(
              `FillFormNode ${node.id}: Failed to fill form - ${e.message}`
            );
            outputData = { filled: false, error: e.message };
          }
          break;

        case "customJavaScript":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `JavaScriptCodeNode ${node.id}: No page found to execute JS`
            );
            outputData = { executed: false, reason: "No page found" };
            break;
          }
          const script = node.data.config?.script || "() => 'No script'";
          const jsResult = await pageToUse.evaluate(script);
          log.info(
            `JavaScriptCodeNode ${node.id}: Result - ${JSON.stringify(
              jsResult
            )}`
          );
          outputData = { executed: true, result: jsResult };
          break;

        case "customTriggerEvent":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `TriggerEventNode ${node.id}: No page found to trigger event`
            );
            outputData = { triggered: false, reason: "No page found" };
            break;
          }
          const eventSelector = node.data.config?.selectorValue;
          if (!eventSelector || eventSelector.trim() === "") {
            log.warn(
              `TriggerEventNode ${node.id}: No valid selector value provided`
            );
            outputData = {
              triggered: false,
              reason: "Selector value required for trigger event",
            };
            break;
          }
          const triggerEventType = node.data.config?.eventType || "click";
          const eventProperties = node.data.config?.eventProperties || {};
          await pageToUse.dispatchEvent(
            eventSelector,
            triggerEventType,
            eventProperties
          );
          log.info(
            `TriggerEventNode ${node.id}: Triggered ${eventSelector} with ${triggerEventType}`
          );
          outputData = { triggered: true, eventType: triggerEventType };
          break;

        case "customSwitchFrame":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `SwitchFrameNode ${node.id}: No page found to switch frame`
            );
            outputData = { switched: false, reason: "No page found" };
            break;
          }
          const frameSelector = node.data.config?.frameSelector || "iframe";
          const frame = pageToUse.frame(frameSelector);
          if (!frame) throw new Error(`Frame not found: ${frameSelector}`);
          outputData = { switched: true, frame: frameSelector };
          pageMap.set(node.id, frame as any); // Update pageMap
          this.currentPage = frame as any; // Update current page (type assertion)
          break;

        case "customUploadFile":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`UploadFileNode ${node.id}: No page found to upload file`);
            outputData = { uploaded: false, reason: "No page found" };
            break;
          }
          const uploadSelector =
            node.data.config?.selector || "input[type='file']";
          const filePath = node.data.config?.filePath;
          if (!filePath) throw new Error("File path required for upload");
          await pageToUse.setInputFiles(uploadSelector, filePath);
          outputData = { uploaded: true, filePath };
          break;

        case "customHoverElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `HoverElementNode ${node.id}: No page found to hover element`
            );
            outputData = { hovered: false, reason: "No page found" };
            break;
          }
          const hoverSelector = node.data.config?.selector;
          if (!hoverSelector) throw new Error("Selector required for hover");
          await pageToUse.hover(hoverSelector);
          outputData = { hovered: true, selector: hoverSelector };
          break;

        case "customSaveAssets":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`SaveAssetsNode ${node.id}: No page found to save assets`);
            outputData = { saved: false, reason: "No page found" };
            break;
          }
          const assetSelector = node.data.config?.selector || "img";
          const assetUrl = await pageToUse.getAttribute(assetSelector, "src");
          if (!assetUrl) throw new Error("No asset URL found");
          outputData = { saved: true, assetUrl };
          break;

        case "customPressKey":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(`PressKeyNode ${node.id}: No page found to press key`);
            outputData = { pressed: false, reason: "No page found" };
            break;
          }
          const keySelector = node.data.config?.selector || "body";
          const key = node.data.config?.key || "Enter";
          await pageToUse.press(keySelector, key);
          outputData = { pressed: true, key };
          break;

        case "customCreateElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `CreateElementNode ${node.id}: No page found to create element`
            );
            outputData = { created: false, reason: "No page found" };
            break;
          }
          const elementConfig = node.data.config?.elementConfig || {
            tag: "div",
            text: "New Element",
          };
          await pageToUse.evaluate((config) => {
            const elem = document.createElement(config.tag || "div");
            elem.textContent = config.text || "New Element";
            document.body.appendChild(elem);
          }, elementConfig);
          outputData = { created: true, tag: elementConfig.tag || "div" };
          break;

        // Control Flow Nodes
        case "repeatTask":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const repeatIterations = Number(node.data.config?.iterations) || 1;
          const repeatResults = [];
          for (let i = 0; i < repeatIterations; i++) {
            const nextEdge = this.edges.find((e) => e.source === node.id);
            const targetNode = nextEdge
              ? this.nodes.find((n) => n.id === nextEdge.target)
              : null;
            if (targetNode) {
              const result = await this.processNode(targetNode, {
                iteration: i + 1,
              });
              repeatResults.push(result);
            }
          }
          outputData = {
            repeated: true,
            iterations: repeatIterations,
            results: repeatResults,
          };
          break;

        case "conditions":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const condition = node.data.config?.condition || "true";
          const conditionResult = eval(condition); // Use safer evaluation in production
          outputData = { evaluated: conditionResult };
          const nextEdgeCondition = this.edges.find(
            (e) =>
              e.source === node.id &&
              e.sourceHandle === (conditionResult ? "true" : "false")
          );
          if (nextEdgeCondition) {
            const targetNodeCondition = this.nodes.find(
              (n) => n.id === nextEdgeCondition.target
            );
            if (targetNodeCondition)
              await this.processNode(targetNodeCondition);
          }
          break;

        case "elementExist":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `ElementExistNode ${node.id}: No page found to check element`
            );
            outputData = { exists: false, reason: "No page found" };
            break;
          }
          const existsSelector = node.data.config?.selector;
          if (!existsSelector)
            throw new Error("Selector required for element exist");
          const exists = (await pageToUse.$(existsSelector)) !== null;
          outputData = { exists };
          break;

        case "whileLoop":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          let whileIterations = 0;
          const maxWhileIterations =
            Number(node.data.config?.maxIterations) || 100;
          while (whileIterations < maxWhileIterations) {
            const conditionResult = true; // Placeholder; evaluate real condition
            if (!conditionResult) break;
            const nextEdgeLoop = this.edges.find(
              (e) => e.source === node.id && e.sourceHandle === "loop"
            );
            if (nextEdgeLoop) {
              const targetNodeLoop = this.nodes.find(
                (n) => n.id === nextEdgeLoop.target
              );
              if (targetNodeLoop) await this.processNode(targetNodeLoop);
            }
            whileIterations++;
            await new Promise((resolve) =>
              setTimeout(resolve, node.data.config?.delay || 1000)
            );
          }
          outputData = { completed: true, iterations: whileIterations };
          break;

        case "loopData":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const dataArray =
            node.data.config?.dataSource === "manual"
              ? JSON.parse(node.data.config?.manualData || "[]")
              : effectiveInput?.data || [];
          const dataLoopResults = [];
          for (const [dataIndex, item] of dataArray.entries()) {
            const nextEdgeData = this.edges.find(
              (e) => e.source === node.id && e.sourceHandle === "loop"
            );
            if (nextEdgeData) {
              const targetNodeData = this.nodes.find(
                (n) => n.id === nextEdgeData.target
              );
              if (targetNodeData) {
                const result = await this.processNode(targetNodeData, {
                  [node.data.config?.variableName || "item"]: item,
                  index: dataIndex,
                });
                dataLoopResults.push(result);
              }
            }
          }
          outputData = {
            completed: true,
            iterations: dataArray.length,
            results: dataLoopResults,
          };
          break;

        case "loopElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          if (!pageToUse) {
            log.warn(
              `LoopElementNode ${node.id}: No page found to loop elements`
            );
            outputData = { completed: false, reason: "No page found" };
            break;
          }
          const loopSelector = node.data.config?.selector;
          if (!loopSelector)
            throw new Error("Selector required for loop element");
          const elements = await pageToUse.$$(loopSelector);
          const elementLoopResults = [];
          for (const [elementIndex, element] of elements.entries()) {
            const nextEdgeElement = this.edges.find(
              (e) => e.source === node.id && e.sourceHandle === "loop"
            );
            if (nextEdgeElement) {
              const targetNodeElement = this.nodes.find(
                (n) => n.id === nextEdgeElement.target
              );
              if (targetNodeElement) {
                const result = await this.processNode(targetNodeElement, {
                  element: { index: elementIndex },
                  index: elementIndex,
                });
                elementLoopResults.push(result);
              }
            }
          }
          outputData = {
            completed: true,
            iterations: elements.length,
            results: elementLoopResults,
          };
          break;

        case "loopBreak":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          outputData = { break: true };
          break;

        // User Interaction Nodes
        case "promptUser":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const promptMessage =
            node.data.config?.promptMessage || "Please enter a value";
          if (pageToUse) {
            // Simulate prompt in browser context
            const userInput = await pageToUse.evaluate((msg) => {
              return prompt(msg) || "User cancelled";
            }, promptMessage);
            log.info(
              `PromptUserNode ${node.id}: Prompted user with "${promptMessage}", received: "${userInput}"`
            );
            outputData = { input: userInput };
          } else {
            // Fallback for non-browser context (e.g., testing)
            log.warn(
              `PromptUserNode ${node.id}: No page available, simulating prompt`
            );
            outputData = { input: `Simulated input for "${promptMessage}"` };
          }
          break;

        case "confirmDialog":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const confirmMessage =
            node.data.config?.confirmMessage || "Are you sure?";
          if (pageToUse) {
            // Simulate confirm dialog in browser context
            const userResponse = await pageToUse.evaluate((msg) => {
              return confirm(msg);
            }, confirmMessage);
            log.info(
              `ConfirmDialogNode ${node.id}: Confirmed "${confirmMessage}", response: ${userResponse}`
            );
            outputData = { confirmed: userResponse };
          } else {
            // Fallback for non-browser context
            log.warn(
              `ConfirmDialogNode ${node.id}: No page available, simulating confirm`
            );
            outputData = { confirmed: true }; // Default to true for simulation
          }
          break;

        case "alertUser":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const alertMessage =
            node.data.config?.alertMessage ||
            effectiveInput?.message ||
            "Alert!";
          if (pageToUse) {
            // Simulate alert in browser context
            await pageToUse.evaluate((msg) => {
              alert(msg);
            }, alertMessage);
            log.info(
              `AlertUserNode ${node.id}: Displayed alert with "${alertMessage}"`
            );
            outputData = { alerted: true, message: alertMessage };
          } else {
            // Fallback for non-browser context
            log.info(
              `AlertUserNode ${node.id}: No page available, logged alert "${alertMessage}"`
            );
            outputData = { alerted: true, message: alertMessage };
          }
          break;

        case "userProfile":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const source = node.data.config?.source || "browser";
          let profileData;
          if (source === "browser" && pageToUse) {
            // Simulate fetching profile from browser (e.g., localStorage or navigator)
            profileData = await pageToUse.evaluate(() => {
              return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                timestamp: new Date().toISOString(),
              };
            });
            log.info(
              `UserProfileNode ${
                node.id
              }: Retrieved profile from browser - ${JSON.stringify(
                profileData
              )}`
            );
          } else if (source === "system") {
            // Simulate system-level profile (mock data)
            profileData = {
              username: "simulated_user",
              id: "12345",
              timestamp: new Date().toISOString(),
            };
            log.info(
              `UserProfileNode ${
                node.id
              }: Retrieved profile from system - ${JSON.stringify(profileData)}`
            );
          } else {
            log.warn(
              `UserProfileNode ${node.id}: No page available for browser source, using mock data`
            );
            profileData = {
              source: "mock",
              data: "No real profile available",
            };
          }
          outputData = { profile: profileData };
          break;

        case "sendEmail":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const emailData = {
            recipient:
              node.data.config?.recipient || effectiveInput?.recipient || "",
            subject: node.data.config?.subject || effectiveInput?.subject || "",
            body: node.data.config?.body || effectiveInput?.body || "",
          };
          if (!emailData.recipient || !emailData.subject || !emailData.body) {
            throw new Error(
              "Recipient, subject, and body are required for sending email"
            );
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.recipient)) {
            throw new Error(`Invalid email address: ${emailData.recipient}`);
          }

          log.info(
            `SendEmailNode ${node.id}: Simulated sending email - To: ${emailData.recipient}, Subject: ${emailData.subject}, Body: ${emailData.body}`
          );
          outputData = {
            sent: true,
            email: {
              to: emailData.recipient,
              subject: emailData.subject,
              body: emailData.body,
            },
          };
          break;

        default:
          outputData = effectiveInput || { message: "No operation defined" };
          break;
      }

      this.nodeOutputs.set(node.id, outputData);

      const nextEdges = this.edges.filter((e) => e.source === node.id);
      const results = await Promise.all(
        nextEdges.map((edge) => {
          const targetNode = this.nodes.find((n) => n.id === edge.target);
          return targetNode ? this.processNode(targetNode) : null;
        })
      );

      return { data: outputData, next: results.filter((r) => r !== null) };
    } catch (error) {
      this.nodeOutputs.set(node.id, {
        error: error instanceof Error ? error.message : "Node execution failed",
      });
      return {
        error: error instanceof Error ? error.message : "Node execution failed",
      };
    }
  }

  getPage(nodeId: string): Page | undefined {
    return pageMap.get(nodeId) || undefined;
  }

  async cleanup() {
    if (browser && browser.isConnected()) {
      await browser.close();
      browser = null;
    }
    this.nodeOutputs.clear();
    pageMap.clear();
    this.currentPage = null;
    log.info("AutomationExecutor: Cleanup completed");
  }
}
