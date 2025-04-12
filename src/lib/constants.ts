import Home from "@/components/icons/home";
import Workflows from "@/components/icons/workflow";
import Settings from "@/components/icons/setting";
import Category from "@/components/icons/category";
import Payment from "@/components/icons/payment";
import Logs from "@/components/icons/cloudDownload";
import Templates from "@/components/icons/clipboard";
export const clients = [...new Array(5)].map((client, index) => ({
  href: `/${index + 1}.png`,
}));
export const products = [
  {
    title: "Moonbeam",
    link: "https://gomoonbeam.com",
    thumbnail: "/Hero/Dashboard.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail: "/Hero/Billing.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail: "/Hero/Automation.png",
  },

  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail: "/Hero/Chatbot.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail: "/Hero/Insight.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail: "/Hero/Documents.png",
  },

  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail: "/Hero/Tasks.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail: "/Hero/Team.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail: "/Hero/Workflow.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail: "/Hero/Dashboard.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail: "/Hero/Chatbot.png",
  },

  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail: "/Hero/Tasks.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail: "/Hero/Team.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail: "/Hero/Insight.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail: "/Hero/Workflow.png",
  },
];

export const menuOptions = [
  { name: "Dashboard", Component: Home, href: "/dashboard" },
  { name: "Workflows", Component: Workflows, href: "/workflows" },
  { name: "Settings", Component: Settings, href: "/settings" },
  { name: "Connections", Component: Category, href: "/connections" },
  { name: "Billing", Component: Payment, href: "/billing" },
  { name: "Templates", Component: Templates, href: "/templates" },
  { name: "Logs", Component: Logs, href: "/logs" },
];
