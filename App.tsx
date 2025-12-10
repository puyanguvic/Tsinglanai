






import React, { useState, useRef, useMemo, useEffect } from 'react';
import { INITIAL_INVENTORY, INITIAL_REQUESTS, APPROVAL_LIMITS, CLASSES, INITIAL_EVENTS, INITIAL_CLASS_CONSUMPTION, TRACKED_ITEMS, NON_TEACHING_DEPTS, INITIAL_NOTIFICATIONS, INITIAL_TEACHERS, INITIAL_STUDENTS, INITIAL_FIXED_ASSETS, INITIAL_VENUES, INITIAL_WEEKLY_REPORT } from './constants';
import { InventoryItem, PurchaseRequest, RequestStatus, Role, ChartData, CalendarEvent, ClassConsumption, Notification, Teacher, Student, FixedAsset, AnnualSpend, Contract, SchoolFile, TrashItem, TrashType, Venue, WeeklyReport, TeacherStatus, StudentStatus, AttendanceRecord } from './types';
import Layout from './components/Layout';
import CyberCard from './components/CyberCard';
import InventoryView from './components/InventoryView';
import ItemDetailModal from './components/ItemDetailModal';
import RequisitionForm from './components/RequisitionForm';
import CalendarView from './components/CalendarView';
import ConsumptionEditor from './components/ConsumptionEditor';
import { StatsCharts } from './components/StatsCharts';
import SpendDetailModal from './components/SpendDetailModal';
import NotificationBanner from './components/NotificationBanner';
import TeacherManager from './components/TeacherManager';
import StudentManager from './components/StudentManager';
import FixedAssetManager from './components/FixedAssetManager';
import TeacherAssetView from './components/TeacherAssetView';
import TeacherStudentView from './components/TeacherStudentView';
import RequestDetailModal from './components/RequestDetailModal';
import TransferApprovalModal from './components/TransferApprovalModal';
import SchoolArchives from './components/SchoolArchives';
import RecycleBin from './components/RecycleBin';
import WeeklyNewsletter from './components/WeeklyNewsletter'; 
import AttendanceModal from './components/AttendanceModal'; // Import
import { mockScanInvoice, analyzeMeetingMinutes } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const DEPT_DATA: ChartData[] = [
  { name: 'Arts', value: 2400 },
  { name: 'Science', value: 1398 },
  { name: 'Tech', value: 9800 },
  { name: 'General', value: 3908 },
];

