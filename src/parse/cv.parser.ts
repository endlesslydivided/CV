import { CVData, Project } from "./model";

export const parseCVText = (text: string): CVData => {
  const cvData: CVData = {
    name: "",
    roles: [],
    englishLevel: "",
    domains: [],
    experienceYears: 0,
    categories: {
      "Backend": [],
      "Blockchain": [],
      "Build tools": [],
      "Clouds": [],
      "CMS": [],
      "Databases": [],
      "DevOps": [],
      "Frontend": [],
      "Machine Learning": [],
      "Message brokers": [],
      "Operating systems": [],
      "Programming languages": [],
      "Source control systems": [],
    },
    projects: [],
  };

  const nameMatch = text.match(/^([A-Za-z]+\s[A-Za-z]+)/);
  if (nameMatch) cvData.name = nameMatch[0];

  const rolesMatch = text.match(/SOFTWARE ENGINEER|LEAD SOFTWARE ENGINEER|TECH LEAD|TEAM LEAD|ARCHITECTOR/g);
  if (rolesMatch) cvData.roles = rolesMatch.map(role => role.trim());

  const englishMatch = text.match(/English — (\w+)/);
  if (englishMatch) cvData.englishLevel = englishMatch[1];


  const domainsMatch = text.match(/Domains\s*[\r\n]+([\s\S]+?)(?=\r?\n.*years of experience|$)/);
  if (domainsMatch) {
    cvData.domains = domainsMatch[1]
      .split(/[\n]+/)
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
  }

  const experienceMatch = text.match(/with (\d+[\+]? years of experience)/);
  if (experienceMatch) {
    cvData.experienceYears = parseInt(experienceMatch[1]);
  }

  const categories = [
    "Backend", "Blockchain", "Build Tools", "Clouds", "CMS", "Databases", "DevOps",
    "Frontend", "Machine Learning", "Message brokers", "Operating Systems",
    "Programming languages", "Source control systems"
  ];

  categories.forEach((category) => {
    const regex = new RegExp(`${category}\\s([\\s\\S]+?)(?=\\n\\w+)`);
    const match = text.match(regex);
    if (match) {
      const values = match[1].split(',').map((item) => item.trim());
      cvData.categories[category as keyof typeof cvData.categories] = values;
    }
  });

  cvData.projects = parseProjects(text);

  return cvData;
};

function parseProjects(text: string): Project[] {

  const projectsStartIndex = text.indexOf("Projects");

  const projectsTextWithProfessionalSkills = text.slice(projectsStartIndex);

  const projectsEndIndex = projectsTextWithProfessionalSkills.indexOf("Professional skills");

  const projectsText = projectsTextWithProfessionalSkills.slice(0, projectsEndIndex);

  const lines = projectsText.split('\r\n');

  console.log('lines', lines)

  const projects: Project[] = [];

  let currentProject: Project = {
    name: '',
    description: '',
    roles: [],
    period: { start: '', end: '', duration: 0 },
    responsibilities: [],
    environment: []
  };

  let inResponsibilities = false;
  let inEnvironment = false;

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    let end = new Date(endDate);


    if (endDate === "Till now") {
      end = new Date();
    }


    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return diffMonths;
  }

  lines.forEach(line => {

    if (line.trim() === '') return;


    if (!currentProject && line !== "Projects") {
      currentProject = {
        name: line.trim(),
        description: '',
        roles: [],
        period: { start: '', end: '', duration: 0 },
        responsibilities: [],
        environment: []
      };
      return;
    }


    if (currentProject && !currentProject.description) {
      currentProject.description = line.trim();
      return;
    }


    if (line.includes("Project roles")) {
      const roles = line.replace('Project roles', '').trim();
      currentProject.roles = roles.split('/').map(role => role.trim());
      return;
    }


    if (line.includes("Period")) {
      const periodStr = line.replace('Period', '').trim();
      const [start, end] = periodStr.split('-').map(p => p.trim());
      currentProject.period.start = start;
      currentProject.period.end = end;
      currentProject.period.duration = calculateDuration(start, end);
      return;
    }


    if (line.includes("Responsibilities & achievements")) {
      inResponsibilities = true;
      return;
    }

    if (inResponsibilities) {
      if (line.includes("Environment")) {
        inResponsibilities = false;
        inEnvironment = true;
        return;
      }
      currentProject.responsibilities.push(line.trim());
      return;
    }


    if (inEnvironment) {
      currentProject.environment.push(line.trim());
      return;
    }


    if (line.includes("Professional skills")) {
      if (currentProject) {
        projects.push(currentProject);
      }
      return;
    }
  });

  console.log(projects);

  return projects;
}
