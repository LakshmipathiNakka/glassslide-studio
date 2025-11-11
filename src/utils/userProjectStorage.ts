export interface GSlideProject {
  id: string;
  name: string;
  slides: any[];
  createdAt: number;
  lastModified: number;
}

export function getUserStorageKey(username: string): string {
  return `glassslide_projects_${username}`;
}

export function getUserProjects(username: string): GSlideProject[] {
  try {
    const stored = localStorage.getItem(getUserStorageKey(username));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading user projects:', error);
    return [];
  }
}

export function saveUserProject(username: string, project: GSlideProject): void {
  try {
    const projects = getUserProjects(username);
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, lastModified: Date.now() };
    } else {
      projects.push({ ...project, lastModified: Date.now() });
    }
    
    localStorage.setItem(getUserStorageKey(username), JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project:', error);
    throw new Error('Failed to save project');
  }
}

export function deleteUserProject(username: string, projectId: string): void {
  try {
    const projects = getUserProjects(username).filter(p => p.id !== projectId);
    localStorage.setItem(getUserStorageKey(username), JSON.stringify(projects));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}