function App() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  
  // Dynamic Passwords
  const [appAccessPassword, setAppAccessPassword] = useState(() => localStorage.getItem('app_pass') || 'Tsinglandai001');
  const [adminAccessPassword, setAdminAccessPassword] = useState(() => localStorage.getItem('admin_pass') || '170815');

  // State
  const [role, setRole] = useState<Role>(Role.TEACHER);
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Date State for Dashboard Views
  const [dashboardDate, setDashboardDate] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [requests, setRequests] = useState<PurchaseRequest[]>(INITIAL_REQUESTS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [classConsumption, setClassConsumption] = useState<ClassConsumption[]>(INITIAL_CLASS_CONSUMPTION);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  // New State for User Management
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  // New State for Fixed Assets
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(INITIAL_FIXED_ASSETS);
  
  // State for Venues
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  
  // State for Weekly Report
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>(INITIAL_WEEKLY_REPORT);
  
  // Attendance State
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceTarget, setAttendanceTarget] = useState<{ user: any, role: 'TEACHER' | 'STUDENT' } | null>(null);
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceTab, setAttendanceTab] = useState<'TEACHER' | 'STUDENT'>('TEACHER');
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<{id: string, name: string, role: string} | null>(null);

  // --- ARCHIVE STATE ---
  const [contracts, setContracts] = useState<Contract[]>([
      { 
          id: 'TLPS20250101001', 
          name: 'Canteen Food Supply (Example)', 
          category: 'SERVICE', 
          amount: 500000, 
          counterparty: 'FreshFoods Ltd', 
          summary: 'Annual supply of organic vegetables', 
          department: 'Canteen', 
          handler: 'Admin', 
          creationDate: '2025-01-01', 
          expiryDate: '2025-03-01', // Expiring soon for demo
          signatures: [], 
          status: 'ACTIVE',
          comparisonReport: 'report_v1.pdf',
          contractFile: 'contract_signed.pdf'
      }
  ]);
  const [archiveFiles, setArchiveFiles] = useState<SchoolFile[]>([]);
  
  // --- TRASH STATE ---
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  // State for asset transfer initiation from teacher view
  const [transferAssetId, setTransferAssetId] = useState<string | undefined>(undefined);
  // State for request details modal
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  
  // State for Transfer Approval Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [pendingTransferRequest, setPendingTransferRequest] = useState<PurchaseRequest | null>(null);

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showSpendModal, setShowSpendModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingAnalysis, setMeetingAnalysis] = useState('');
  const [isAnalyzingMeeting, setIsAnalyzingMeeting] = useState(false);

  // Admin Login State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Announcement Creation State
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ message: '', expiresAt: '' });

  // Settings State (Local to App, could be moved to separate component but inline for simplicity)
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAppPass, setNewAppPass] = useState('');

  // --- Supabase Data Loading ---
  useEffect(() => {
    const loadSupabaseData = async () => {
        try {
            // Inventory
            const { data: invData, error: invError } = await supabase.from('inventory').select('*');
            if (invData && invData.length > 0) {
                setInventory(invData);
            } else if (!invError) {
                // If empty, seed initial
                await supabase.from('inventory').insert(INITIAL_INVENTORY);
            }

            // Requests
            const { data: reqData, error: reqError } = await supabase.from('requests').select('*');
            if (reqData && reqData.length > 0) {
                setRequests(reqData);
            } else if (!reqError) {
                await supabase.from('requests').insert(INITIAL_REQUESTS);
            }

            // Teachers
            const { data: tchData, error: tchError } = await supabase.from('teachers').select('*');
            if (tchData && tchData.length > 0) {
                setTeachers(tchData);
            } else if (!tchError) {
                await supabase.from('teachers').insert(INITIAL_TEACHERS);
            }

            // Students
            const { data: stuData, error: stuError } = await supabase.from('students').select('*');
            if (stuData && stuData.length > 0) {
                setStudents(stuData);
            } else if (!stuError) {
                await supabase.from('students').insert(INITIAL_STUDENTS);
            }

            // Fixed Assets
            const { data: astData, error: astError } = await supabase.from('fixed_assets').select('*');
            if (astData && astData.length > 0) {
                setFixedAssets(astData);
            } else if (!astError) {
                await supabase.from('fixed_assets').insert(INITIAL_FIXED_ASSETS);
            }

            // Calendar Events
            const { data: evtData, error: evtError } = await supabase.from('calendar_events').select('*');
            if (evtData && evtData.length > 0) {
                setEvents(evtData);
            }

            // Attendance Logs (New table assumption or local)
            const { data: attData } = await supabase.from('attendance_logs').select('*');
            if (attData && attData.length > 0) setAttendanceLogs(attData);

            // Class Consumption
            const { data: consData, error: consError } = await supabase.from('consumptions').select('*');
            if (consData && consData.length > 0) {
                // Map DB columns to type if necessary, assuming 1:1 for now
                setClassConsumption(consData);
            } else if (!consError) {
                await supabase.from('consumptions').insert(INITIAL_CLASS_CONSUMPTION);
            }

            // Notifications
            const { data: notifData, error: notifError } = await supabase.from('notifications').select('*');
            if (notifData && notifData.length > 0) {
                setNotifications(notifData);
            }
            
            // Weekly Report
             const { data: reportData, error: reportError } = await supabase.from('weekly_report').select('*').single();
            if (reportData) {
                setWeeklyReport(reportData);
            } else if (!reportError) {
                // If table exists but empty, insert initial
                // If table doesn't exist, this fails silently and we use local state
                // await supabase.from('weekly_report').insert(INITIAL_WEEKLY_REPORT);
            }

            // Contracts
            const { data: contData, error: contError } = await supabase.from('contracts').select('*');
            if (contData && contData.length > 0) setContracts(contData);

            // Files
            const { data: fileData, error: fileError } = await supabase.from('school_files').select('*');
            if (fileData && fileData.length > 0) setArchiveFiles(fileData);

            // Trash
            const { data: trashData, error: trashError } = await supabase.from('recycle_bin').select('*');
            if (trashData && trashData.length > 0) setTrashItems(trashData);

        } catch (e) {
            console.error("Supabase load error", e);
            showToast("Failed to load data from server. Using local mode.", "error");
        }
    };

    if (isAuthenticated) {
        loadSupabaseData();
    }
  }, [isAuthenticated]);

  // Derived State
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(i => i.category));
    return ['All', ...Array.from(cats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
  }, [inventory, activeCategory, searchQuery]);

  // --- Logic: Dynamic Averaging (K vs PreK vs Others) ---
  const getAverageConsumptionForClassType = (targetClass: string, targetMonth: string) => {
      // Determine Group
      let groupPrefix = '';
      if (targetClass.startsWith('K')) groupPrefix = 'K';
      else if (targetClass.startsWith('PreK')) groupPrefix = 'PreK';
      else groupPrefix = 'Other'; // For Admins, Property, etc.

      // Filter data by Month first
      const monthlyData = classConsumption.filter(c => c.month === targetMonth);
      
      // Filter data by Group
      const groupData = monthlyData.filter(c => {
          if (groupPrefix === 'K') return c.className.startsWith('K') && !c.className.startsWith('PreK'); // K1, K2...
          if (groupPrefix === 'PreK') return c.className.startsWith('PreK');
          return NON_TEACHING_DEPTS.includes(c.className);
      });

      if (groupData.length === 0) return { averages: {}, label: 'No Data' };

      // Calculate Averages
      const totals: {[key: string]: number} = {};
      const counts: {[key: string]: number} = {};

      groupData.forEach(cls => {
          Object.entries(cls.items).forEach(([item, val]) => {
              totals[item] = (totals[item] || 0) + (val as number);
              counts[item] = (counts[item] || 0) + 1;
          });
      });
      
      const avgs: {[key: string]: number} = {};
      const numClassesInGroup = groupData.length;
      
      Object.keys(totals).forEach((item) => {
          avgs[item] = Math.round(totals[item] / numClassesInGroup);
      });
      
      return { averages: avgs, label: `${groupPrefix === 'Other' ? 'Dept' : groupPrefix + '-Level'} Average` };
  };

  // Logic: Generate Chart Data for the specific Selected Class and Month
  const classChartData = useMemo(() => {
      const classRecord = classConsumption.find(c => c.className === selectedClass && c.month === dashboardDate);
      const { averages, label } = getAverageConsumptionForClassType(selectedClass, dashboardDate);
      
      if (!classRecord) return { data: [], label: label || 'Average' };

      const data = Object.keys(classRecord.items).map(item => ({
          name: item,
          value: classRecord.items[item] || 0, // My Class
          uv: averages ? (averages[item] || 0) : 0 // Group Avg
      }));
      
      return { data, label };
  }, [classConsumption, selectedClass, dashboardDate]);

  // Logic: Auto-Generate Birthday Events for Teachers
  const birthdayEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return teachers.map(t => {
        if (!t.dob) return null;
        const dob = new Date(t.dob);
        // Create event for current year
        const start = new Date(currentYear, dob.getMonth(), dob.getDate());
        return {
            id: `bday-${t.id}`,
            title: `🎂 ${t.name}'s Birthday`,
            type: 'ACTIVITY', // Using activity type for purple color
            start: start.toISOString(),
            end: start.toISOString(),
            target: 'ALL',
            description: 'Happy Birthday!',
            isCompleted: false
        } as CalendarEvent;
    }).filter(Boolean) as CalendarEvent[];
  }, [teachers]);

  // Combine standard events with birthday events
  const allEvents = useMemo(() => [...events, ...birthdayEvents], [events, birthdayEvents]);

  // --- Logic: Financial Metrics Calculation ---
  const { currentMonthSpend, lastMonthSpend, annualSpendData, totalFixedAssetsValue } = useMemo(() => {
    const now = new Date();
    const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthD = new Date();
    lastMonthD.setMonth(lastMonthD.getMonth() - 1);
    const lastMonthStr = `${lastMonthD.getFullYear()}-${String(lastMonthD.getMonth() + 1).padStart(2, '0')}`;

    // 1. Calculate Monthly Spend (Current & Last)
    // Source: Newly Added Fixed Assets + New Inventory (via Requests or direct add that resulted in stock)
    // Simplified: Sum of all Requests that are STOCKED/ORDERED or FixedAssets added in that month.
    
    // Helper to get total of requests for a specific month string
    const getRequestTotalForMonth = (monthStr: string) => {
        return requests
            .filter(r => {
                const rDate = new Date(r.timestamp);
                const rMonth = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`;
                return rMonth === monthStr && (r.status === RequestStatus.ORDERED || r.status === RequestStatus.STOCKED || r.status === RequestStatus.APPROVED);
            })
            .reduce((acc, r) => acc + r.totalAmount, 0);
    };

    const currentMonthSpendVal = getRequestTotalForMonth(curMonthStr);
    const lastMonthSpendVal = getRequestTotalForMonth(lastMonthStr);

    // 2. Total Fixed Asset Value
    const totalFA = fixedAssets.reduce((acc, asset) => acc + asset.price, 0);

    // 3. Annual Spending Trend (Derived from Consumption History)
    // Group classConsumption by month and calculate total value
    const spendByMonthMap = new Map<string, number>();
    
    classConsumption.forEach(record => {
        let monthTotal = spendByMonthMap.get(record.month) || 0;
        Object.entries(record.items).forEach(([itemName, qty]) => {
             const item = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(i.name.toLowerCase()));
             const price = item ? item.price : 0;
             monthTotal += (qty as number) * price;
        });
        spendByMonthMap.set(record.month, monthTotal);
    });

    // Convert map to AnnualSpend array and sort
    const annualData: AnnualSpend[] = Array.from(spendByMonthMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month)); // Sort YYYY-MM

    // Format month labels for chart (YYYY-MM -> MMM)
    const formattedAnnualData = annualData.map(d => {
        const [y, m] = d.month.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
        return {
            month: date.toLocaleString('default', { month: 'short' }),
            amount: d.amount
        };
    });

    return { 
        currentMonthSpend: currentMonthSpendVal, 
        lastMonthSpend: lastMonthSpendVal,
        annualSpendData: formattedAnnualData,
        totalFixedAssetsValue: totalFA
    };
  }, [requests, fixedAssets, classConsumption, inventory]);


  const topSpenders = useMemo(() => {
     // Helper function for top 3 spenders logic (based on Current Viewing Month dashboardDate)
     const getClassSpend = (cls: ClassConsumption) => {
        let total = 0;
        Object.entries(cls.items).forEach(([itemName, qty]) => {
             const item = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(i.name.toLowerCase()));
             const price = item ? item.price : 0;
             total += (qty as number) * price;
        });
        return total;
    };

    const sortedClasses = classConsumption
        .filter(c => c.month === dashboardDate)
        .map(c => ({ name: c.className, value: getClassSpend(c) }))
        .sort((a, b) => b.value - a.value);
    
    return sortedClasses.slice(0, 3);
  }, [classConsumption, dashboardDate, inventory]);


  // Derived: Active Notifications
  const activeNotifications = useMemo(() => {
      const now = new Date();
      return notifications.filter(n => new Date(n.expiresAt) > now);
  }, [notifications]);

  // Effect: Check for new tasks when switching to Teacher role or changing class
  useEffect(() => {
      if (role === Role.TEACHER) {
          const pendingMandatoryTasks = events.filter(e => {
              const isForMyClass = e.target === 'CLASS' && e.targetId === selectedClass;
              const isForAll = e.target === 'ALL';
              const isMandatory = e.isMandatory;
              const isNotDone = !e.isCompleted;
              return (isForMyClass || isForAll) && isMandatory && isNotDone;
          });

          if (pendingMandatoryTasks.length > 0) {
              showToast(`You have ${pendingMandatoryTasks.length} pending mandatory tasks!`, 'error');
          }
      }
  }, [role, selectedClass, events]);
  
  // Effect: Check for Expiries (2 months ahead)
  useEffect(() => {
      if (role === Role.ADMIN) {
          const now = new Date();
          const twoMonthsLater = new Date();
          twoMonthsLater.setMonth(now.getMonth() + 2);
          
          // Check Contracts for SERVICE type expiry
          contracts.forEach(c => {
              if (c.expiryDate && c.category === 'SERVICE') {
                  const exp = new Date(c.expiryDate);
                  // Check if expiring between now and 2 months later
                  if (exp > now && exp <= twoMonthsLater) {
                      // Avoid duplicate notifications
                      if (!notifications.some(n => n.relatedDocId === c.id)) {
                          handleAddNotification({
                              message: `服务合同即将到期 (Service Contract Expiring): ${c.name} (${c.id}) - ${c.expiryDate}`,
                              target: 'ALL', // Admin focused
                              expiresAt: c.expiryDate,
                              relatedDocId: c.id
                          });
                      }
                  }
              }
          });
          
          // Check Teachers Visa
          teachers.forEach(t => {
              if (t.visaExpiry) {
                  const exp = new Date(t.visaExpiry);
                   if (exp > now && exp <= twoMonthsLater) {
                      if (!notifications.some(n => n.relatedDocId === t.id)) {
                          handleAddNotification({
                              message: `Visa for ${t.name} expiring on ${t.visaExpiry}`,
                              target: 'ALL',
                              expiresAt: t.visaExpiry,
                              relatedDocId: t.id
                          });
                      }
                   }
              }
          });
          
          // Check Files with Expiry
          archiveFiles.forEach(f => {
              if (f.expiryDate) {
                  const exp = new Date(f.expiryDate);
                  if (exp > now && exp <= twoMonthsLater) {
                       if (!notifications.some(n => n.relatedDocId === f.id)) {
                          handleAddNotification({
                              message: `文件即将到期 (File Expiring): ${f.name} - ${f.expiryDate}`,
                              target: 'ALL',
                              expiresAt: f.expiryDate,
                              relatedDocId: f.id
                          });
                      }
                  }
              }
          });
      }
  }, [role, contracts, teachers, archiveFiles, notifications]);


  // Handlers
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({msg, type});
      setTimeout(() => setToast(null), 3000);
  };

  const handleAppLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Use State variable instead of hardcoded string
    if (loginPassword === appAccessPassword) {
      setIsAuthenticated(true);
      showToast('Welcome to Tsinglan Flow', 'success');
    } else {
      showToast('Incorrect Password', 'error');
    }
  };

  const handleSwitchRole = () => {
    if (role === Role.TEACHER) {
        // Switching TO Admin -> Require Password
        setShowAdminLogin(true);
    } else {
        // Switching TO Teacher -> Direct switch
        setRole(Role.TEACHER);
        setActiveTab('dashboard');
    }
  };

  const handleAdminLogin = () => {
      // Use State variable instead of hardcoded string
      if (adminPasswordInput === adminAccessPassword) {
          setRole(Role.ADMIN);
          setActiveTab('dashboard');
          setShowAdminLogin(false);
          setAdminPasswordInput('');
          showToast('Welcome, Administrator', 'success');
      } else {
          showToast('Incorrect Password', 'error');
          setAdminPasswordInput('');
      }
  };

  // --- Password Management Handlers ---
  const handleUpdateAdminPass = () => {
      if(newAdminPass && newAdminPass.length >= 4) {
          setAdminAccessPassword(newAdminPass);
          localStorage.setItem('admin_pass', newAdminPass);
          setNewAdminPass('');
          showToast('Admin password updated!', 'success');
      } else {
          showToast('Password must be at least 4 characters', 'error');
      }
  }

  const handleUpdateAppPass = () => {
      if(newAppPass && newAppPass.length >= 4) {
          setAppAccessPassword(newAppPass);
          localStorage.setItem('app_pass', newAppPass);
          setNewAppPass('');
          showToast('App access password updated!', 'success');
      } else {
          showToast('Password must be at least 4 characters', 'error');
      }
  }


  const openAnnouncementModal = () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setAnnouncementForm({
          message: '',
          expiresAt: nextWeek.toISOString().split('T')[0]
      });
      setShowAnnouncementModal(true);
  };

  const handlePostAnnouncement = async () => {
      if (!announcementForm.message) return;
      await handleAddNotification({
          message: announcementForm.message,
          expiresAt: announcementForm.expiresAt || new Date(Date.now() + 86400000 * 7).toISOString(),
          target: 'ALL'
      });
      setShowAnnouncementModal(false);
  };

  const handleQuickRequisition = (item: InventoryItem) => {
    setActiveTab('requisition');
    showToast(`Drafting request for ${item.name}`);
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleAddItem = () => {
    const newItem: InventoryItem = {
        id: `NEW-${Date.now()}`,
        name: '',
        category: 'General',
        quantity: 0,
        unit: 'pcs',
        price: 0,
        minThreshold: 0,
        image: 'https://picsum.photos/200/200?grayscale',
        description: '',
        location: '',
        stockLogs: []
    };
    setSelectedItem(newItem);
  };

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    // Check if it's a new item or update
    const existingIndex = inventory.findIndex(i => i.id === updatedItem.id);
    const originalQuantity = existingIndex > -1 ? inventory[existingIndex].quantity : 0;
    
    const qtyDelta = updatedItem.quantity - originalQuantity;
    const valueChange = qtyDelta * updatedItem.price;

    // Logic: If value of *added* stock > 1000 AND NOT ADMIN, trigger approval
    // Admins can bypass this check and update inventory directly
    if (role !== Role.ADMIN && qtyDelta > 0 && valueChange > 1000) {
        // Create a Purchase Request instead of updating immediately
        const newRequest: PurchaseRequest = {
            id: `STK-REQ-${Date.now()}`,
            requesterName: 'Admin (Stock Adjustment)',
            itemName: updatedItem.name,
            quantity: qtyDelta,
            unitPrice: updatedItem.price,
            totalAmount: valueChange,
            status: RequestStatus.PENDING_DIRECTOR,
            timestamp: new Date().toISOString(),
            purpose: 'High value stock adjustment/addition',
            aiAnalysis: 'Admin initiated stock update > 1000¥. Requires approval.',
            requestType: 'PURCHASE'
        };
        // Save Request to Supabase
        await supabase.from('requests').insert(newRequest);
        setRequests(prev => [newRequest, ...prev]);
        showToast('Value > 1000¥. Submitted for Approval.', 'success');
        
        // If it was a NEW item creation, we might want to add it to inventory with 0 qty first?
        if (existingIndex === -1) {
             const initItem = { ...updatedItem, quantity: 0, image: updatedItem.image || 'https://picsum.photos/200/200?random=new' };
             await supabase.from('inventory').upsert(initItem);
             setInventory(prev => [...prev, initItem]);
        }
    } else {
        // Value < 1000 or Reducing Stock or Admin -> Update Immediately
        
        // SYNC SPEND LOGIC: If we are adding stock immediately (qtyDelta > 0), record it as a "STOCKED" request
        // so it appears in the Monthly Spend calculation (which sums requests).
        if (qtyDelta > 0) {
             const manualRequest: PurchaseRequest = {
                id: `MANUAL-${Date.now()}`,
                requesterName: role === Role.ADMIN ? 'Admin' : 'Staff',
                itemName: updatedItem.name,
                quantity: qtyDelta,
                unitPrice: updatedItem.price,
                totalAmount: valueChange,
                status: RequestStatus.STOCKED, // Treated as already fulfilled/in-stock
                timestamp: new Date().toISOString(),
                purpose: 'Manual Stock Addition',
                aiAnalysis: 'Auto-logged manual addition.',
                requestType: 'PURCHASE',
                vendor: updatedItem.supplier
            };
            await supabase.from('requests').insert(manualRequest);
            setRequests(prev => [manualRequest, ...prev]);
        }

        const finalItem = existingIndex > -1 
            ? updatedItem 
            : { ...updatedItem, image: updatedItem.image || 'https://picsum.photos/200/200?random=new' };

        await supabase.from('inventory').upsert(finalItem);
        setInventory(prev => {
            if (existingIndex > -1) {
                return prev.map(item => item.id === updatedItem.id ? updatedItem : item);
            } else {
                return [...prev, finalItem];
            }
        });
        showToast(existingIndex === -1 ? 'Item Created Successfully' : 'Stock Updated Successfully', 'success');
    }
    
    setSelectedItem(null); 
  };

  const handleSaveTeacher = async (teacher: Teacher) => {
      await supabase.from('teachers').upsert(teacher);
      setTeachers(prev => {
          const exists = prev.find(t => t.id === teacher.id);
          if (exists) {
              return prev.map(t => t.id === teacher.id ? teacher : t);
          }
          return [...prev, teacher];
      });
      showToast('Teacher Profile Saved', 'success');
  };

  const handleSaveStudent = async (student: Student) => {
      await supabase.from('students').upsert(student);
      setStudents(prev => {
          const exists = prev.find(s => s.id === student.id);
          if (exists) {
              return prev.map(s => s.id === student.id ? student : s);
          }
          return [...prev, student];
      });
      showToast('Student Profile Saved', 'success');
  };
  
  const handleSaveFixedAsset = async (asset: FixedAsset) => {
      await supabase.from('fixed_assets').upsert(asset);
      setFixedAssets(prev => {
          const exists = prev.find(a => a.id === asset.id);
          if (exists) {
              return prev.map(a => a.id === asset.id ? asset : a);
          }
          return [...prev, asset];
      });
      showToast('Fixed Asset Saved', 'success');
  };
  
  const handleSaveVenue = async (venue: Venue) => {
      // Assuming we'd upsert to a venues table, simulating here
      // await supabase.from('venues').upsert(venue);
      setVenues(prev => {
          const exists = prev.find(v => v.id === venue.id);
          if (exists) {
              return prev.map(v => v.id === venue.id ? venue : v);
          }
          return [...prev, venue];
      });
      showToast('Venue Updated', 'success');
  }
  
  const handleDeleteVenue = async (id: string) => {
      // await supabase.from('venues').delete().match({ id });
      setVenues(prev => prev.filter(v => v.id !== id));
      showToast('Venue Deleted', 'success');
  }
  
  const handleSaveWeeklyReport = async (report: WeeklyReport) => {
      await supabase.from('weekly_report').upsert(report);
      setWeeklyReport(report);
      showToast('Weekly Newsletter Updated');
  }

  // --- Logic: Procurement & Approval ---
  const handleSubmitRequisition = async (formData: any) => {
      const total = formData.quantity * formData.unitPrice; 
      let status = RequestStatus.PENDING_DIRECTOR;
      let analysis = 'Sent to pending for approval.';

      if (total >= APPROVAL_LIMITS.DIRECTOR_LIMIT) {
          status = RequestStatus.PENDING_FULL_CHAIN;
          analysis = 'Amount ≥ 5000. Requires Full Chain Approval.';
      } else {
          status = RequestStatus.PENDING_DIRECTOR;
          analysis = 'Application successful. Awaiting Director Approval.';
      }

      const isNonTeaching = NON_TEACHING_DEPTS.includes(selectedClass);
      const requesterSuffix = isNonTeaching ? 'Staff' : 'Teacher';

      const newRequest: PurchaseRequest = {
          id: `REQ-${Date.now()}`,
          requesterName: `${selectedClass} ${requesterSuffix}`,
          itemName: formData.itemName,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice,
          totalAmount: total,
          status: status,
          timestamp: new Date().toISOString(),
          vendor: formData.vendor,
          purpose: formData.purpose,
          note: formData.note,
          urgent: formData.urgent,
          aiAnalysis: analysis,
          // Fixed Asset Props
          isFixedAsset: formData.isFixedAsset,
          requestType: formData.requestType,
          fixedAssetId: formData.fixedAssetId,
          // Scrap Props
          scrapReason: formData.scrapReason,
          scrapImage: formData.scrapImage
      };

      await supabase.from('requests').insert(newRequest);
      setRequests(prev => [newRequest, ...prev]);

      showToast(`Application Successful! Sent to Pending.`, 'success');
      
      if (transferAssetId) setTransferAssetId(undefined);
  };
  
  const handleTeacherScrapRequest = async (asset: FixedAsset, reason: string, image?: string) => {
      const newRequest: PurchaseRequest = {
          id: `SCRAP-${Date.now()}`,
          requesterName: `${selectedClass} Teacher`,
          itemName: asset.name,
          quantity: 1,
          unitPrice: asset.price,
          totalAmount: asset.price,
          status: RequestStatus.PENDING_DIRECTOR,
          timestamp: new Date().toISOString(),
          purpose: reason,
          aiAnalysis: 'Asset Scrap Request. Requires Approval.',
          requestType: 'SCRAP',
          fixedAssetId: asset.id,
          scrapReason: reason,
          scrapImage: image
      };
      await supabase.from('requests').insert(newRequest);
      setRequests(prev => [newRequest, ...prev]);
      showToast('Report submitted for approval', 'success');
  };

  const handleAutoStock = async (req: PurchaseRequest) => {
     if (req.isFixedAsset && req.requestType === 'PURCHASE') {
         const newAsset: FixedAsset = {
             id: `FA-${Date.now()}`,
             name: req.itemName,
             price: req.unitPrice,
             location: 'Inventory / Unassigned',
             category: 'Procured Asset',
             status: 'Active',
             purchaseDate: new Date().toISOString().split('T')[0],
             image: 'https://picsum.photos/200/200?random=fa'
         };
         await supabase.from('fixed_assets').insert(newAsset);
         setFixedAssets(prev => [...prev, newAsset]);
         return;
     }

     // Inventory Logic
     // Fetch current item to ensure latest
     const existing = inventory.find(i => i.name.toLowerCase() === req.itemName.toLowerCase());
     
     if (existing) {
         const updated = { ...existing, quantity: existing.quantity + req.quantity };
         await supabase.from('inventory').upsert(updated);
         setInventory(prev => prev.map(i => i.id === existing.id ? updated : i));
     } else {
         const newItem = {
             id: `AUTO-${Date.now()}`,
             name: req.itemName,
             category: 'New Procurement',
             quantity: req.quantity,
             unit: 'units',
             price: req.unitPrice,
             minThreshold: 5,
             image: 'https://picsum.photos/200/200?grayscale',
             description: req.purpose,
             supplier: req.vendor,
             stockLogs: []
         };
         await supabase.from('inventory').insert(newItem);
         setInventory(prev => [...prev, newItem]);
     }
  };

  // Helper to commit approval with optional location override for transfers
  const performApproval = async (req: PurchaseRequest, newLocation?: string) => {
      const updatedReq = { ...req, status: RequestStatus.APPROVED };
      await supabase.from('requests').upsert(updatedReq);
      setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
      
      if (req.requestType === 'TRANSFER' && req.fixedAssetId && newLocation) {
          const asset = fixedAssets.find(a => a.id === req.fixedAssetId);
          if (asset) {
              const updatedAsset = { ...asset, location: newLocation };
              await supabase.from('fixed_assets').upsert(updatedAsset);
              setFixedAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
              
              handleAddNotification({
                  message: `Property Alert: Asset "${req.itemName}" transferred to ${newLocation}. Approved by Admin.`,
                  target: 'CLASS',
                  targetId: 'Property',
                  expiresAt: new Date(Date.now() + 86400000 * 3).toISOString()
              });
              
              showToast(`Transfer Approved. Location updated to ${newLocation}.`);
          }
      } 
      else if (req.requestType === 'SCRAP' && req.fixedAssetId) {
          const asset = fixedAssets.find(a => a.id === req.fixedAssetId);
          if (asset) {
              const trashItem: TrashItem = {
                  id: asset.id,
                  originalData: asset,
                  type: TrashType.ASSET,
                  deletedAt: new Date().toISOString(),
                  name: asset.name
              };
              // Save to Trash, Delete from Active
              await supabase.from('recycle_bin').insert(trashItem);
              await supabase.from('fixed_assets').delete().match({id: asset.id});

              setTrashItems(prev => [trashItem, ...prev]);
              setFixedAssets(prev => prev.filter(a => a.id !== asset.id));
              
              handleAddNotification({
                  message: `Property Alert: Asset "${req.itemName}" scraped and moved to Recycle Bin.`,
                  target: 'CLASS',
                  targetId: 'Property',
                  expiresAt: new Date(Date.now() + 86400000 * 3).toISOString()
              });
              showToast('Scrap Approved. Asset moved to Trash.');
          }
      }
      else {
          showToast('Approved. Moved to Purchasing.');
      }
  };

  const handleApprove = (id: string) => {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      
      if (req.requestType === 'TRANSFER') {
          setPendingTransferRequest(req);
          setTransferModalOpen(true);
      } else {
          performApproval(req);
      }
  };
  
  const handleConfirmTransfer = (newLocation: string) => {
      if (pendingTransferRequest) {
          performApproval(pendingTransferRequest, newLocation);
          setTransferModalOpen(false);
          setPendingTransferRequest(null);
      }
  };

  const handleGeneratePO = async (id: string) => {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      
      const updatedReq = { ...req, status: RequestStatus.ORDERED };
      await supabase.from('requests').upsert(updatedReq);
      setRequests(prev => prev.map(r => r.id === id ? updatedReq : r));
      showToast('Purchase Order Generated. Waiting for Delivery.');
  };

  const handleReceiveStock = async (id: string) => {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      
      const updatedReq = { ...req, status: RequestStatus.STOCKED };
      await supabase.from('requests').upsert(updatedReq);
      setRequests(prev => prev.map(r => r.id === id ? updatedReq : r));
      
      await handleAutoStock(req);
      
      if (req.isFixedAsset) {
          showToast('Asset Registered in Fixed Assets List', 'success');
          setActiveTab('fixed-assets');
      } else {
          showToast('Items Received & Added to Inventory', 'success');
          setActiveTab('inventory');
      }
  };

  // --- Logic: Calendar & Tasks ---
  const handleAddEvent = async (event: Partial<CalendarEvent>) => {
      const newEvent = { 
          ...event, 
          id: `evt-${Date.now()}`,
          ownerId: role === Role.TEACHER ? selectedClass : 'ADMIN',
      } as CalendarEvent;
      
      await supabase.from('calendar_events').insert(newEvent);
      setEvents(prev => [...prev, newEvent]);
      showToast('Event Added');
  };
  
  const handleUpdateEvent = async (event: CalendarEvent) => {
      await supabase.from('calendar_events').upsert(event);
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      showToast('Event Updated');
  };

  const handleAddNotification = async (note: Partial<Notification>) => {
      const newNote = {
          ...note,
          id: `notif-${Date.now()}`,
          createdBy: 'Admin',
          createdAt: new Date().toISOString()
      } as Notification;
      await supabase.from('notifications').insert(newNote);
      setNotifications(prev => [newNote, ...prev]);
      showToast('Notification Sent');
  };

  const handleUpdateNotification = async (id: string, newMessage: string) => {
      await supabase.from('notifications').update({ message: newMessage }).match({ id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, message: newMessage } : n));
      showToast('Notification Updated');
  };

  const handleDeleteNotification = async (id: string) => {
      await supabase.from('notifications').delete().match({ id });
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification Deleted');
  };

  const handleDeleteEvent = async (id: string) => {
      await supabase.from('calendar_events').delete().match({ id });
      setEvents(prev => prev.filter(e => e.id !== id));
      showToast('Event Deleted');
  }

  const handleToggleEventCompletion = async (id: string) => {
      const evt = events.find(e => e.id === id);
      if (!evt) return;
      const updated = { ...evt, isCompleted: !evt.isCompleted };
      await supabase.from('calendar_events').upsert(updated);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
  };

  const handleSaveConsumption = async (newConsumptionData: ClassConsumption[]) => {
      // Logic for saving consumption and updating inventory is complex (diffing).
      // For simplicity in this demo, we assume the backend/Supabase saves the record
      // and we perform the inventory adjustment locally then sync.
      
      const newInventory = [...inventory];
      const oldMap = new Map<string, number>();
      classConsumption.forEach(c => {
          Object.entries(c.items).forEach(([item, qty]) => {
              oldMap.set(`${c.className}-${c.month}-${item}`, qty as number);
          });
      });

      newConsumptionData.forEach(c => {
          Object.entries(c.items).forEach(([itemName, newQty]) => {
              const key = `${c.className}-${c.month}-${itemName}`;
              const oldQty = oldMap.get(key) || 0;
              const delta = (newQty as number) - oldQty;

              if (delta !== 0) {
                   const invItemIndex = newInventory.findIndex(i => i.name === itemName);
                   if (invItemIndex > -1) {
                        newInventory[invItemIndex].quantity -= delta;
                        if (newInventory[invItemIndex].quantity < 0) newInventory[invItemIndex].quantity = 0;
                   }
              }
          });
      });

      // Save Consumption Records
      for (const rec of newConsumptionData) {
          // Check if exists logic omitted for brevity, Supabase upsert works if we had PK
          // Assuming upsert based on composite key or managing ID inside ConsumptionEditor
          // For now, we delete for this month/class and insert.
          await supabase.from('consumptions').delete().match({ className: rec.className, month: rec.month });
          await supabase.from('consumptions').insert(rec);
      }

      // Update Inventory Levels
      for (const item of newInventory) {
          await supabase.from('inventory').upsert(item);
      }

      setInventory(newInventory);
      setClassConsumption(newConsumptionData);
      showToast("Consumption Data Updated & Inventory Synced");
  };

  const handleMeetingAnalyze = async () => {
      if(!meetingNotes.trim()) return;
      setIsAnalyzingMeeting(true);
      const result = await analyzeMeetingMinutes(meetingNotes);
      setMeetingAnalysis(result);
      setIsAnalyzingMeeting(false);
  }

  const handleTeacherTransferInit = (asset: FixedAsset) => {
      setTransferAssetId(asset.id);
      setActiveTab('requisition');
  }

  // --- TRASH & DELETE LOGIC ---
  
  const moveToTrash = async (id: string, type: TrashType, name: string, listSetter: React.Dispatch<React.SetStateAction<any[]>>, tableName: string) => {
      // Find item
      let item: any;
      if (type === TrashType.CONTRACT) item = contracts.find(x => x.id === id);
      else if (type === TrashType.FILE) item = archiveFiles.find(x => x.id === id);
      else if (type === TrashType.STUDENT) item = students.find(x => x.id === id);
      else if (type === TrashType.TEACHER) item = teachers.find(x => x.id === id);
      else if (type === TrashType.ASSET) item = fixedAssets.find(x => x.id === id);
      else if (type === TrashType.INVENTORY_ITEM) item = inventory.find(x => x.id === id);

      if (item) {
          const trashItem: TrashItem = {
              id: item.id,
              originalData: item,
              type: type,
              deletedAt: new Date().toISOString(),
              name: name
          };
          
          await supabase.from('recycle_bin').insert(trashItem);
          await supabase.from(tableName).delete().match({ id });

          setTrashItems(current => [trashItem, ...current]);
          listSetter(prev => prev.filter((i: any) => i.id !== id));
      }
  };

  const handleDeleteContract = (id: string) => {
      const c = contracts.find(i => i.id === id);
      moveToTrash(id, TrashType.CONTRACT, c?.name || 'Contract', setContracts, 'contracts');
      showToast('Moved to Recycle Bin');
  }

  const handleDeleteSchoolFile = (id: string) => {
      const f = archiveFiles.find(i => i.id === id);
      moveToTrash(id, TrashType.FILE, f?.name || 'File', setArchiveFiles, 'school_files');
      showToast('Moved to Recycle Bin');
  }

  const handleDeleteStudent = (id: string) => {
      const s = students.find(i => i.id === id);
      moveToTrash(id, TrashType.STUDENT, s?.name || 'Student', setStudents, 'students');
      showToast('Moved to Recycle Bin');
  };

  const handleDeleteTeacher = (id: string) => {
      const t = teachers.find(i => i.id === id);
      moveToTrash(id, TrashType.TEACHER, t?.name || 'Teacher', setTeachers, 'teachers');
      showToast('Moved to Recycle Bin');
  };
  
  // For Inventory Deletion (Only manual delete, not consumption)
  const handleDeleteInventoryItem = (id: string) => {
      const i = inventory.find(item => item.id === id);
      moveToTrash(id, TrashType.INVENTORY_ITEM, i?.name || 'Item', setInventory, 'inventory');
  };

  const handleRestoreItem = async (item: TrashItem) => {
      // Delete from Trash
      await supabase.from('recycle_bin').delete().match({ id: item.id });
      setTrashItems(prev => prev.filter(i => i.id !== item.id));

      // Re-insert into original table
      switch (item.type) {
          case TrashType.CONTRACT:
              await supabase.from('contracts').insert(item.originalData);
              setContracts(prev => [...prev, item.originalData]);
              break;
          case TrashType.FILE:
              await supabase.from('school_files').insert(item.originalData);
              setArchiveFiles(prev => [...prev, item.originalData]);
              break;
          case TrashType.STUDENT:
              await supabase.from('students').insert(item.originalData);
              setStudents(prev => [...prev, item.originalData]);
              break;
          case TrashType.TEACHER:
              await supabase.from('teachers').insert(item.originalData);
              setTeachers(prev => [...prev, item.originalData]);
              break;
          case TrashType.ASSET:
              await supabase.from('fixed_assets').insert(item.originalData);
              setFixedAssets(prev => [...prev, item.originalData]);
              break;
          case TrashType.INVENTORY_ITEM:
              await supabase.from('inventory').insert(item.originalData);
              setInventory(prev => [...prev, item.originalData]);
              break;
      }
      showToast('Item Restored');
  };

  const handlePermanentDelete = async (id: string) => {
      await supabase.from('recycle_bin').delete().match({ id });
      setTrashItems(prev => prev.filter(i => i.id !== id));
      showToast('Permanently Deleted');
  };

  // --- ATTENDANCE LOGIC ---
  const handleAttendanceClick = (user: Teacher | Student, userRole: 'TEACHER' | 'STUDENT') => {
      setAttendanceTarget({ user, role: userRole });
      setShowAttendanceModal(true);
  };

  const handleAttendanceSubmit = async (status: string, note?: string) => {
      if (!attendanceTarget) return;

      const { user, role } = attendanceTarget;
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      // Determine Late Status for Teacher (Using custom start time if set)
      let isLate = false;
      let finalStatus = status;

      if (role === 'TEACHER' && (status === TeacherStatus.ACTIVE || status === TeacherStatus.LATE)) {
           // Teacher specific start time (default 08:00)
           const startTime = (user as Teacher).workStartTime || '08:00';
           
           // Simple Late Check
           // convert timeString "HH:mm" to minutes
           const [nowH, nowM] = timeString.split(':').map(Number);
           const nowMinutes = nowH * 60 + nowM;
           
           const [startH, startM] = startTime.split(':').map(Number);
           const startMinutes = startH * 60 + startM;

           if (nowMinutes > startMinutes) {
               isLate = true;
               finalStatus = TeacherStatus.LATE;
           } else {
               finalStatus = TeacherStatus.ACTIVE;
           }
      }

      // If other status selected (Sick, Leave), treat as Leave - user selected explicitly

      // 1. Update User State
      if (role === 'TEACHER') {
          const updatedTeacher = { ...user, status: finalStatus };
          await supabase.from('teachers').upsert(updatedTeacher);
          setTeachers(prev => prev.map(t => t.id === user.id ? updatedTeacher : t));
      } else {
          const updatedStudent = { ...user, status: finalStatus, absenceReason: note };
          await supabase.from('students').upsert(updatedStudent);
          setStudents(prev => prev.map(s => s.id === user.id ? updatedStudent : s));
      }

      // 2. Create Log
      const logEntry: AttendanceRecord = {
          id: `log-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userRole: role,
          date: now.toISOString(),
          time: timeString,
          status: finalStatus,
          isLate: isLate,
          note: note
      };

      await supabase.from('attendance_logs').insert(logEntry);
      setAttendanceLogs(prev => [logEntry, ...prev]);

      setShowAttendanceModal(false);
      setAttendanceTarget(null);
      showToast(`${user.name} checked in: ${finalStatus}`, isLate ? 'error' : 'success');
  };

  // --- Views ---
  const renderTeacherDashboard = () => {
    const classTeachers = teachers.filter(t => t.assignedClass === selectedClass);
    const classStudents = students.filter(s => s.assignedClass === selectedClass);
    
    return (
      <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-3xl font-bold text-black tracking-tight">{selectedClass} Dashboard</h2>
                <p className="text-sm text-gray-500">Overview for {dashboardDate}</p>
             </div>
             <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
                 <input 
                    type="month" 
                    value={dashboardDate} 
                    onChange={(e) => setDashboardDate(e.target.value)}
                    className="text-sm font-bold bg-transparent outline-none px-2 py-1"
                 />
             </div>
          </div>

          <NotificationBanner notifications={activeNotifications} />
          
          {/* Weekly Newsletter - Read Only for Teachers */}
          <WeeklyNewsletter 
              report={weeklyReport} 
              events={allEvents} 
              isEditable={false} 
          />

          {/* Responsive height for chart container */}
          <div className="h-auto lg:h-96 bg-white p-6 rounded-2xl shadow-ios border border-gray-100 overflow-visible">
               <StatsCharts 
                  usageData={classChartData.data} 
                  budgetData={[]} // Not used in this view
                  role={Role.TEACHER}
                  comparisonLabel={classChartData.label}
               />
          </div>

          {/* Class Roster (Teachers & Students) */}
          <CyberCard title={`${selectedClass} People`} className="overflow-visible">
              <div className="space-y-6">
                  {/* Teachers */}
                  <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Teaching Team</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {classTeachers.map(t => (
                              <div 
                                key={t.id} 
                                onClick={() => handleAttendanceClick(t, 'TEACHER')}
                                className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group"
                              >
                                  <div className="relative">
                                      <img src={t.avatar} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt={t.name} />
                                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                          t.status === TeacherStatus.ACTIVE ? 'bg-green-500' : 
                                          t.status === TeacherStatus.LATE ? 'bg-orange-500' : 'bg-red-500'
                                      }`}></div>
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-gray-900 group-hover:text-ios-blue transition-colors">{t.name}</div>
                                      <div className="text-[10px] text-gray-500 font-medium">{t.status}</div>
                                  </div>
                              </div>
                          ))}
                          {classTeachers.length === 0 && <span className="text-sm text-gray-400 italic">No teachers assigned.</span>}
                      </div>
                  </div>
                  
                  {/* Students */}
                  <div>
                      <div className="flex items-center justify-between mb-3">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Students</h4>
                           <div className="flex gap-2">
                               <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">Present: {classStudents.filter(s => s.status === 'Present').length}</span>
                               <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">Absent: {classStudents.filter(s => s.status !== 'Present').length}</span>
                           </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {classStudents.map(s => (
                              <div 
                                key={s.id} 
                                onClick={() => handleAttendanceClick(s, 'STUDENT')}
                                className="group flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                              >
                                  <div className="relative shrink-0">
                                      <img src={s.image} className="w-8 h-8 rounded-full object-cover bg-gray-200" alt={s.name} />
                                       {s.status !== 'Present' && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white flex items-center justify-center text-[8px] rounded-full">!</div>
                                       )}
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                      <div className="text-xs font-bold text-gray-800 truncate group-hover:text-ios-blue">{s.name}</div>
                                      <div className={`text-[10px] truncate ${
                                          s.status === 'Present' ? 'text-green-600' : 'text-red-500 font-bold'
                                      }`}>
                                          {s.status}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {classStudents.length === 0 && <span className="text-sm text-gray-400 italic">No students assigned.</span>}
                      </div>
                  </div>
              </div>
          </CyberCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CyberCard title="My Recent Requests">
                  <div className="space-y-3">
                      {requests.filter(r => r.requesterName.includes(selectedClass)).slice(0, 5).map(req => (
                          <div key={req.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                              <div>
                                  <div className="font-semibold text-sm">{req.itemName}</div>
                                  <div className="text-xs text-gray-400">{new Date(req.timestamp).toLocaleDateString()}</div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-orange-100 text-orange-700'
                              }`}>
                                  {req.status}
                              </span>
                          </div>
                      ))}
                      {requests.filter(r => r.requesterName.includes(selectedClass)).length === 0 && (
                          <p className="text-gray-400 text-sm">No recent requests.</p>
                      )}
                  </div>
              </CyberCard>
              
              <CyberCard title="Upcoming Tasks">
                  <div className="space-y-3">
                       {allEvents.filter(e => !e.isCompleted && (e.target === 'ALL' || (e.target === 'CLASS' && e.targetId === selectedClass))).slice(0,5).map(evt => (
                           <div key={evt.id} className="flex gap-3 items-center">
                               <div className={`w-2 h-2 rounded-full ${evt.type === 'MEETING' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                               <div className="flex-1">
                                   <div className="text-sm font-semibold">{evt.title}</div>
                                   <div className="text-xs text-gray-500">{new Date(evt.start).toLocaleDateString()}</div>
                               </div>
                           </div>
                       ))}
                       {allEvents.filter(e => !e.isCompleted && (e.target === 'ALL' || (e.target === 'CLASS' && e.targetId === selectedClass))).length === 0 && (
                           <p className="text-gray-400 text-sm">No pending tasks.</p>
                       )}
                  </div>
              </CyberCard>
          </div>
      </div>
    );
  };

  const renderAttendanceLogs = () => {
    // If viewing history for specific user
    if (selectedHistoryUser) {
        const userHistory = attendanceLogs.filter(log => log.userId === selectedHistoryUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return (
            <div className="space-y-6">
                <header className="flex items-center gap-4 pb-2">
                    <button onClick={() => setSelectedHistoryUser(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">{selectedHistoryUser.name} History</h2>
                        <p className="text-sm text-gray-500">All attendance records for this {selectedHistoryUser.role.toLowerCase()}</p>
                    </div>
                </header>
                
                <CyberCard className="overflow-hidden" noPadding>
                    <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs">
                             <tr>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Time</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4">Note</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                             {userHistory.map(log => (
                                 <tr key={log.id} className="hover:bg-gray-50/50">
                                     <td className="px-6 py-4 font-mono">{new Date(log.date).toLocaleDateString()}</td>
                                     <td className="px-6 py-4 font-mono">{log.time}</td>
                                     <td className="px-6 py-4">
                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                             log.isLate ? 'bg-red-100 text-red-700' : 
                                             log.status.includes('Active') || log.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                             'bg-orange-100 text-orange-700'
                                         }`}>
                                             {log.isLate ? 'LATE' : log.status}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-gray-500">{log.note}</td>
                                 </tr>
                             ))}
                             {userHistory.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No records found.</td></tr>}
                         </tbody>
                    </table>
                </CyberCard>
            </div>
        );
    }

    // Main View
    const filteredLogs = attendanceLogs.filter(log => {
        const matchesDate = new Date(log.date).toDateString() === new Date(attendanceDateFilter).toDateString();
        const matchesRole = log.userRole === attendanceTab;
        return matchesDate && matchesRole;
    });

    return (
        <div className="space-y-6">
             <header className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2">
                 <div>
                     <h2 className="text-3xl font-bold text-black tracking-tight">Attendance Logs</h2>
                     <p className="text-sm text-gray-500">Daily check-in records for staff and students</p>
                 </div>
                 <div className="flex gap-3">
                     <div className="bg-gray-100 p-1 rounded-xl flex">
                         <button 
                             onClick={() => setAttendanceTab('TEACHER')}
                             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${attendanceTab === 'TEACHER' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                         >
                             Teachers
                         </button>
                         <button 
                             onClick={() => setAttendanceTab('STUDENT')}
                             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${attendanceTab === 'STUDENT' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                         >
                             Students
                         </button>
                     </div>
                     <input 
                        type="date"
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                        value={attendanceDateFilter}
                        onChange={(e) => setAttendanceDateFilter(e.target.value)}
                     />
                 </div>
             </header>

             <CyberCard className="overflow-hidden" noPadding>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs">
                             <tr>
                                 <th className="px-6 py-4">Time</th>
                                 <th className="px-6 py-4">Name</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4">Note</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                             {filteredLogs.length === 0 && (
                                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No records found for this date.</td></tr>
                             )}
                             {filteredLogs.map((log) => (
                                 <tr 
                                    key={log.id} 
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedHistoryUser({ id: log.userId, name: log.userName, role: log.userRole })}
                                    title="Click to view history"
                                 >
                                     <td className="px-6 py-4 text-gray-500 font-mono">
                                         {log.time}
                                     </td>
                                     <td className="px-6 py-4 font-bold text-blue-600 hover:underline">{log.userName}</td>
                                     <td className="px-6 py-4">
                                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                             log.isLate ? 'bg-red-100 text-red-700' : 
                                             log.status.includes('Active') || log.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                             'bg-orange-100 text-orange-700'
                                         }`}>
                                             {log.isLate ? 'LATE' : log.status}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{log.note}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </CyberCard>
        </div>
    );
  };

  const renderMeetings = () => (
      <div className="space-y-6">
           <header>
               <h2 className="text-3xl font-bold text-black tracking-tight">AI Meeting Assistant</h2>
               <p className="text-sm text-gray-500">Record notes and generate summaries/action items</p>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
               <CyberCard className="flex flex-col">
                   <textarea 
                      className="w-full h-full p-4 resize-none outline-none text-gray-700 leading-relaxed"
                      placeholder="Type your meeting notes here..."
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                   ></textarea>
                   <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                       <span className="text-xs text-gray-500">{meetingNotes.length} chars</span>
                       <button 
                          onClick={handleMeetingAnalyze}
                          disabled={isAnalyzingMeeting || !meetingNotes.trim()}
                          className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                       >
                           {isAnalyzingMeeting ? 'Analyzing...' : 'Generate Summary'}
                       </button>
                   </div>
               </CyberCard>
               
               <CyberCard title="AI Analysis Result" className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                   {meetingAnalysis ? (
                       <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                           {meetingAnalysis}
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                           <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                           <p>Analysis will appear here</p>
                       </div>
                   )}
               </CyberCard>
           </div>
      </div>
  );

  const renderHistory = () => (
      <div className="space-y-6">
           <header>
               <h2 className="text-3xl font-bold text-black tracking-tight">Request History</h2>
               <p className="text-sm text-gray-500">Archive of all your submitted applications</p>
           </header>
           
           <div className="space-y-4">
                {requests.filter(r => r.requesterName.includes(selectedClass)).map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-blue-200 transition-colors" onClick={() => setSelectedRequest(req)}>
                        <div>
                             <div className="flex items-center gap-2">
                                 <span className="font-bold text-lg">{req.itemName}</span>
                                 <span className="text-gray-400 text-sm">x{req.quantity}</span>
                             </div>
                             <div className="text-xs text-gray-500 mt-1">
                                 {new Date(req.timestamp).toLocaleDateString()} • {req.id}
                             </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="font-bold">¥{req.totalAmount.toLocaleString()}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded text-center mt-1 bg-gray-100 text-gray-700">
                                    {req.status}
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                ))}
                {requests.filter(r => r.requesterName.includes(selectedClass)).length === 0 && (
                    <div className="py-12 text-center text-gray-400">No history available.</div>
                )}
           </div>
      </div>
  );

  const renderAdminDashboard = () => {
    const spendChange = lastMonthSpend > 0 ? ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100 : 0;

    const allClassesSpendData = classConsumption
        .filter(c => c.month === dashboardDate)
        .map(c => {
         let total = 0;
         Object.entries(c.items).forEach(([itemName, qty]) => {
              const item = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(i.name.toLowerCase()));
              const price = item ? item.price : 0;
              total += (qty as number) * price;
         });
         return { name: c.className, value: total };
    });

    return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-6">
           <h2 className="text-3xl font-bold text-black tracking-tight">Overview</h2>
           <button onClick={openAnnouncementModal} className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               Announcement
           </button>
       </div>
       <NotificationBanner notifications={activeNotifications} isEditable={true} onUpdate={handleUpdateNotification} onDelete={handleDeleteNotification} />
       
       {/* Weekly Newsletter Editor Access for Admin */}
       <WeeklyNewsletter 
            report={weeklyReport} 
            events={allEvents} 
            isEditable={true} 
            onSave={handleSaveWeeklyReport}
        />
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <CyberCard noPadding className="p-5 flex flex-col justify-between h-32 cursor-pointer hover:shadow-ios-lg transition-shadow" onClick={() => setActiveTab('approvals')}>
             <div className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">Pending Approvals<svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
             <div className="text-3xl font-bold tracking-tight text-ios-blue">{requests.filter(r => r.status.includes('PENDING')).length}</div>
         </CyberCard>

         <CyberCard noPadding className="p-5 flex flex-col justify-between h-32 cursor-pointer hover:shadow-ios-lg transition-shadow" onClick={() => setShowSpendModal(true)}>
             <div className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">Monthly Spend<svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
             <div>
                <div className="text-3xl font-bold tracking-tight text-black">¥{currentMonthSpend.toLocaleString()}</div>
                <div className={`text-xs mt-1 font-medium ${spendChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>{spendChange > 0 ? '+' : ''}{spendChange.toFixed(1)}% vs last month</div>
             </div>
         </CyberCard>
         
         {showSpendModal && (
             <SpendDetailModal onClose={() => setShowSpendModal(false)} annualData={annualSpendData} classSpendData={allClassesSpendData} totalFixedAssetsValue={totalFixedAssetsValue} />
         )}
         
         <CyberCard noPadding className="p-5 flex flex-col justify-between h-32 cursor-pointer" onClick={() => setActiveTab('teachers')}>
             <div className="text-xs font-semibold text-gray-500 uppercase">Staff Active</div>
             <div className="text-3xl font-bold tracking-tight text-ios-green">{teachers.filter(t => t.status === 'Active').length}/{teachers.length}</div>
         </CyberCard>

         <CyberCard noPadding className="p-5 flex flex-col justify-between h-32 cursor-pointer" onClick={() => setActiveTab('students')}>
             <div className="text-xs font-semibold text-gray-500 uppercase">Students Present</div>
             <div className="text-3xl font-bold tracking-tight text-purple-600">{students.filter(s => s.status === 'Present').length}/{students.length}</div>
         </CyberCard>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <CyberCard title="Top 3 Class Spenders">
                    <div className="space-y-4">
                        {topSpenders.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                                <div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>{index + 1}</div><span className="font-semibold text-gray-800">{item.name}</span></div>
                                <span className="font-bold text-black">¥{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                        {topSpenders.length === 0 && <div className="text-gray-400 text-sm">No consumption data yet.</div>}
                    </div>
                </CyberCard>
            </div>
            <div className="lg:col-span-2">
                <CyberCard title="Stock Warnings" glowColor="pink" className="h-full">
                    <div className="space-y-3">
                    {inventory.filter(i => i.quantity < i.minThreshold).map(i => (
                        <div key={i.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">!</div>
                            <div><div className="text-black font-semibold text-sm">{i.name}</div><div className="text-xs text-red-500 font-medium">Qty: {i.quantity} / Min: {i.minThreshold}</div></div>
                        </div>
                    ))}
                    {inventory.filter(i => i.quantity < i.minThreshold).length === 0 && <div className="text-gray-400 text-sm p-4">All stock levels are healthy.</div>}
                    </div>
                </CyberCard>
            </div>
       </div>
    </div>
  )};

  const renderApprovals = () => {
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING_DIRECTOR || r.status === RequestStatus.PENDING_FULL_CHAIN);

    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between pb-4">
             <div><h2 className="text-3xl font-bold text-black tracking-tight">Approvals</h2><p className="text-sm text-gray-500">Review pending purchase requests</p></div>
             <span className="bg-ios-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{pendingRequests.length} Pending</span>
        </header>
        
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 text-2xl">✓</div>
             <h3 className="text-lg font-semibold text-black">All Caught Up</h3>
             <p className="text-gray-400">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingRequests.map(req => (
                <CyberCard key={req.id} className="relative overflow-hidden group">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${req.totalAmount > 5000 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{req.totalAmount > 5000 ? 'Full Chain' : 'Director'}</span>
                                {req.requestType === 'TRANSFER' && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-purple-100 text-purple-700">Asset Transfer</span>}
                                {req.requestType === 'SCRAP' && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-red-100 text-red-700">Asset Scrap</span>}
                                <span className="text-gray-400 text-xs">#{req.id.slice(-6)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-black">{req.quantity}x {req.itemName}</h3>
                            <div className="text-sm text-ios-blue font-medium mt-1">By {req.requesterName} • {req.vendor || 'Unknown Vendor'}</div>
                            {req.purpose && <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100"><p className="text-sm text-gray-600 italic">"{req.purpose}"</p></div>}
                            {req.scrapImage && <div className="mt-3"><p className="text-xs font-bold text-gray-500 uppercase mb-1">Proof:</p><img src={req.scrapImage} alt="Proof" className="w-24 h-24 object-cover rounded-lg border border-gray-200" /></div>}
                            <div className="mt-3 flex gap-3 items-start">
                                <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 mt-0.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
                                <p className="text-xs text-gray-500 leading-relaxed flex-1"><span className="font-bold text-indigo-600">Analysis:</span> {req.aiAnalysis}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between items-end min-w-[180px] lg:border-l lg:border-gray-100 lg:pl-6">
                            <div className="text-right"><div className="text-xs text-gray-400 uppercase font-medium">Total Value</div><div className="text-3xl font-bold text-black tracking-tight">{req.requestType === 'TRANSFER' || req.requestType === 'SCRAP' ? 'N/A' : `¥${req.totalAmount.toLocaleString()}`}</div></div>
                            <div className="flex gap-3 mt-6 w-full">
                                <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors">Reject</button>
                                <button onClick={() => handleApprove(req.id)} className="flex-1 py-2.5 rounded-xl bg-black text-white font-semibold text-sm shadow-lg hover:bg-gray-800 transition-colors">Approve</button>
                            </div>
                        </div>
                    </div>
                </CyberCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPurchasing = () => {
    const approvedItems = requests.filter(r => r.status === RequestStatus.APPROVED || r.status === RequestStatus.AUTO_APPROVED);
    const orderedItems = requests.filter(r => r.status === RequestStatus.ORDERED);

    return (
        <div className="space-y-8">
             <div>
                <header className="flex items-center justify-between pb-4"><div><h2 className="text-3xl font-bold text-black tracking-tight">Purchasing</h2><p className="text-sm text-gray-500">Create Purchase Orders for approved requests</p></div></header>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ready to Order</h3>
                <div className="space-y-3">
                    {approvedItems.length === 0 && <div className="text-gray-400 text-sm italic py-4">No items ready for purchasing.</div>}
                    {approvedItems.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-ios border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div><span className="font-semibold text-black">{req.itemName}</span><span className="text-gray-400 text-sm">x {req.quantity}</span>
                                    {req.isFixedAsset && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Fixed Asset</span>}
                                    {req.requestType === 'TRANSFER' && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Transfer</span>}
                                    {req.requestType === 'SCRAP' && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">Scrap</span>}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 pl-4">Requested by {req.requesterName} • {req.requestType === 'TRANSFER' ? 'Transfer Approved' : req.requestType === 'SCRAP' ? 'Write-off Approved' : `¥${req.totalAmount}`}</div>
                            </div>
                            {req.requestType !== 'TRANSFER' && req.requestType !== 'SCRAP' && (
                                <button onClick={() => handleGeneratePO(req.id)} className="px-5 py-2 bg-ios-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap">Generate PO</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ordered (Pending Receipt)</h3>
                <div className="space-y-3">
                    {orderedItems.length === 0 && <div className="text-gray-400 text-sm italic">No active orders.</div>}
                    {orderedItems.map(req => (
                         <div key={req.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                            <div>
                                <span className="text-sm font-medium text-gray-700">{req.itemName} (x{req.quantity})</span>
                                {req.isFixedAsset && <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">FA</span>}
                                <div className="text-xs text-blue-600 font-bold mt-1">PO GENERATED</div>
                            </div>
                            <button onClick={() => handleReceiveStock(req.id)} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">Receive & {req.isFixedAsset ? 'Register Asset' : 'Stock'}</button>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    )
  };
  
  // Replaced renderReconciliation with SchoolArchives integration
  const renderArchives = () => (
      <SchoolArchives 
        contracts={contracts}
        onSaveContract={async (c) => {
            await supabase.from('contracts').upsert(c);
            setContracts(prev => {
                const idx = prev.findIndex(item => item.id === c.id);
                if (idx > -1) {
                    const updated = [...prev];
                    updated[idx] = c;
                    return updated;
                }
                return [...prev, c];
            });
            showToast('合同保存成功 (Contract Saved)');
        }}
        onDeleteContract={handleDeleteContract}
        files={archiveFiles}
        onSaveFile={async (f) => {
            await supabase.from('school_files').upsert(f);
            setArchiveFiles(prev => [...prev, f]);
            showToast('文件上传成功 (File Uploaded)');
        }}
        onDeleteFile={handleDeleteSchoolFile}
        students={students}
        onSaveStudent={handleSaveStudent}
        onDeleteStudent={handleDeleteStudent}
        teachers={teachers}
        onSaveTeacher={handleSaveTeacher}
        onDeleteTeacher={handleDeleteTeacher}
        classes={CLASSES}
      />
  );
  
  // --- SETTINGS VIEW ---
  const renderSettings = () => (
      <div className="space-y-6 max-w-2xl mx-auto">
           <header className="pb-4 border-b border-gray-100">
             <h2 className="text-2xl font-bold text-black tracking-tight">System Settings</h2>
             <p className="text-sm text-gray-500">Security and configuration</p>
           </header>
           
           <CyberCard title="Change Admin Password">
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Administrator Password</label>
                       <div className="flex gap-3">
                            <input 
                                type="password"
                                className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black"
                                placeholder="Enter new password"
                                value={newAdminPass}
                                onChange={(e) => setNewAdminPass(e.target.value)}
                            />
                            <button 
                                onClick={handleUpdateAdminPass}
                                className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800"
                            >
                                Update
                            </button>
                       </div>
                       <p className="text-xs text-gray-400 mt-2">Current: •••••• (Hidden)</p>
                   </div>
               </div>
           </CyberCard>

           <CyberCard title="Change Homepage Login Password">
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Global Access Password</label>
                       <div className="flex gap-3">
                            <input 
                                type="password"
                                className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black"
                                placeholder="Enter new access code"
                                value={newAppPass}
                                onChange={(e) => setNewAppPass(e.target.value)}
                            />
                            <button 
                                onClick={handleUpdateAppPass}
                                className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800"
                            >
                                Update
                            </button>
                       </div>
                        <p className="text-xs text-gray-400 mt-2">Current: •••••• (Hidden)</p>
                   </div>
               </div>
           </CyberCard>
      </div>
  );

  const renderContent = () => {
    if (role === Role.TEACHER) {
      if (activeTab === 'dashboard') return renderTeacherDashboard();
      if (activeTab === 'requisition') return (
          <RequisitionForm 
              onSubmit={handleSubmitRequisition} 
              className="max-w-3xl mx-auto" 
              availableAssets={fixedAssets} 
              preSelectedAssetId={transferAssetId} 
          />
      );
      if (activeTab === 'fixed-assets') return (
          <TeacherAssetView 
              assets={fixedAssets}
              selectedClass={selectedClass}
              onTransfer={handleTeacherTransferInit}
              onScrap={handleTeacherScrapRequest}
          />
      );
      if (activeTab === 'calendar') return (
          <CalendarView 
            events={allEvents} // Using events combined with birthdays
            role={role} 
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            selectedClass={selectedClass} 
            classes={CLASSES}
            onToggleComplete={handleToggleEventCompletion}
            venues={venues} // Pass venues to Teacher Calendar
          />
      );
      if (activeTab === 'meetings') return renderMeetings();
      if (activeTab === 'history') return renderHistory();
      if (activeTab === 'my-students') return (
          <TeacherStudentView 
            students={students}
            selectedClass={selectedClass}
          />
      );
    } else {
      if (activeTab === 'dashboard') return renderAdminDashboard();
      if (activeTab === 'inventory') return (
        <InventoryView 
            items={filteredInventory} 
            categories={categories}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            onQuickRequisition={handleQuickRequisition} 
            onItemClick={handleItemClick} 
            onAddItem={handleAddItem}
        />
      );
      if (activeTab === 'fixed-assets') return (
          <FixedAssetManager 
            assets={fixedAssets} 
            onSave={handleSaveFixedAsset} 
          />
      );
      if (activeTab === 'approvals') return renderApprovals();
      if (activeTab === 'purchasing') return renderPurchasing();
      if (activeTab === 'calendar') return (
        <CalendarView 
            events={allEvents} // Using events combined with birthdays
            role={role} 
            onAddEvent={handleAddEvent} 
            onUpdateEvent={handleUpdateEvent}
            onAddNotification={handleAddNotification}
            onDeleteEvent={handleDeleteEvent}
            classes={CLASSES}
            onToggleComplete={handleToggleEventCompletion}
            venues={venues}
            onSaveVenue={handleSaveVenue}
            onDeleteVenue={handleDeleteVenue}
        />
      );
      if (activeTab === 'teachers') return (
          <TeacherManager 
            teachers={teachers} 
            classes={CLASSES} 
            onSave={handleSaveTeacher} 
            onDelete={handleDeleteTeacher}
          />
      );
      if (activeTab === 'students') return (
          <StudentManager 
            students={students} 
            classes={CLASSES} 
            onSave={handleSaveStudent} 
            onDelete={handleDeleteStudent}
          />
      );
      if (activeTab === 'attendance') return renderAttendanceLogs(); // New View
      if (activeTab === 'classes') return (
           <ConsumptionEditor 
               data={classConsumption} 
               classes={CLASSES} 
               onSave={handleSaveConsumption} 
               inventory={inventory}
           />
      );
      // Renamed Reconciliation to Archives
      if (activeTab === 'archives') return renderArchives();
      
      // New Recycle Bin Tab
      if (activeTab === 'recycle-bin') return (
          <RecycleBin 
            items={trashItems}
            onRestore={handleRestoreItem}
            onPermanentDelete={handlePermanentDelete}
          />
      );

      // New Settings Tab
      if (activeTab === 'settings') return renderSettings();
    }
    return <div className="flex items-center justify-center h-64 text-gray-400">Section under construction</div>;
  };

  // --- LOGIN SCREEN RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-4">
         {/* Logo Section */}
         <div className="mb-10 text-center flex flex-col items-center">
            {/* Using the SVG Logo from Layout */}
            <svg className="w-24 h-24 mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="25" y1="85" x2="70" y2="20" stroke="#D33F42" strokeWidth="8" strokeLinecap="round" />
                <line x1="15" y1="65" x2="80" y2="35" stroke="#7D4E97" strokeWidth="8" strokeLinecap="round" />
                <line x1="45" y1="10" x2="50" y2="90" stroke="#3A9E9F" strokeWidth="8" strokeLinecap="round" />
                <line x1="50" y1="50" x2="90" y2="25" stroke="#5CB6E8" strokeWidth="8" strokeLinecap="round" />
                <line x1="5" y1="50" x2="50" y2="55" stroke="#96C648" strokeWidth="8" strokeLinecap="round" />
                <line x1="20" y1="35" x2="50" y2="50" stroke="#F1AD34" strokeWidth="8" strokeLinecap="round" />
            </svg>
            <h1 className="text-3xl font-bold mt-2 text-gray-900 tracking-tight">清澜山幼儿园</h1>
            <p className="text-lg text-gray-500 font-medium">Tsinglan Kindergarten</p>
         </div>
         
         {/* Login Box */}
         <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 animate-slide-up border border-gray-100">
            <form onSubmit={handleAppLogin} className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2 text-center tracking-widest">Access Code</label>
                   <input 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black text-center text-xl tracking-widest transition-all placeholder-gray-300"
                      placeholder="••••••••"
                      autoFocus
                   />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transform active:scale-95 transition-all"
                >
                  Login
                </button>
            </form>
         </div>

         {/* Footer */}
         <div className="mt-12 text-gray-400 text-xs font-medium uppercase tracking-widest">
            Power by Jack Li
         </div>
         
         {/* Toast for Login Screen */}
         {toast && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] font-bold text-sm text-white animate-slide-up ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {toast.msg}
            </div>
         )}
      </div>
    );
  }

  return (
    <Layout 
      currentRole={role} 
      onSwitchRole={handleSwitchRole}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedClass={selectedClass}
      onClassChange={setSelectedClass}
    >
      {renderContent()}

      {selectedItem && (
        <ItemDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
            onAddToCart={(item) => {
                handleQuickRequisition(item);
                setSelectedItem(null);
            }} 
            onSave={handleSaveItem}
            onDelete={(id) => {
                handleDeleteInventoryItem(id);
                setSelectedItem(null);
            }}
            isEditingAllowed={role === Role.ADMIN}
        />
      )}
      
      {selectedRequest && (
        <RequestDetailModal 
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
        />
      )}
      
      {/* Transfer Approval Modal */}
      {transferModalOpen && pendingTransferRequest && (
          <TransferApprovalModal 
              isOpen={transferModalOpen}
              onClose={() => { setTransferModalOpen(false); setPendingTransferRequest(null); }}
              onConfirm={handleConfirmTransfer}
              requestDetails={{
                  itemName: pendingTransferRequest.itemName,
                  requester: pendingTransferRequest.requesterName,
                  currentNotes: pendingTransferRequest.purpose || pendingTransferRequest.note || 'No notes',
                  assetId: pendingTransferRequest.fixedAssetId
              }}
          />
      )}
      
      {/* Attendance Modal */}
      {showAttendanceModal && attendanceTarget && (
          <AttendanceModal 
              user={attendanceTarget.user}
              role={attendanceTarget.role}
              correctPassword={attendanceTarget.role === 'TEACHER' ? (attendanceTarget.user as Teacher).attendancePassword : undefined}
              onConfirm={handleAttendanceSubmit}
              onCancel={() => { setShowAttendanceModal(false); setAttendanceTarget(null); }}
          />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)}></div>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 animate-slide-up">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-black">Admin Access</h3>
                    <p className="text-sm text-gray-500">Please enter password to continue</p>
                </div>
                
                <input 
                    type="password" 
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-black outline-none text-center tracking-widest"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                    autoFocus
                />
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowAdminLogin(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAdminLogin}
                        className="flex-1 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAnnouncementModal(false)}></div>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 animate-slide-up">
                <h3 className="text-xl font-bold mb-4">Announcement</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none h-32"
                            placeholder="Enter announcement text..."
                            value={announcementForm.message}
                            onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expires At</label>
                        <input 
                            type="date"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                            value={announcementForm.expiresAt}
                            onChange={e => setAnnouncementForm({...announcementForm, expiresAt: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAnnouncementModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-gray-600 hover:bg-gray-200">Cancel</button>
                    <button onClick={handlePostAnnouncement} className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800">Post</button>
                </div>
            </div>
        </div>
      )}

      {/* Global Toast inside Layout for authenticated view */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] font-bold text-sm text-white animate-slide-up ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.msg}
        </div>
      )}

    </Layout>
  );
}

export default App;