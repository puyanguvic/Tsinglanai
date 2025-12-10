





import { InventoryItem, PurchaseRequest, RequestStatus, CalendarEvent, ClassConsumption, AnnualSpend, Notification, Teacher, TeacherStatus, Student, StudentStatus, FixedAsset, Venue, WeeklyReport } from './types';

export const CLASSES = [
  'K1', 'K2', 'K3', 'K4',
  'PreK1', 'PreK2', 'PreK3', 'PreK4', 'PreK5', 'PreK6', 'PreK7', 'PreK8',
  'Administration', 'Property', 'Canteen'
];

export const NON_TEACHING_DEPTS = ['Administration', 'Property', 'Canteen'];

export const TRACKED_ITEMS = ['Markers', 'Paper', 'Glue', 'Paint', 'Wipes'];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Holographic Markers',
    category: 'Art Supplies',
    quantity: 45,
    unit: 'box',
    price: 120,
    minThreshold: 10,
    image: 'https://picsum.photos/200/200?random=1',
    description: 'Professional grade holographic markers capable of 3D projection on compatible air-canvas surfaces.',
    supplier: 'Prisma Corp',
    location: 'Shelf A-12',
    stockLogs: []
  },
  {
    id: '2',
    name: 'Whiteboard Pens',
    category: 'Stationery',
    quantity: 12,
    unit: 'box',
    price: 60,
    minThreshold: 5,
    image: 'https://picsum.photos/200/200?random=2',
    description: 'Standard erasable markers.',
    supplier: 'OfficeDepot',
    location: 'Cabinet B',
    stockLogs: []
  },
  {
    id: '3',
    name: 'A4 Paper',
    category: 'Stationery',
    quantity: 100,
    unit: 'ream',
    price: 35,
    minThreshold: 20,
    image: 'https://picsum.photos/200/200?random=3',
    description: 'Standard A4 printer paper.',
    supplier: 'PaperCo',
    location: 'Cabinet C',
    stockLogs: []
  },
  {
    id: '4',
    name: 'Liquid Glue',
    category: 'Art Supplies',
    quantity: 30,
    unit: 'bottle',
    price: 15,
    minThreshold: 10,
    image: 'https://picsum.photos/200/200?random=4',
    description: 'Non-toxic washable glue.',
    supplier: 'CraftWorld',
    location: 'Shelf A-05',
    stockLogs: []
  },
  {
    id: '5',
    name: 'Acrylic Paint Set',
    category: 'Art Supplies',
    quantity: 25,
    unit: 'set',
    price: 85,
    minThreshold: 8,
    image: 'https://picsum.photos/200/200?random=5',
    description: '12-color acrylic paint set.',
    supplier: 'Artistic',
    location: 'Shelf A-02',
    stockLogs: []
  },
  {
    id: '6',
    name: 'Sanitizing Wipes',
    category: 'Hygiene',
    quantity: 50,
    unit: 'pack',
    price: 25,
    minThreshold: 15,
    image: 'https://picsum.photos/200/200?random=6',
    description: 'Alcohol-free sanitizing wipes.',
    supplier: 'CleanLife',
    location: 'Cabinet D',
    stockLogs: []
  }
];

export const INITIAL_FIXED_ASSETS: FixedAsset[] = [
    {
        id: 'fa-1',
        name: 'Interactive Smart Board',
        price: 12000,
        location: 'K1 Classroom',
        category: 'Electronics',
        status: 'Active',
        purchaseDate: '2023-01-15',
        image: 'https://picsum.photos/200/200?random=10'
    },
    {
        id: 'fa-2',
        name: 'Library Piano',
        price: 25000,
        location: 'Library',
        category: 'Musical Instruments',
        status: 'Active',
        purchaseDate: '2022-05-20',
        image: 'https://picsum.photos/200/200?random=11'
    },
    {
        id: 'fa-3',
        name: 'Office Printer Pro',
        price: 5000,
        location: 'Administration',
        category: 'Electronics',
        status: 'Under Maintenance',
        purchaseDate: '2023-08-10',
        image: 'https://picsum.photos/200/200?random=12'
    }
];

