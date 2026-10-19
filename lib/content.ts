// Single source of truth. Only genuine résumé information lives here.

export const profile = {
  name: "Hae Eun Lee",
  wordmark: "HAE EUN.",
  role: "AI & Software Engineer",
  location: "Singapore",
  email: "haeeunlee2005@gmail.com",
  github: "https://github.com/Chloelee05",
  linkedin: "https://www.linkedin.com/in/hae-eun-lee-169baa2b2",
};

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export const about = {
  headline: "Building intelligent systems that make an impact.",
  body: [
    "I'm a Computer Science graduate from the University of Wollongong with a double specialization in Big Data and Cybersecurity.",
    "I work where AI engineering meets product engineering — shipping systems that are reliable, secure and genuinely useful.",
  ],
  practice: [
    "AI engineering",
    "Full-stack development",
    "Software automation",
    "Data-driven systems",
    "Secure application development",
  ],
  facts: [
    { value: "45", label: "Custom software projects delivered" },
    { value: "5.0", label: "Client rating on Kmong, out of 5.0" },
    { value: "6 / 4", label: "Core features across AI workflows" },
    { value: "1st", label: "Place, SIM-UOL hackathon" },
  ],
};

export const experience = [
  {
    company: "Maibel",
    role: "AI & Software Engineer",
    period: "February 2026 — Present",
    summary: "An AI-powered wellness companion, built end to end.",
    bullets: [
      "Built an AI-powered wellness companion using LangGraph, FastAPI, Supabase, and Google Cloud Run.",
      "Delivered six core features across four AI workflows.",
      "Developed a Telegram Mini App and internal testing dashboard.",
      "Improved implementation and testing efficiency through AI-assisted development.",
      "Managed AI quality, routing, and safety-related engineering issues.",
    ],
    tags: ["LangGraph", "FastAPI", "Supabase", "Google Cloud Run"],
  },
  {
    company: "Kmong",
    role: "Freelance Software Developer",
    period: "October 2024 — Present",
    summary: "Custom software for clients, rated 5.0 / 5.0.",
    bullets: [
      "Delivered 45 custom software projects.",
      "Specialized in Python automation, data analysis, and business software.",
      "Maintained a 5.0/5.0 client rating.",
      "Developed solutions to reduce manual processing time.",
    ],
    tags: ["Python", "Automation", "Data analysis"],
  },
];

export type Project = {
  number: string;
  title: string;
  kicker: string;
  description: string;
  tech: string[];
  contributions: string[];
  variant: "rings" | "planes" | "orbit";
  links: { label: string; href?: string }[];
};

export const projects: Project[] = [
  {
    number: "01",
    title: "Maibel",
    kicker: "AI Wellness Companion",
    description: "AI-powered conversational wellness companion.",
    tech: ["Python", "LangGraph", "FastAPI", "Supabase", "Google Cloud Run", "Telegram Mini App"],
    contributions: [
      "Six core features delivered across four AI workflows.",
      "Telegram Mini App and an internal testing dashboard.",
      "AI quality, routing and safety-related engineering.",
    ],
    variant: "rings",
    links: [{ label: "GitHub" }, { label: "Live demo" }],
  },
  {
    number: "02",
    title: "AuctionHub",
    kicker: "Full-stack Auction Platform",
    description:
      "Full-stack auction platform with multiple auction formats and a hybrid recommendation engine.",
    tech: ["Java", "React", "PostgreSQL", "Docker"],
    contributions: [
      "Hybrid recommendation engine.",
      "Transaction handling across auction formats.",
      "Authentication and application security.",
    ],
    variant: "planes",
    links: [{ label: "GitHub" }, { label: "Live demo" }],
  },
  {
    number: "03",
    title: "NutritionLM",
    kicker: "First place — SIM-UOL Hackathon",
    description:
      "AI-powered nutrition platform supporting food-image analysis, Telegram-based tracking, and Google Fit integration.",
    tech: ["Next.js", "Gemini API", "Telegram", "Google Fit"],
    contributions: [
      "Food-image analysis.",
      "Telegram-based tracking.",
      "Google Fit integration.",
    ],
    variant: "orbit",
    links: [{ label: "GitHub" }, { label: "Live demo" }],
  },
];

export const skills = [
  { title: "AI & Machine Learning", items: ["LangGraph", "LangChain", "Gemini API", "Recommendation Systems"] },
  { title: "Programming", items: ["Python", "Java", "C++", "JavaScript", "TypeScript", "SQL"] },
  { title: "Frontend & Backend", items: ["React", "Next.js", "FastAPI", "Jakarta Servlets"] },
  { title: "Databases & Cloud", items: ["PostgreSQL", "MySQL", "Supabase", "Google Cloud Run", "Docker"] },
  { title: "Engineering Tools", items: ["Git", "Jira", "Agile Methodology"] },
];
