// Predefined skills list for autocomplete
export const SKILLS_LIST = [
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "Scala",
  "R",
  "MATLAB",
  "SQL",
  "HTML",
  "CSS",
  
  // Frontend Frameworks
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "SvelteKit",
  "Astro",
  "Remix",
  "Gatsby",
  
  // Backend Frameworks
  "Node.js",
  "Express.js",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "Ruby on Rails",
  "Laravel",
  "ASP.NET",
  
  // Mobile Development
  "React Native",
  "Flutter",
  "SwiftUI",
  "Jetpack Compose",
  "Ionic",
  "Expo",
  
  // Database
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Firebase",
  "Supabase",
  "Prisma",
  "Drizzle ORM",
  
  // Cloud & DevOps
  "AWS",
  "Google Cloud",
  "Azure",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "GitHub Actions",
  "Vercel",
  "Netlify",
  
  // AI/ML
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "OpenAI API",
  "LangChain",
  "Computer Vision",
  "NLP",
  "Data Science",
  "Pandas",
  "NumPy",
  
  // Design
  "UI Design",
  "UX Design",
  "Figma",
  "Adobe XD",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "Canva",
  "Framer",
  "Webflow",
  
  // Other Technical
  "Git",
  "Linux",
  "REST APIs",
  "GraphQL",
  "WebSockets",
  "Microservices",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Blockchain",
  "Web3",
  "Solidity",
  
  // Soft Skills
  "Leadership",
  "Project Management",
  "Agile",
  "Scrum",
  "Communication",
  "Problem Solving",
  "Team Collaboration",
  "Technical Writing",
  "Public Speaking",
  "Mentoring",
];

// Function to filter skills based on query
export function filterSkills(query: string, currentSkills: string[]): string[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  return SKILLS_LIST
    .filter(skill => 
      skill.toLowerCase().includes(lowerQuery) && 
      !currentSkills.includes(skill)
    )
    .slice(0, 8);
}
