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
    thumbnail: "/Home.png",
  },
  {
    title: "Cursor",
    link: "https://cursor.so",
    thumbnail: "/About.png",
  },
  {
    title: "Rogue",
    link: "https://userogue.com",
    thumbnail: "/p4.png",
  },

  {
    title: "Editorially",
    link: "https://editorially.org",
    thumbnail: "/FriendsSuggestion.png",
  },
  {
    title: "Editrix AI",
    link: "https://editrix.ai",
    thumbnail: "/SocialLinks.png",
  },
  {
    title: "Pixel Perfect",
    link: "https://app.pixelperfect.quest",
    thumbnail: "/Home.png",
  },

  {
    title: "Algochurn",
    link: "https://algochurn.com",
    thumbnail: "/About.png",
  },
  {
    title: "Aceternity UI",
    link: "https://ui.aceternity.com",
    thumbnail: "/p3.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail: "/p1.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail: "/FriendsSuggestion.png",
  },
  {
    title: "Renderwork Studio",
    link: "https://renderwork.studio",
    thumbnail: "/SocialLinks.png",
  },

  {
    title: "Creme Digital",
    link: "https://cremedigital.com",
    thumbnail: "/p1.png",
  },
  {
    title: "Golden Bells Academy",
    link: "https://goldenbellsacademy.com",
    thumbnail: "/FriendsSuggestion.png",
  },
  {
    title: "Invoker Labs",
    link: "https://invoker.lol",
    thumbnail: "/p2.png",
  },
  {
    title: "E Free Invoice",
    link: "https://efreeinvoice.com",
    thumbnail: "/p1.png",
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
