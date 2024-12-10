import { CVData, Project } from "./model";

const TILL_NOW = ['till now', 'Till now']

const CATEGORIES = [
  "Backend", "Blockchain", "Build Tools", "Clouds", "CMS", "Databases", "DevOps",
  "Frontend", "Machine Learning", "Message brokers", "Operating Systems",
  "Programming languages", "Source control systems"
];

const initialProject: Project = {
  name: '',
  description: '',
  roles: [],
  period: { start: '', end: '', duration: 0 },
  responsibilities: [],
  environmentUnparsed: '',
  environment: []
};

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


  CATEGORIES.forEach((category) => {
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

  const projects: Project[] = [];

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    let end = new Date(endDate);


    if (TILL_NOW.some(value => value === endDate)) {
      end = new Date();
    }


    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return diffMonths;
  }

  const sections = {
    projectRoles: 'Project roles',
    period: 'Period',
    resps: 'Responsibilities & achievements',
    env: 'Environment'
  }

  let isNextDescription = false;
  let isRespsList = false;

  let currentProject: Project = Object.assign({}, initialProject);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line && line.toUpperCase() === line) {
      currentProject.name = line;
      isNextDescription = true;
      continue;
    }

    if (line.trim() === 'Project roles') {
      isNextDescription = false;
      const roles = lines[++i];
      currentProject.roles = roles.split('/').map(role => role.trim());
      continue;
    };

    if (isRespsList) {

      if (line === sections.env) {
        isRespsList = false;
        const envs = lines[++i];
        currentProject.environment = envs.split(', ');
        currentProject.environmentUnparsed = envs;
        const copiedProject = JSON.parse(JSON.stringify(currentProject));
        projects.push(copiedProject);
        currentProject = Object.assign({}, initialProject);
        continue;
      }
      if(line) {
        currentProject.responsibilities = [...currentProject.responsibilities, line];
      }
      continue;
    }

    if (isNextDescription) {
      currentProject.description += line;
      continue;
    }

    switch (line) {
      case sections.period: {
        const periodStr = lines[++i];
        const [start, end] = periodStr.split('-').map(p => p.trim());
        currentProject.period = {
          start,
          end,
          duration: calculateDuration(start, end),
        };
        continue;
      }
      case sections.resps: {
        isRespsList = true;
        continue;
      }
    }

  }

  return projects;
}
