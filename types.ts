

export enum Role {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN', // Represents Dept Manager/Director/Principal/Finance based on context
}

export enum RequestStatus {
  AUTO_APPROVED = 'AUTO_APPROVED', // < 1000
  PENDING_DIRECTOR = 'PENDING_DIRECTOR', // 1000 - 4999
  PENDING_FULL_CHAIN = 'PENDING_FULL_CHAIN', // >= 5000
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED', // PO Generated
  STOCKED = 'STOCKED', // Received into Inventory
  RECONCILED = 'RECONCILED',
}

export interface StockLog {
  id: string;
  date: string;
  action: 'RESTOCK' | 'USAGE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  user: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  minThreshold: number;
  image?: string;
  description?: string;
  supplier?: string;
  location?: string;
  stockLogs?: StockLog[];
}

export interface FixedAsset {
  id: string;
  name: string;
  price: number;
  location: string; // e.g., "K1 Classroom", "Library"
  image?: string;
  category: string;
  status: 'Active' | 'Under Maintenance' | 'Written Off';
  purchaseDate: string;
  contractId?: string; // Link to Procurement Contract
}

export type RequestType = 'PURCHASE' | 'TRANSFER' | 'SCRAP';

export interface PurchaseRequest {
  id: string;
  requesterName: string; // User or Class Name
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: RequestStatus;
  timestamp: string;
  
  // New Fields per spec
  vendor?: string;
  purpose?: string;
  note?: string;
  urgent?: boolean;
  aiAnalysis?: string;
  approvalChain?: string[]; // List of roles who approved
  
  // Fixed Asset Fields
  isFixedAsset?: boolean;
  requestType?: RequestType;
  fixedAssetId?: string; // For transfers
  
  // Scrap Fields
  scrapReason?: string;
  scrapImage?: string;
}

export type EventType = 'MEETING' | 'ACTIVITY' | 'ADMIN_TASK' | 'PERSONAL' | 'NOTIFICATION' | 'BOOKING';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start: string; // ISO String
  end: string;   // ISO String
  description?: string;
  isMandatory?: boolean;
  assignedBy?: string; // Admin Name
  target?: 'ALL' | 'TEACHER' | 'CLASS';
  targetId?: string; // specific class or teacher ID
  ownerId?: string; // If personal event
  isCompleted?: boolean; // Track task completion status
  venueId?: string; // For Venue Bookings
}

export interface Venue {
  id: string;
  name: string;
  capacity: number; // How many classes can use it simultaneously
  openTime: string; // e.g., "08:00"
  closeTime: string; // e.g., "18:00"
}

export interface Notification {
  id: string;
  message: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  target: 'ALL' | 'CLASS';
  targetId?: string;
  relatedDocId?: string; // To link back to expiring contract/file
}

export interface ChartData {
  name: string;
  value: number;
  uv?: number; // Used for secondary data (e.g., Average)
}

export interface ClassConsumption {
  className: string;
  month: string; // Format: YYYY-MM
  items: { [itemName: string]: number }; // e.g. { "Markers": 20, "Paper": 50 }
}

export interface AnnualSpend {
  month: string;
  amount: number;
}

// --- User Management & Archives ---

export enum TeacherStatus {
  ACTIVE = 'Active',
  SICK_LEAVE = 'Sick Leave',
  PERSONAL_LEAVE = 'Personal Leave',
  BUSINESS_TRIP = 'Business Trip',
  OVERTIME = 'Overtime',
  LATE = 'Late' // Added Late status
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedClass: string; // matches CLASSES constant
  status: TeacherStatus;
  avatar?: string;
  dob?: string;
  
  // Attendance Settings
  attendancePassword?: string; // Default 0001
  workStartTime?: string; // HH:mm, default 08:00
  workEndTime?: string; // HH:mm, default 17:00
  
