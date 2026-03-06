import { Job } from "../types/job";

export const mockJobs: Job[] = [
  {
    id: 1,
    title: "Director DS/AI",
    company: "E-Commerce",
    location: "Mumbai",
    experience: 10,
    employmentType: "Full Time",
    skills: ["Java", "Python", "C++"],
    description: "We are looking for a seasoned Director of Data Science and AI to lead our strategic initiatives in machine learning and data-driven decision making.",
    responsibilities: [
      "Lead a team of 20+ data scientists and engineers.",
      "Develop long-term AI strategy for the product.",
      "Collaborate with stakeholders to identify high-impact AI opportunities."
    ],
    postedAt: "2025-01-01",
    workMode: "Remote",
    salaryRange: "$180k - $250k"
  },
  {
    id: 2,
    title: "Senior React Developer",
    company: "SaaS Solutions",
    location: "Bangalore",
    experience: 5,
    employmentType: "Full Time",
    skills: ["React", "Next.js", "TypeScript", "Tailwind"],
    description: "Join our core engineering team to build the future of project management tools.",
    responsibilities: [
      "Develop high-performance UI components.",
      "Optimize application for maximum speed and scalability.",
      "Mentor junior developers."
    ],
    postedAt: "2025-02-15",
    workMode: "Hybrid",
    salaryRange: "$100k - $140k"
  },
  {
    id: 3,
    title: "Product Designer",
    company: "Creative Studio",
    location: "London",
    experience: 3,
    employmentType: "Contract",
    skills: ["Figma", "UI/UX", "Adobe XD"],
    description: "We need a creative product designer to help us redesign our flagship mobile app.",
    responsibilities: [
      "Create wireframes and high-fidelity prototypes.",
      "Conduct user research and testing.",
      "Work closely with developers to ensure design fidelity."
    ],
    postedAt: "2025-02-20",
    workMode: "Onsite",
    salaryRange: "$80k - $110k"
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "FinTech Pro",
    location: "New York",
    experience: 4,
    employmentType: "Full Time",
    skills: ["Node.js", "Go", "PostgreSQL", "Docker"],
    description: "Build robust and secure financial processing systems.",
    responsibilities: [
      "Design and implement scalable microservices.",
      "Optimize database queries for performance.",
      "Ensure system reliability and security."
    ],
    postedAt: "2025-02-18",
    workMode: "Remote",
    salaryRange: "$130k - $170k"
  },
  {
    id: 5,
    title: "DevOps Architect",
    company: "Cloud Scale",
    location: "San Francisco",
    experience: 8,
    employmentType: "Full Time",
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD"],
    description: "Lead our infrastructure transformation to cloud-native technologies.",
    responsibilities: [
      "Design and implement multi-region infrastructure.",
      "Automate deployment pipelines.",
      "Manage system observability and alerting."
    ],
    postedAt: "2025-02-10",
    workMode: "Hybrid",
    salaryRange: "$160k - $210k"
  }
];
