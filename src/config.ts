// ============================================================================
// Mary Faith Ardientes Portfolio Configuration
// Connected to GitHub: https://github.com/mardnts28
// ============================================================================

export const PORTFOLIO_CONFIG = {
  profile: {
    name: "Mary Faith P. Ardientes",
    displayName: "M A R Y    F A I T H\nA R D I E N T E S",
    title: "IT Student & Data Analyst",
    location: "Manila, Philippines",
    school: "Technological Institute of the Philippines - Manila",
    expectedGraduation: "2027",
    email: "maryfaithardientes13@gmail.com",
    phone: "09569969023",
    linkedin: "https://www.linkedin.com/in/mary-ardientes-aa8598315",
    githubUsername: "mardnts28",
    githubUrl: "https://github.com/mardnts28",
    photo: "/images/2x2.JPG",
  },
  projects: {
    rice: {
      githubUrl: "https://github.com/mardnts28/ph-rice-market-forecast",
    },
    readmission: {
      notebookUrl:
        "https://colab.research.google.com/drive/1fhKt5AGUQko0uDKgX1yFLrE1nqXzR6xN?usp=sharing",
    },
    claro: {
      githubUrl: "https://github.com/mardnts28/CLARO",
      demoVideoUrl: "https://youtube.com",
    },
    hnl: {
      githubUrl: "https://github.com/mardnts28/HNL-Construction",
      liveSiteUrl: "https://hnl-construction.com.ph",
    },
  },
  // Additional public works from https://github.com/mardnts28
  otherWorks: [
    {
      title: "HNL Latina Construction Website",
      category: "Web",
      description:
        "Full-stack corporate platform and architectural cost estimator with Next.js, Sanity CMS, and PostgreSQL. In active development.",
      githubUrl: "https://github.com/mardnts28/HNL-Construction",
      tags: ["Next.js", "Sanity CMS", "PostgreSQL", "Ongoing"],
      status: "ONGOING",
    },
    {
      title: "BantayKalusugan",
      category: "Health & Mobile",
      description:
        "Community health monitoring system with mobile frontend and backend APIs.",
      githubUrl: "https://github.com/mardnts28/BantayKalusugan-Frontend",
      tags: ["Mobile", "HealthTech", "API"],
    },
    {
      title: "VisionCart",
      category: "Computer Vision",
      description:
        "Vision-assisted smart retail & shopping cart application with automated detection.",
      githubUrl: "https://github.com/mardnts28/VisionCart",
      tags: ["Computer Vision", "React", "Python"],
    },
    {
      title: "StudyOptimizer",
      category: "Productivity & AI",
      description:
        "Academic task scheduling and intelligent study session optimizer.",
      githubUrl: "https://github.com/mardnts28/StudyOptimizer",
      tags: ["AI", "Algorithms", "Web"],
    },
    {
      title: "FlipWise",
      category: "EdTech",
      description:
        "Interactive learning and spaced-repetition flashcard system.",
      githubUrl: "https://github.com/mardnts28/FlipWise",
      tags: ["EdTech", "Full-Stack", "JavaScript"],
    },
    {
      title: "SnapDrop",
      category: "Utilities",
      description:
        "Peer-to-peer local file transfer and sharing utility across devices.",
      githubUrl: "https://github.com/mardnts28/SnapDrop",
      tags: ["WebSockets", "Networking", "Web"],
    },
  ],
  contact: {
    web3formsAccessKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "",
  },
} as const
