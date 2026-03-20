import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planning' | 'archived';
  progress: number;
  tasksCount: number;
  updatedAt: string;
  personnel?: string;
  duration?: string;
  legalLink?: string;
  categories?: string[];
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'updatedAt' | 'status' | 'progress' | 'tasksCount'>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      name: 'RLHF 模型训练 v2',
      description: '针对中文对话模型的高质量 RLHF 数据集构建',
      status: 'active',
      progress: 65,
      tasksCount: 12,
      updatedAt: '2026-03-12',
      personnel: 'Project Manager: Alex',
      duration: '3个月'
    },
    {
      id: 'p2',
      name: '法律合同审查',
      description: '合同风险条款自动提取与合规性检查',
      status: 'planning',
      progress: 15,
      tasksCount: 4,
      updatedAt: '2026-03-10',
      personnel: 'Legal Lead: Sarah',
      duration: '2周'
    }
  ]);

  const addProject = (newProject: Omit<Project, 'id' | 'updatedAt' | 'status' | 'progress' | 'tasksCount'>) => {
    const project: Project = {
      ...newProject,
      id: `p${Date.now()}`,
      status: 'planning',
      progress: 0,
      tasksCount: 0,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [project, ...prev]);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}