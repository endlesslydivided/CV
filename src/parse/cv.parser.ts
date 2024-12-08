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

  // 1. Имя и фамилия
  const nameMatch = text.match(/^([A-Za-z]+\s[A-Za-z]+)/);
  if (nameMatch) cvData.name = nameMatch[0];

  // 2. Роли из CV
  const rolesMatch = text.match(/SOFTWARE ENGINEER|LEAD SOFTWARE ENGINEER|TECH LEAD|TEAM LEAD|ARCHITECTOR/g);
  if (rolesMatch) cvData.roles = rolesMatch.map(role => role.trim());

  // 3. Уровень английского
  const englishMatch = text.match(/English — (\w+)/);
  if (englishMatch) cvData.englishLevel = englishMatch[1];


  const domainsMatch = text.match(/Domains\s+([\s\S]+?)(?=\n\s*\w|$)/);
  if (domainsMatch) {
    // Разделяем домены по запятой, новой строке или комбинации этих символов
    cvData.domains = domainsMatch[1]
      .split(/[\n,]+/)  // Разделение по запятой, новой строке или комбинации этих символов
      .map(domain => domain.trim())  // Убираем лишние пробелы
      .filter(domain => domain.length > 0);  // Убираем пустые строки
  }

  // 5. Количество лет
  const experienceMatch = text.match(/with (\d+[\+]? years of experience)/);
  if (experienceMatch) {
    cvData.experienceYears = parseInt(experienceMatch[1]);
  }

  // 6. Значения после категорий
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
  
  // Ищем раздел "Projects", игнорируя все, что идет до него
  const projectsStartIndex = text.indexOf("Projects");

  const projectsTextWithProfessionalSkills = text.slice(projectsStartIndex);

  const projectsEndIndex = projectsTextWithProfessionalSkills.indexOf("Professional skills");

  const projectsText = projectsTextWithProfessionalSkills.slice(0,projectsEndIndex);
  
  const lines = projectsText.split('\r\n');

  console.log('lines',lines)

  // Объект для хранения информации о проектах
  const projects: Project[] = [];

  let currentProject: Project  = {
    name: '',
    description: '',
    roles: [],
    period: { start: '', end: '', duration: 0 },
    responsibilities: [],
    environment: []
  };

  let inResponsibilities = false;
  let inEnvironment = false;
  
  // Функция для вычисления продолжительности в месяцах
  const calculateDuration = (startDate: string, endDate: string) => {
      const start = new Date(startDate);
      let end = new Date(endDate);
  
      // Если конец - "Till now", то считаем до текущей даты
      if (endDate === "Till now") {
          end = new Date();  // Текущая дата
      }
  
      // Рассчитываем разницу в месяцах
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return diffMonths;
  }
  
  // Проходим по строкам
  lines.forEach(line => {
      // Пропускаем пустые строки
      if (line.trim() === '') return;
  
      // Понимаем, когда начинается новый проект
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
  
      // Если мы находимся в разделе описания проекта
      if (currentProject && !currentProject.description) {
          currentProject.description = line.trim();
          return;
      }
  
      // Когда встретили "Project roles", начинаем заполнять роли
      if (line.includes("Project roles")) {
          const roles = line.replace('Project roles', '').trim();
          currentProject.roles = roles.split('/').map(role => role.trim());  // Разделяем роли по "/"
          return;
      }
  
      // Когда встретили "Period", заполняем период
      if (line.includes("Period")) {
          const periodStr = line.replace('Period', '').trim();
          const [start, end] = periodStr.split('-').map(p => p.trim());
          currentProject.period.start = start;
          currentProject.period.end = end;
          currentProject.period.duration = calculateDuration(start, end);  // Вычисляем продолжительность
          return;
      }
  
      // Когда встретили "Responsibilities & achievements", начинаем заполнять обязанности
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
  
      // Когда встретили "Environment", начинаем заполнять технологии
      if (inEnvironment) {
          currentProject.environment.push(line.trim());
          return;
      }
  
      // Если мы дошли до "Professional skills", заканчиваем сбор данных о проектах
      if (line.includes("Professional skills")) {
          if (currentProject) {
              projects.push(currentProject);  // Сохраняем текущий проект
          }
          return;
      }
  });
  
  // Пример вывода собранных данных
  console.log(projects);

  return projects;
}