export const INITIAL_REQUESTS: PurchaseRequest[] = [
  {
    id: 'req-001',
    requesterName: 'K1 Teacher',
    itemName: 'Whiteboard Pens',
    quantity: 5,
    unitPrice: 60,
    totalAmount: 300,
    status: RequestStatus.PENDING_DIRECTOR,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    vendor: 'OfficeDepot',
    purpose: 'Classroom teaching',
    note: 'Urgent need for math class',
    urgent: true,
    aiAnalysis: 'Low value item. Awaiting approval.',
    requestType: 'PURCHASE'
  },
  {
    id: 'req-002',
    requesterName: 'PreK3 Teacher',
    itemName: 'Smart Projector',
    quantity: 1,
    unitPrice: 3500,
    totalAmount: 3500,
    status: RequestStatus.PENDING_DIRECTOR,
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    vendor: 'TechGlobal',
    purpose: 'Multimedia lessons',
    aiAnalysis: 'Amount 1000-4999. Requires Principal approval.',
    requestType: 'PURCHASE'
  },
  {
    id: 'req-003',
    requesterName: 'K2 Teacher',
    itemName: 'A4 Paper',
    quantity: 10,
    unitPrice: 35,
    totalAmount: 350,
    status: RequestStatus.APPROVED,
    timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
    vendor: 'PaperCo',
    purpose: 'Printing materials',
    aiAnalysis: 'Auto-approved.',
    requestType: 'PURCHASE'
  },
  {
    id: 'req-004',
    requesterName: 'K1 Teacher',
    itemName: 'Acrylic Paint Set',
    quantity: 2,
    unitPrice: 85,
    totalAmount: 170,
    status: RequestStatus.APPROVED,
    timestamp: new Date(Date.now() - 40 * 86400000).toISOString(), // Last month
    vendor: 'Artistic',
    purpose: 'Art class',
    aiAnalysis: 'Auto-approved.',
    requestType: 'PURCHASE'
  }
];

export const APPROVAL_LIMITS = {
  AUTO_LIMIT: 1000,
  DIRECTOR_LIMIT: 5000,
};

export const INITIAL_EVENTS: CalendarEvent[] = [
    {
        id: 'evt-1',
        title: 'Flag Raising Ceremony',
        type: 'ACTIVITY',
        start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        description: 'Outdoor field',
        isMandatory: true,
        assignedBy: 'Admin',
        target: 'ALL'
    },
    {
        id: 'evt-2',
        title: 'Chinese HRT Meeting',
        type: 'MEETING',
        start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
        description: 'Weekly HRT sync',
        target: 'ALL',
        isMandatory: true
    }
];

// Helper to generate random consumption
const getRandomConsumption = () => {
  const data: {[key: string]: number} = {};
  TRACKED_ITEMS.forEach(item => {
    data[item] = Math.floor(Math.random() * 50) + 10;
  });
  return data;
};

// Generate data for Current Month and Last Month for all classes
const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const getLastMonth = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const currentMonthData: ClassConsumption[] = CLASSES.map(cls => ({
  className: cls,
  month: getCurrentMonth(),
  items: getRandomConsumption()
}));

const lastMonthData: ClassConsumption[] = CLASSES.map(cls => ({
  className: cls,
  month: getLastMonth(),
  items: getRandomConsumption() // different random numbers
}));

export const INITIAL_CLASS_CONSUMPTION: ClassConsumption[] = [...currentMonthData, ...lastMonthData];

export const MOCK_ANNUAL_SPEND: AnnualSpend[] = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 75000 }, // End of term
    { month: 'Jul', amount: 30000 },
    { month: 'Aug', amount: 85000 }, // Start of term
    { month: 'Sep', amount: 62000 },
    { month: 'Oct', amount: 58000 },
    { month: 'Nov', amount: 54000 },
    { month: 'Dec', amount: 60000 },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        message: 'Annual Inventory Audit starts next Monday. Please organize your shelves.',
        createdBy: 'Admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
        target: 'ALL'
    }
];

