import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import Dashboard from "../../../public/Home/Workflow.jpg";
import Tasks from "../../../public/Home/Tasks.jpg";
import Team from "../../../public/Home/Intelligent.jpg";
import Automation from "../../../public/Home/Automation.jpg";
import Workflows from "../../../public/Home/UI.jpg";
import ChatBoat from "../../../public/Home/Privacy.jpg";
import Billing from "../../../public/Home/Tasks.jpg";

import {
  BookCheck,
  Bot,
  Brain,
  Cable,
  DollarSign,
  LayoutDashboard,
  Users,
  Workflow,
} from "lucide-react";

export function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={i === 3 || i === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  );
}

const items = [
  {
    title: "Dashboard",
    description: "Explore the power of managing the whole app.",
    header: Dashboard,
    icon: <LayoutDashboard className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "Tasks",
    description: "Dive into the transformative power of technology.",
    header: Tasks,
    icon: <BookCheck className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "Team",
    description: "Discover the beauty of thoughtful and functional team.",
    header: Team,
    icon: <Users className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "The Power of Automation",
    description: "Understand the impact of effective automations in our lives.",
    header: Workflows,
    icon: <Workflow className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "The Pursuit of Billing",
    description: "Join the quest for integration.",
    header: Billing,
    icon: <DollarSign className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "The Joy of Assistant",
    description: "Experience the thrill of bringing ideas to life.",
    header: ChatBoat,
    icon: <Bot className="h-4 w-4 text-primary animate-bounce" />,
  },
  {
    title: "The Spirit of Artificial Intelligence",
    description: "Embark on exciting journeys and thrilling discoveries.",
    header: Automation,
    icon: <Brain className="h-4 w-4 text-primary animate-bounce" />,
  },
];
