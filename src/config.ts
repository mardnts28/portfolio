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
    linkedin: "https://www.linkedin.com/in/mary-ardientes-aa8598315",
    githubUsername: "mardnts28",
    githubUrl: "https://github.com/mardnts28",
  },
  projects: {
    rice: {
      githubUrl: "https://github.com/mardnts28/ph-rice-market-forecast",
      liveReportUrl: "https://app.powerbi.com",
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
      title: "AI-Recommender",
      category: "Machine Learning",
      description:
        "Machine learning recommendation engine analyzing user behavior and preference vectors.",
      githubUrl: "https://github.com/mardnts28/AI-Recommender",
      tags: ["Machine Learning", "Python", "Data"],
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
} as const
