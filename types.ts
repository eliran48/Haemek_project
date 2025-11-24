
export enum Role {
  PROJECT_MANAGER = 'מנהל פרויקט',
  DEVELOPER = 'מפתח',
  DESIGNER = 'מעצב',
  CLIENT = 'לקוח',
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email?: string;
  phone?: string;
}

export enum TaskStatus {
  TODO = 'לביצוע',
  IN_PROGRESS = 'בתהליך',
  DONE = 'בוצע',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  status: TaskStatus;
  dueDate?: string;
}

export interface ProjectPhase {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  percentage: number;
}

export interface MeetingNote {
  id: string;
  date: string;
  title: string;
  content: string; // Raw text
  actionItems: { text: string; isDone: boolean }[]; // Parsed checkboxes
}

export interface ModuleCost {
  name: string;
  price: number;
  description: string;
  selected: boolean;
}