export const INITIAL_TEACHERS: Teacher[] = [
    // K1 Teachers (3)
    {
        id: 'tch-1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@tsinglan.edu',
        phone: '138-0000-0001',
        assignedClass: 'K1',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        dob: '1985-04-12',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    {
        id: 'tch-1b',
        name: 'John Doe',
        email: 'john.d@tsinglan.edu',
        phone: '138-0000-0101',
        assignedClass: 'K1',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=john',
        dob: '1990-08-23',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    {
        id: 'tch-1c',
        name: 'Jane Smith',
        email: 'jane.s@tsinglan.edu',
        phone: '138-0000-0102',
        assignedClass: 'K1',
        status: TeacherStatus.PERSONAL_LEAVE,
        avatar: 'https://i.pravatar.cc/150?u=jane',
        dob: '1988-12-05',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    // K2 Teacher
    {
        id: 'tch-2',
        name: 'Michael Chen',
        email: 'm.chen@tsinglan.edu',
        phone: '138-0000-0002',
        assignedClass: 'K2',
        status: TeacherStatus.SICK_LEAVE,
        avatar: 'https://i.pravatar.cc/150?u=mike',
        dob: '1992-02-14',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    // PreK1 Teachers (4)
    {
        id: 'tch-pk1a',
        name: 'Amanda Lee',
        email: 'amanda.l@tsinglan.edu',
        phone: '138-0000-0003',
        assignedClass: 'PreK1',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=amanda',
        dob: '1993-05-30',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    {
        id: 'tch-pk1b',
        name: 'Bob Wang',
        email: 'bob.w@tsinglan.edu',
        phone: '138-0000-0004',
        assignedClass: 'PreK1',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=bob',
        dob: '1989-11-11',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    {
        id: 'tch-pk1c',
        name: 'Cindy Liu',
        email: 'cindy.l@tsinglan.edu',
        phone: '138-0000-0005',
        assignedClass: 'PreK1',
        status: TeacherStatus.BUSINESS_TRIP,
        avatar: 'https://i.pravatar.cc/150?u=cindy',
        dob: '1995-07-19',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    {
        id: 'tch-pk1d',
        name: 'David Gu',
        email: 'david.g@tsinglan.edu',
        phone: '138-0000-0006',
        assignedClass: 'PreK1',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=david',
        dob: '1991-03-25',
        attendancePassword: '0001',
        workStartTime: '08:00',
        workEndTime: '17:00'
    },
    // Admin
    {
        id: 'tch-admin',
        name: 'Emily Zhao',
        email: 'emily.z@tsinglan.edu',
        phone: '138-0000-0003',
        assignedClass: 'Administration',
        status: TeacherStatus.ACTIVE,
        avatar: 'https://i.pravatar.cc/150?u=emily',
        dob: '1980-01-01',
        attendancePassword: 'admin',
        workStartTime: '08:00',
        workEndTime: '17:00'
    }
];

export const INITIAL_STUDENTS: Student[] = [
    {
        id: 'stu-1',
        name: 'Alex Li',
        gender: 'M',
        dob: '2019-05-15',
        assignedClass: 'K1',
        status: StudentStatus.PRESENT,
        studentCategory: 'HUAWEI',
        parents: {
            fatherName: 'David Li',
            fatherPhone: '139-1111-2222',
            motherName: 'Susan Wang',
            motherPhone: '139-3333-4444',
            emergencyContact: '139-1111-2222'
        },
        image: 'https://i.pravatar.cc/150?u=alex'
    },
    {
        id: 'stu-2',
        name: 'Bella Zhang',
        gender: 'F',
        dob: '2019-08-20',
        assignedClass: 'K1',
        status: StudentStatus.SICK,
        studentCategory: 'STAFF',
        parents: {
            fatherName: 'Tom Zhang',
            fatherPhone: '137-5555-6666',
            motherName: 'Linda Liu',
            motherPhone: '137-7777-8888',
            emergencyContact: '137-7777-8888'
        },
        image: 'https://i.pravatar.cc/150?u=bella',
        absenceReason: 'High fever and flu symptoms'
    },
    {
        id: 'stu-3',
        name: 'Charlie Chen',
        gender: 'M',
        dob: '2020-02-10',
        assignedClass: 'PreK1',
        status: StudentStatus.PRESENT,
        studentCategory: 'REGULAR',
        parents: {
            fatherName: 'Jack Chen',
            fatherPhone: '136-8888-9999',
            motherName: 'Rose Wu',
            motherPhone: '136-6666-7777',
            emergencyContact: '136-8888-9999'
        },
        image: 'https://i.pravatar.cc/150?u=charlie'
    }
];

export const INITIAL_VENUES: Venue[] = [
  { id: 'v-1', name: '感统教室 (Sensory Room)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-2', name: '美术教室 (Art Room)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-3', name: '音乐教室 (Music Room)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-4', name: '紫色操场 (Purple Playground)', capacity: 2, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-5', name: '室外操场 (Outdoor Playground)', capacity: 3, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-6', name: '清澜公园 (Tsinglan Park)', capacity: 2, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-7', name: '体育馆 (Gym)', capacity: 2, openTime: '08:00', closeTime: '20:00' },
  { id: 'v-8', name: '乐高教室 (Lego Room)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-9', name: '启超楼乐高区 (Qichao Lego Area)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-10', name: '室外积木区 (Outdoor Blocks)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-11', name: '国旗大道 (Flag Avenue)', capacity: 2, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-12', name: '沙池 (Sand Pit)', capacity: 2, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-13', name: '游泳池 (Swimming Pool)', capacity: 1, openTime: '09:00', closeTime: '16:00' },
  { id: 'v-14', name: '图书馆 (Library)', capacity: 2, openTime: '08:00', closeTime: '17:30' },
  { id: 'v-15', name: '玻璃房 (Glass Room)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-16', name: '小剧场 (Little Theater)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
  { id: 'v-17', name: '元任楼会议室 (Yuanren Conference)', capacity: 1, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-18', name: '母婴室 (Nursing Room)', capacity: 1, openTime: '08:00', closeTime: '18:00' },
  { id: 'v-19', name: '室内积木室 (Indoor Blocks)', capacity: 1, openTime: '08:00', closeTime: '17:00' },
];

export const INITIAL_WEEKLY_REPORT: WeeklyReport = {
    id: 'report-1',
    weekLabel: 'WEEK 16',
    monthLabel: 'DEC',
    dateRangeLabel: '12/12 - 12/16',
    yearLabel: '2025',
    themeColor: 'RED',
    mondayDate: new Date().toISOString(), // Default to current week
    content: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
        notes: ''
    },
    linkedEventIds: ['evt-1', 'evt-2'] // Links initial events
};