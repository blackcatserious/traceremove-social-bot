export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  progress: number;
  tasks: Task[];
  milestones: Milestone[];
  resources: Resource[];
  stakeholders: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee?: string;
  dueDate?: Date;
  dependencies: string[];
  estimatedHours: number;
  actualHours?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'delayed';
  dependencies: string[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'human' | 'tool' | 'budget' | 'infrastructure';
  availability: number;
  cost?: number;
}

export class ProjectManager {
  async createProject(params: {
    name: string;
    description: string;
    requirements: string[];
    timeline: string;
    budget?: number;
  }): Promise<Project> {
    const project: Project = {
      id: `proj_${Date.now()}`,
      name: params.name,
      description: params.description,
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
      progress: 0,
      tasks: [],
      milestones: [],
      resources: [],
      stakeholders: []
    };

    await this.generateProjectPlan(project, params.requirements);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) throw new Error('Project not found');

    const updatedProject = { ...project, ...updates };
    await this.saveProject(updatedProject);
    return updatedProject;
  }

  async trackProgress(id: string): Promise<{
    overall: number;
    tasks: { completed: number; total: number };
    milestones: { completed: number; total: number };
    timeline: { onTrack: boolean; daysRemaining: number };
  }> {
    const project = await this.getProject(id);
    if (!project) throw new Error('Project not found');

    const completedTasks = project.tasks.filter(t => t.status === 'done').length;
    const totalTasks = project.tasks.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = project.milestones.length;

    const overall = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const daysRemaining = project.endDate ? 
      Math.ceil((project.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      overall,
      tasks: { completed: completedTasks, total: totalTasks },
      milestones: { completed: completedMilestones, total: totalMilestones },
      timeline: { onTrack: overall >= 80, daysRemaining }
    };
  }

  async generateReports(id: string): Promise<{
    summary: string;
    progress: any;
    risks: string[];
    recommendations: string[];
  }> {
    const project = await this.getProject(id);
    const progress = await this.trackProgress(id);

    return {
      summary: `Project ${project?.name} is ${progress.overall.toFixed(1)}% complete`,
      progress,
      risks: this.identifyRisks(project!, progress),
      recommendations: this.generateRecommendations(project!, progress)
    };
  }

  private async generateProjectPlan(project: Project, requirements: string[]): Promise<void> {
    const tasks = requirements.map((req, index) => ({
      id: `task_${index}`,
      title: req,
      description: `Implement ${req}`,
      status: 'todo' as const,
      dependencies: [],
      estimatedHours: 8
    }));

    project.tasks = tasks;
    project.milestones = [
      {
        id: 'milestone_1',
        title: 'Project Planning Complete',
        description: 'All requirements analyzed and tasks defined',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        dependencies: []
      }
    ];
  }

  private async getProject(id: string): Promise<Project | null> {
    return null;
  }

  private async saveProject(project: Project): Promise<void> {
  }

  private identifyRisks(project: Project, progress: any): string[] {
    const risks: string[] = [];
    
    if (progress.overall < 50 && progress.timeline.daysRemaining < 30) {
      risks.push('Project behind schedule with limited time remaining');
    }
    
    if (project.tasks.filter(t => t.status === 'in_progress').length > 5) {
      risks.push('Too many tasks in progress simultaneously');
    }

    return risks;
  }

  private generateRecommendations(project: Project, progress: any): string[] {
    const recommendations: string[] = [];
    
    if (progress.overall < 30) {
      recommendations.push('Consider increasing resource allocation');
      recommendations.push('Review and prioritize critical tasks');
    }
    
    if (progress.tasks.completed === 0) {
      recommendations.push('Start with quick wins to build momentum');
    }

    return recommendations;
  }
}
