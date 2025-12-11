import { TCCProject } from '../types';

const STORAGE_KEY = 'thesisforge_projects';

export const getProjects = (): TCCProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from storage', error);
    return [];
  }
};

export const getProjectById = (id: string): TCCProject | undefined => {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
};

export const saveProject = (project: TCCProject): void => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: Date.now() };
  } else {
    projects.push({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const deleteProject = (id: string): void => {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};