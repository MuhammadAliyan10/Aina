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
    browser = await chromium.launch({ headless: false }); // Set headless: true for production
  }
  return browser;
}

export default class AutomationExecutor {
  private nodes: NodeProps[];
  private edges: any[];
  private nodeOutputs: Map<string, any>;

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
      switch (node.type) {
        // General Nodes
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
          log[logLevel](
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
          let value =
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
          break;

        case "closeTabs":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdClose = incomingEdges[0]?.source;
          const pageToClose = pageMap.get(prevNodeIdClose);
          if (!pageToClose) {
            log.warn(`CloseTabNode ${node.id}: No page found to close`);
            outputData = { closed: false, reason: "No page found" };
            break;
          }
          await pageToClose.close();
          pageMap.delete(prevNodeIdClose);
          outputData = { closed: true };
          break;

        case "goBack":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdBack = incomingEdges[0]?.source;
          const pageBack = pageMap.get(prevNodeIdBack);
          if (!pageBack) {
            log.warn(`GoBackNode ${node.id}: No page found to navigate back`);
            outputData = { navigatedBack: false, reason: "No page found" };
            break;
          }
          await pageBack.goBack({ timeout: node.data.config?.timeout || 5000 });
          log.info(
            `GoBackNode ${node.id}: Navigated back to ${pageBack.url()}`
          );
          outputData = { navigatedBack: true, currentUrl: pageBack.url() };
          break;

        case "goForward":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdForward = incomingEdges[0]?.source;
          const pageForward = pageMap.get(prevNodeIdForward);
          if (!pageForward) {
            log.warn(
              `GoForwardNode ${node.id}: No page found to navigate forward`
            );
            outputData = { navigatedForward: false, reason: "No page found" };
            break;
          }
          await pageForward.goForward({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `GoForwardNode ${
              node.id
            }: Navigated forward to ${pageForward.url()}`
          );
          outputData = {
            navigatedForward: true,
            currentUrl: pageForward.url(),
          };
          break;

        case "takeScreenShot":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdScreenshot = incomingEdges[0]?.source;
          const pageScreenshot = pageMap.get(prevNodeIdScreenshot);
          if (!pageScreenshot) {
            log.warn(
              `ScreenShotNode ${node.id}: No page found to take screenshot`
            );
            outputData = { screenshotTaken: false, reason: "No page found" };
            break;
          }
          const screenshotBuffer = await pageScreenshot.screenshot({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `ScreenShotNode ${
              node.id
            }: Took screenshot of ${pageScreenshot.url()}`
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
          const prevNodeIdEvent = incomingEdges[0]?.source;
          const pageEvent = pageMap.get(prevNodeIdEvent);
          if (!pageEvent) {
            log.warn(
              `BrowserEventNode ${node.id}: No page found to monitor event`
            );
            outputData = { eventTriggered: false, reason: "No page found" };
            break;
          }
          await pageEvent.waitForEvent(eventType, {
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { eventTriggered: true, type: eventType };
          break;

        case "handleDownload":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdDownload = incomingEdges[0]?.source;
          const pageDownload = pageMap.get(prevNodeIdDownload);
          if (!pageDownload) {
            log.warn(
              `HandleDownloadNode ${node.id}: No page found to handle download`
            );
            outputData = { downloaded: false, reason: "No page found" };
            break;
          }
          const download = await pageDownload.waitForEvent("download", {
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
          const prevNodeIdReload = incomingEdges[0]?.source;
          const pageReload = pageMap.get(prevNodeIdReload);
          if (!pageReload) {
            log.warn(`ReloadTabNode ${node.id}: No page found to reload`);
            outputData = { reloaded: false, reason: "No page found" };
            break;
          }
          await pageReload.reload({
            timeout: node.data.config?.timeout || 5000,
          });
          log.info(
            `ReloadTabNode ${node.id}: Reloaded tab at ${pageReload.url()}`
          );
          outputData = { reloaded: true, currentUrl: pageReload.url() };
          break;

        case "getTabURL":
          const prevNodeIdUrl = incomingEdges[0]?.source;
          const pageUrl = pageMap.get(prevNodeIdUrl);
          outputData = {
            url: pageUrl
              ? pageUrl.url()
              : effectiveInput?.url || "No URL provided",
          };
          break;

        case "authentication":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const authType = node.data.config?.authType || "form";
          const prevNodeIdAuth = incomingEdges[0]?.source;
          const pageAuth = pageMap.get(prevNodeIdAuth);
          if (!pageAuth) {
            log.warn(
              `BrowserAuthenticationNode ${node.id}: No page found for authentication`
            );
            outputData = { authenticated: false, reason: "No page found" };
            break;
          }
          if (authType === "form") {
            await pageAuth.fill(
              node.data.config?.usernameSelector || "#username",
              node.data.config?.username || ""
            );
            await pageAuth.fill(
              node.data.config?.passwordSelector || "#password",
              node.data.config?.password || ""
            );
            await pageAuth.click(
              node.data.config?.submitSelector || "#login-button",
              { timeout: node.data.config?.timeout || 5000 }
            );
            await pageAuth.waitForNavigation({
              timeout: node.data.config?.timeout || 5000,
            });
            outputData = { authenticated: true, method: "form" };
          } else {
            await pageAuth.goto(node.data.config?.oauthUrl || "", {
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
          const prevNodeIdCookies = incomingEdges[0]?.source;
          const pageCookies = pageMap.get(prevNodeIdCookies);
          if (!pageCookies) {
            log.warn(
              `ClearCookiesNode ${node.id}: No page found to clear cookies`
            );
            outputData = { cleared: false, reason: "No page found" };
            break;
          }
          await pageCookies.context().clearCookies();
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
          const prevNodeIdUA = incomingEdges[0]?.source;
          const pageUA = pageMap.get(prevNodeIdUA);
          if (pageUA) {
            await pageUA.setExtraHTTPHeaders({ "User-Agent": userAgentString });
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
          const prevNodeIdClick = incomingEdges[0]?.source;
          const pageClick = pageMap.get(prevNodeIdClick);

          if (!pageClick) {
            log.warn(
              `ClickElementNode ${node.id}: No page found to click element`
            );
            outputData = { clicked: false, reason: "No page found" };
            break;
          }
          const clickSelector = node.data.config?.selector;
          if (!clickSelector) throw new Error("Selector required for click");
          await pageClick.click(clickSelector, {
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { clicked: true, selector: clickSelector };
          break;

        case "customGetText":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdText = incomingEdges[0]?.source;
          const pageText = pageMap.get(prevNodeIdText);
          if (!pageText) {
            log.warn(`GetTextNode ${node.id}: No page found to get text`);
            outputData = { text: null, reason: "No page found" };
            break;
          }
          const textSelector = node.data.config?.selector;
          if (!textSelector) throw new Error("Selector required for get text");
          const text = await pageText.textContent(textSelector);
          outputData = { text: text || "No text found" };
          break;

        case "customScrollElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdScroll = incomingEdges[0]?.source;
          const pageScroll = pageMap.get(prevNodeIdScroll);
          if (!pageScroll) {
            log.warn(`ScrollElementNode ${node.id}: No page found to scroll`);
            outputData = { scrolled: false, reason: "No page found" };
            break;
          }
          const scrollSelector = node.data.config?.selector || "body";
          await pageScroll.evaluate((sel) => {
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
          const prevNodeIdLink = incomingEdges[0]?.source;
          const pageLink = pageMap.get(prevNodeIdLink);
          if (!pageLink) {
            log.warn(`LinkEventNode ${node.id}: No page found to follow link`);
            outputData = { followed: false, reason: "No page found" };
            break;
          }
          const linkSelector = node.data.config?.selector || "a";
          await pageLink.click(linkSelector, {
            timeout: node.data.config?.timeout || 5000,
          });
          await pageLink.waitForNavigation({
            timeout: node.data.config?.timeout || 5000,
          });
          outputData = { followed: true, url: pageLink.url() };
          break;

        case "customAttributeVariable":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdAttr = incomingEdges[0]?.source;
          const pageAttr = pageMap.get(prevNodeIdAttr);
          if (!pageAttr) {
            log.warn(
              `GetAttributeNode ${node.id}: No page found to get attribute`
            );
            outputData = { attribute: null, reason: "No page found" };
            break;
          }
          const attrSelector = node.data.config?.selector;
          if (!attrSelector)
            throw new Error("Selector required for get attribute");
          const attrValue = await pageAttr.getAttribute(
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
          const prevNodeIdForm = incomingEdges[0]?.source;
          const pageForm = pageMap.get(prevNodeIdForm);
          if (!pageForm) {
            log.warn(`FillFormNode ${node.id}: No page found to fill form`);
            outputData = { filled: false, reason: "No page found" };
            break;
          }
          const formData =
            node.data.config?.formData || effectiveInput?.formData || {};
          for (const [selector, value] of Object.entries(formData)) {
            await pageForm.fill(selector, value as string, {
              timeout: node.data.config?.timeout || 5000,
            });
          }
          await pageForm.click(
            node.data.config?.submitSelector || "button[type='submit']"
          );
          outputData = { filled: true, formData };
          break;

        case "customJavaScript":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdJS = incomingEdges[0]?.source;
          const pageJS = pageMap.get(prevNodeIdJS);
          if (!pageJS) {
            log.warn(
              `JavaScriptCodeNode ${node.id}: No page found to execute JS`
            );
            outputData = { executed: false, reason: "No page found" };
            break;
          }
          const script = node.data.config?.script || "() => 'No script'";
          const jsResult = await pageJS.evaluate(script);
          outputData = { executed: true, result: jsResult };
          break;

        case "customTriggerEvent":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdEventTrigger = incomingEdges[0]?.source;
          const pageEventTrigger = pageMap.get(prevNodeIdEventTrigger);
          if (!pageEventTrigger) {
            log.warn(
              `TriggerEventNode ${node.id}: No page found to trigger event`
            );
            outputData = { triggered: false, reason: "No page found" };
            break;
          }
          const eventSelector = node.data.config?.selectorValue; // Changed from selector to selectorValue
          log.info(
            `TriggerEventNode ${node.id}: Selector provided - ${eventSelector}`
          ); // Debug log
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
          await pageEventTrigger.dispatchEvent(
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
          const prevNodeIdFrame = incomingEdges[0]?.source;
          const pageFrame = pageMap.get(prevNodeIdFrame);
          if (!pageFrame) {
            log.warn(
              `SwitchFrameNode ${node.id}: No page found to switch frame`
            );
            outputData = { switched: false, reason: "No page found" };
            break;
          }
          const frameSelector = node.data.config?.frameSelector || "iframe";
          const frame = pageFrame.frame(frameSelector);
          if (!frame) throw new Error(`Frame not found: ${frameSelector}`);
          outputData = { switched: true, frame: frameSelector };
          pageMap.set(node.id, frame as any); // Type assertion
          break;

        case "customUploadFile":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdUpload = incomingEdges[0]?.source;
          const pageUpload = pageMap.get(prevNodeIdUpload);
          if (!pageUpload) {
            log.warn(`UploadFileNode ${node.id}: No page found to upload file`);
            outputData = { uploaded: false, reason: "No page found" };
            break;
          }
          const uploadSelector =
            node.data.config?.selector || "input[type='file']";
          const filePath = node.data.config?.filePath;
          if (!filePath) throw new Error("File path required for upload");
          await pageUpload.setInputFiles(uploadSelector, filePath);
          outputData = { uploaded: true, filePath };
          break;

        case "customHoverElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdHover = incomingEdges[0]?.source;
          const pageHover = pageMap.get(prevNodeIdHover);
          if (!pageHover) {
            log.warn(
              `HoverElementNode ${node.id}: No page found to hover element`
            );
            outputData = { hovered: false, reason: "No page found" };
            break;
          }
          const hoverSelector = node.data.config?.selector;
          if (!hoverSelector) throw new Error("Selector required for hover");
          await pageHover.hover(hoverSelector);
          outputData = { hovered: true, selector: hoverSelector };
          break;

        case "customSaveAssets":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdAssets = incomingEdges[0]?.source;
          const pageAssets = pageMap.get(prevNodeIdAssets);
          if (!pageAssets) {
            log.warn(`SaveAssetsNode ${node.id}: No page found to save assets`);
            outputData = { saved: false, reason: "No page found" };
            break;
          }
          const assetSelector = node.data.config?.selector || "img";
          const assetUrl = await pageAssets.getAttribute(assetSelector, "src");
          if (!assetUrl) throw new Error("No asset URL found");
          outputData = { saved: true, assetUrl };
          break;

        case "customPressKey":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdKey = incomingEdges[0]?.source;
          const pageKey = pageMap.get(prevNodeIdKey);
          if (!pageKey) {
            log.warn(`PressKeyNode ${node.id}: No page found to press key`);
            outputData = { pressed: false, reason: "No page found" };
            break;
          }
          const keySelector = node.data.config?.selector || "body";
          const key = node.data.config?.key || "Enter";
          await pageKey.press(keySelector, key);
          outputData = { pressed: true, key };
          break;

        case "customCreateElement":
          if (!node.data.config?.isEnabled) {
            outputData = { skipped: true };
            break;
          }
          const prevNodeIdCreate = incomingEdges[0]?.source;
          const pageCreate = pageMap.get(prevNodeIdCreate);
          if (!pageCreate) {
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
          await pageCreate.evaluate((config) => {
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
          const prevNodeIdExist = incomingEdges[0]?.source;
          const pageExist = pageMap.get(prevNodeIdExist);
          if (!pageExist) {
            log.warn(
              `ElementExistNode ${node.id}: No page found to check element`
            );
            outputData = { exists: false, reason: "No page found" };
            break;
          }
          const existsSelector = node.data.config?.selector;
          if (!existsSelector)
            throw new Error("Selector required for element exist");
          const exists = (await pageExist.$(existsSelector)) !== null;
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
          const prevNodeIdLoop = incomingEdges[0]?.source;
          const pageLoop = pageMap.get(prevNodeIdLoop);
          if (!pageLoop) {
            log.warn(
              `LoopElementNode ${node.id}: No page found to loop elements`
            );
            outputData = { completed: false, reason: "No page found" };
            break;
          }
          const loopSelector = node.data.config?.selector;
          if (!loopSelector)
            throw new Error("Selector required for loop element");
          const elements = await pageLoop.$$(loopSelector);
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
    return pageMap.get(nodeId);
  }

  async cleanup() {
    if (browser && browser.isConnected()) {
      await browser.close();
      browser = null;
    }
    this.nodeOutputs.clear();
    pageMap.clear();
    log.info("AutomationExecutor: Cleanup completed");
  }
}