  // Extended Archive Fields
  gender?: 'M' | 'F';
  idCard?: string;
  passport?: string;
  passportExpiry?: string;
  address?: string;
  nationality?: string;
  emergencyContact?: string;
  visaExpiry?: string;
  highestDegree?: string;
  graduatedSchool?: string;
  files?: string[]; // Attachments
}

export enum StudentStatus {
  PRESENT = 'Present',
  LEAVE = 'Leave',
  SICK = 'Sick',
  LEFT = 'Left School',
  LATE = 'Late' // Added Late status
}

export interface ParentInfo {
  // Father
  fatherName: string;
  fatherPhone: string;
  fatherDob?: string;
  fatherGender?: 'M' | 'F';
  fatherId?: string;
  fatherPassport?: string;
  fatherWorkplace?: string;
  fatherNationality?: string;
  
  // Mother
  motherName: string;
  motherPhone: string;
  motherDob?: string;
  motherGender?: 'M' | 'F';
  motherId?: string;
  motherPassport?: string;
  motherWorkplace?: string;
  motherNationality?: string;
  
  // Generic / Emergency
  emergencyContact: string;
  relationship?: string; // e.g. "Grandparent", "Father"
}

export interface Student {
  id: string;
  name: string;
  gender: 'M' | 'F';
  dob: string; // ISO Date
  assignedClass: string;
  status: StudentStatus;
  studentCategory?: 'HUAWEI' | 'STAFF' | 'REGULAR'; // New Classification
  parents: ParentInfo;
  image?: string;
  absenceReason?: string;
  
  // Extended Archive Fields (21 fields spec)
  height?: number; // cm
  weight?: number; // kg
  idCard?: string;
  passport?: string;
  address?: string;
  nationality?: string;
  files?: string[]; // Attachments (List of filenames/URLs)
}

// --- Archive / Files ---

export interface ContractSignature {
  role: string;
  name: string;
  date: string;
  signatureImage?: string; // Data URL from canvas
  comment?: string;
}

export interface Contract {
  id: string; // e.g. TLPS2025082684 (Editable)
  name: string;
  category: 'PURCHASE' | 'SERVICE' | 'OTHER';
  amount: number;
  counterparty: string; // Opposite Unit
  summary: string;
  department: string;
  handler: string;
  
  // Dates
  creationDate: string;
  expiryDate?: string; // For service contracts
  
  // Approvals
  signatures: ContractSignature[]; // Dept, DeputyDept, Finance, Office, VP, Principal
  majorContractOpinion?: string; // Collective approval opinion
  
  // Files
  comparisonReport?: string; // File URL/Name
  contractFile?: string; // File URL/Name
  approvalFormFile?: string; // Signed Approval Form
  invoiceFile?: string; // Invoice
  otherFiles?: string[];
  
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
}

export interface SchoolFile {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  expiryDate?: string;
  fileUrl: string;
  description?: string;
}

// --- Trash / Recycle Bin ---

export enum TrashType {
  CONTRACT = 'CONTRACT',
  FILE = 'FILE',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ASSET = 'ASSET',
  INVENTORY_ITEM = 'INVENTORY_ITEM'
}

export interface TrashItem {
  id: string;
  name: string;
  type: TrashType;
  deletedAt: string;
  originalData: any;
}

// --- Weekly Report ---

export interface WeeklyReport {
    id: string;
    weekLabel: string; // e.g. "WEEK 16"
    monthLabel: string; // e.g. "DEC"
    dateRangeLabel: string; // e.g. "8/12 - 12/12"
    yearLabel: string; // e.g. "2025"
    themeColor: 'RED' | 'ORANGE' | 'PURPLE' | 'BLUE' | 'GREEN';
    mondayDate: string; // ISO String for Monday of that week
    content: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
        notes: string;
    };
    linkedEventIds: string[]; // IDs of events synced from calendar
}

// --- Attendance ---

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    userRole: 'TEACHER' | 'STUDENT';
    date: string; // ISO Date String (just date part usually or full ISO)
    time: string; // HH:mm
    status: string; // Status from Enums
    isLate: boolean;
    note?: string;
}