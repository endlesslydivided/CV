export interface Project {
  name: string;
  roles: string[];
  description: string;
  period: { start: string; end: string; duration: number };
  responsibilities: string[];
  environment: string[];
  environmentUnparsed: string;
}

export type CVData = {
  name: string;
  roles: string[];
  englishLevel: string;
  domains: string[];
  experienceYears: number;
  categories: {
    "Backend": string[];
    "Blockchain": string[];
    "Build tools": string[];
    "Clouds": string[];
    "CMS": string[];
    "Databases": string[];
    "DevOps": string[];
    "Frontend": string[];
    "Machine Learning": string[];
    "Message brokers": string[];
    "Operating systems": string[];
    "Programming languages": string[];
    "Source control systems": string[];
  };
  projects: Project[];
};

export interface Technologies {
  [category: string]: string[];
}

export type Keywords = string[];
