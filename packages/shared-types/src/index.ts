export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type User = {
  id: string;
  email: string;
  phone?: string | null;
  displayName: string;
  role: Role;
};

export type Student = {
  id: string;
  userId: string;
  grade?: string | null;
  clazz?: string | null;
  guardian?: string | null;
};

export type Teacher = {
  id: string;
  userId: string;
  title?: string | null;
  department?: string | null;
};

export type InventoryStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';
export type InventoryItem = {
  id: string;
  name: string;
  category?: string | null;
  status: InventoryStatus;
  serialNumber?: string | null;
  assignedToStudentId?: string | null;
  assignedToTeacherId?: string | null;
};

export type Venue = {
  id: string;
  name: string;
  location?: string | null;
  capacity?: number | null;
  resources?: string | null;
};

export type Report = {
  id: string;
  studentId: string;
  teacherId?: string | null;
  weekOf: string;
  content: string;
  feedback?: string | null;
  aiSummary?: string | null;
};

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RequestType = 'LEAVE' | 'RESOURCE' | 'MAINTENANCE' | 'OTHER';
export type Request = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  reason: string;
  studentId?: string | null;
  teacherId?: string | null;
};

export type AiRecord = {
  id: string;
  reportId: string;
  prompt: string;
  response: string;
  model: string;
};
