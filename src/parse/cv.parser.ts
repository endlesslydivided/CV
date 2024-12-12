import { escapeRegExp, flatten, flattenDeep, values } from 'lodash';
import { CVData, IClouds, Project } from "./model";

import { findTechnologies } from "./requirements.parser";
import { unprefixedClouds } from './unprefixedCloud';

const TILL_NOW = ['till now', 'Till now']

const CATEGORIES = [
  "Backend", "Blockchain", "Build Tools", "Clouds", "CMS", "Databases", "DevOps",
  "Frontend", "Machine Learning", "Message brokers", "Operating Systems",
  "Programming languages", "Source control systems"
];

const CLOUD_PLATFORMS = ["AWS","Azure","GCP","Heroku","DigitalOcean","Salesforce"]

const initialProject: Project = {
  name: '',
  description: '',
  roles: [],
  period: { start: '', end: '', duration: 0 },
  responsibilities: [],
  environmentUnparsed: '',
  techsFromResps:[],
  clouds:{
    envs: [],
    reps: [],
  },
  environment: []
};

export const parseCVText = (text: string): CVData => {
  const cvData: CVData = {
    name: "",
    summary: "",
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

  const summaryMatch = text.match(/years of experience\.\s*(.*?)\s*Programming languages/);
  if (summaryMatch) {
    cvData.summary = summaryMatch[1];
  }

  const techsStart = text.indexOf('Programming languages');
  const techsEnd = text.indexOf('Projects');

  const techsText = text.slice(techsStart,techsEnd);

  console.log('techsText',techsText);

  CATEGORIES.forEach((category) => {
    const regex = new RegExp(`${category}\\s([\\s\\S]+?)(?=\\n\\w+|\\n\\W)`);
    const match = techsText.match(regex);
    if (match) {
      const values = match[1].split(',').map((item) => (item.trim()).replace('.',''));
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
        const cloudServiceEnvs = getCloudsFromEnvs(envs)
        currentProject.clouds = {
          ...currentProject.clouds,
          envs: cloudServiceEnvs
        }
        const copiedProject = JSON.parse(JSON.stringify(currentProject));
        projects.push(copiedProject);
        currentProject = Object.assign({}, initialProject);
        continue;
      }
      if(line) {
        const foundTechs = findTechnologies(line);
        const cloudsFromResp = foundTechs['Clouds'];
        const techsFromResps = flattenDeep(values(foundTechs));

        if(cloudsFromResp?.length > 0) {
          const cloudsFromsRespWithPlatforms: IClouds[] = cloudsFromResp.map(item => {
            const inputUpper = item.toUpperCase();
            
            for (const platform of CLOUD_PLATFORMS) {
              const platformUpper = platform.toUpperCase();
              
              if (inputUpper.startsWith(platformUpper)) {
                const service = item.slice(platform.length).trim();
                
                return {
                  platform: platform,
                  service: service.trim()
                };
              }
            }
            return {
              platform: '',
              service: item
            }
          })

          currentProject.clouds = {
            ...currentProject.clouds,
            reps: [...currentProject.clouds.reps, ...cloudsFromsRespWithPlatforms]
          }
        }

        currentProject.techsFromResps = [...currentProject.techsFromResps, ...techsFromResps];
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


const getCloudsFromEnvs = (envs: string) => {
    // Регулярное выражение для поиска платформ и технологий в скобках
    const pattern = /([A-Za-z0-9\s]+)\s*\(([^)]+)\)/g;
  
    // Массив для хранения результатов
    const result: IClouds[] = [];
    
    // Ищем все совпадения с регулярным выражением
    let match: RegExpExecArray | null;
    
    // Проходим по всем совпадениям
    while ((match = pattern.exec(envs)) !== null) {
      
      const platform = match[1].trim();
      
      match[2].split(',').forEach(tech => {
        result.push({
          platform,
          service: tech.trim(),
        })
      });
      
    }
    
    return result;
}

const findCloudns = (text: string) => {
	const matches: string[] = [];

	Object.keys(unprefixedClouds).forEach(cloud => {
  	const regex = new RegExp('\\b' + escapeRegExp(cloud) + '\\b', 'gi');
    if (regex.test(text)) {
      matches.push(text);
    }
	});

	return matches;
}