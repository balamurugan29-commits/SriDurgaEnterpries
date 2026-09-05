import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchEmployees, 
  fetchAttendanceByDate, 
  fetchAttendanceByMonth,
  saveDailyAttendanceBatch, 
  markAllEmployeesPresent, 
  fetchSalariesByMonth, 
  fetchAvailableSalaryMonths, 
  saveSalaryRecord, 
  saveSalariesBatch,
  generateMonthlySalaries, 
  fetchEmployeeAdvances, 
  fetchEmployeeAdvanceBalance, 
  fetchAdvanceSummary,
  saveAdvanceTransaction,
  fetchCompanyDetails
} from '../services/api';
import { SalarySlipPrintModal } from '../components/SalarySlipPrintModal';
import { AdvanceModal } from '../components/AdvanceModal';
import { ClockTimePickerModal } from '../components/ClockTimePickerModal';
import { Toast } from '../components/Toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  Check, 
  X, 
  Save, 
  Printer, 
  DollarSign, 
  CreditCard, 
  Plus, 
  Search, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  Landmark, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Percent,
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AttendancePayrollPage = () => {
  // Navigation Tabs: 'attendance' | 'monthly_sheet' | 'payroll' | 'advances'
  const [activeTab, setActiveTab] = useState('monthly_sheet');
  
  // Date & Period states
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(MONTH_NAMES[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [globalWorkingDays, setGlobalWorkingDays] = useState(26);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [advanceBalances, setAdvanceBalances] = useState({});
  const [companyDetails, setCompanyDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Month-End Bulk Attendance & Wage Sheet State
  const [monthlySheetData, setMonthlySheetData] = useState([]);

  // Modals
  const [printSlipSalary, setPrintSlipSalary] = useState(null);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [selectedEmployeeForLedger, setSelectedEmployeeForLedger] = useState(null);
  const [advanceHistory, setAdvanceHistory] = useState([]);

  // Analog Clock Time Picker State
  const [timePickerConfig, setTimePickerConfig] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: '',
    field: 'inTime',
    initialTime: '09:00',
    title: 'Select Time'
  });

  const format12Hour = (time24) => {
    if (!time24) return '--:--';
    const parts = time24.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, '0')}:${m} ${period}`;
  };

  const handleTimePickerConfirm = (selected24hTime) => {
    if (timePickerConfig.employeeId && timePickerConfig.field) {
      handleDailyAttendanceFieldChange(timePickerConfig.employeeId, timePickerConfig.field, selected24hTime);
    }
  };

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Load Employees & Company Details & Advance Balances
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [empList, comp, advSummary] = await Promise.all([
        fetchEmployees(''),
        fetchCompanyDetails(),
        fetchAdvanceSummary()
      ]);
      setEmployees(empList || []);
      setCompanyDetails(comp || {});
      setAdvanceBalances(advSummary || {});
    } catch (err) {
      console.error('Failed to load initial directory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load Daily Attendance on Date change
  const loadDailyAttendance = async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      const data = await fetchAttendanceByDate(selectedDate);
      setAttendanceRecords(data || []);
    } catch (err) {
      console.error('Failed to load daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadDailyAttendance();
    }
  }, [selectedDate, activeTab]);

  // Load Salaries on Month/Year change
  const salaryMonthStr = `${selectedMonth} - ${selectedYear}`;
  const loadSalaries = async () => {
    try {
      setLoading(true);
      const data = await fetchSalariesByMonth(salaryMonthStr);
      setSalaries(data || []);
    } catch (err) {
      console.error('Failed to load salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payroll' || activeTab === 'monthly_sheet') {
      loadSalaries();
    }
  }, [salaryMonthStr, activeTab]);

  // Helper to recompute mathematical columns for a single salary / attendance row
  const computeSalaryRow = (row) => {
    const workingDays = Number(row.totalWorkingDays) > 0 ? Number(row.totalWorkingDays) : (globalWorkingDays || 26);
    const monthlySalary = Number(row.monthlySalary) > 0 
      ? Number(row.monthlySalary) 
      : (Number(row.totalWages) > 0 ? Number(row.totalWages) : 20000);

    // Per Day Rate = Per Month / Working Days (e.g. 26)
    const perDayRate = workingDays > 0 ? Math.round((monthlySalary / workingDays) * 100) / 100 : 0;

    // Basic Wage per day is editable (default 400)
    const basicRate = (row.basicRate !== undefined && row.basicRate !== null && !isNaN(row.basicRate)) 
      ? Number(row.basicRate) 
      : 400.0;

    // Other Wage / Day = Per Day Rate - Basic Wage
    const othersRate = Math.max(0, Math.round((perDayRate - basicRate) * 100) / 100);

    const presentDays = Number(row.presentDays) || 0;
    const leaveDays = Number(row.leaveDays) || 0;
    const absentDays = Number(row.absentDays) || 0;
    const halfDays = Number(row.halfDays) || 0;
    const overtimeHours = Number(row.overtimeHours) || 0;

    // Earned Basic = Basic Wage * Present Days
    const earnedBasic = Math.round((basicRate * presentDays) * 100) / 100;

    // Earned Others = Other Wage * Present Days
    const earnedOthers = Math.round((othersRate * presentDays) * 100) / 100;

    // OT Amount = Overtime Hours * (Per Day / 8)
    const otAmount = (row.otAmount !== undefined && Number(row.otAmount) > 0)
      ? Number(row.otAmount)
      : (overtimeHours > 0 ? Math.round((overtimeHours * (perDayRate / 8)) * 100) / 100 : 0);

    // Total Wages (Earned Total) = Earned Basic + Earned Others + OT Amount
    const totalWages = Math.round((earnedBasic + earnedOthers + otAmount) * 100) / 100;

    // Leave Wage = Leave Days * Per Day Rate
    const leaveWage = Math.round((leaveDays * perDayRate) * 100) / 100;

    // LOP = Absent Days * Per Day Rate
    const lop = Math.round((absentDays * perDayRate) * 100) / 100;

    // EPF = Basic Wage * Present Days * 12% (with ₹15,000 cap rule: if earnedBasic > 15000, cap at 15000; if <= 15000, use earnedBasic)
    const epfWage = Math.min(earnedBasic, 15000);
    let epf = (row.epf !== undefined && row.epf !== null && !isNaN(row.epf) && Number(row.epf) >= 0 && row.isCustomEpf)
      ? Number(row.epf)
      : Math.round((epfWage * 0.12) * 100) / 100;

    // ESI = Total Wages * 0.75% (with ₹21,000 cap rule: if totalWages > 21000, cap at 21000; if <= 21000, use totalWages)
    const esicWage = Math.min(totalWages, 21000);
    let esi = (row.esi !== undefined && row.esi !== null && !isNaN(row.esi) && Number(row.esi) >= 0 && row.isCustomEsi)
      ? Number(row.esi)
      : Math.round((esicWage * 0.0075) * 100) / 100;

    // Deducted EPF & ESI = EPF + ESI
    const epfAndEsi = Math.round((epf + esi) * 100) / 100;

    const bonus = Number(row.bonus) || 0;
    const incentive = Number(row.incentive) || 0;

    // Grand Total = Total Earned + Leave Wage + Bonus - (EPF + ESI)
    const grandTotal = Math.round((totalWages + leaveWage + bonus - epf - esi) * 100) / 100;

    const advDeducted = Number(row.advDeducted) || 0;
    const currentAdvance = Number(row.currentAdvance) || 0;

    // Running advance balance
    const baseAdvBalance = (row.prevAdvanceBalance !== undefined) 
      ? Number(row.prevAdvanceBalance) 
      : (advanceBalances[row.employeeId] !== undefined ? Number(advanceBalances[row.employeeId]) : Number(row.balanceAdvance || 0) + Number(row.advDeducted || 0));

    // Net Credit = Total wage + Leave wage - Deducted (EPF + ESI) - Adv deducted + Bonus + Incentive
    const netCredit = Math.round((totalWages + leaveWage - epfAndEsi - advDeducted + bonus + incentive) * 100) / 100;

    // Balance Advance = Previous Balance + Current Advance - Adv Deducted
    const balanceAdvance = Math.max(0, Math.round((baseAdvBalance + currentAdvance - advDeducted) * 100) / 100);

    return {
      ...row,
      totalWorkingDays: workingDays,
      monthlySalary,
      perDayRate,
      basicRate,
      othersRate,
      presentDays,
      leaveDays,
      absentDays,
      halfDays,
      overtimeHours,
      earnedBasic,
      earnedOthers,
      otAmount,
      totalWages,
      leaveWage,
      lop,
      epf,
      esi,
      epfAndEsi,
      bonus,
      incentive,
      grandTotal,
      advDeducted,
      currentAdvance,
      netCredit,
      balanceAdvance,
      prevAdvanceBalance: baseAdvBalance,
      dailyWage: perDayRate
    };
  };

  // Sync Monthly Attendance Sheet state whenever employees or salaries change
  useEffect(() => {
    const activeEmps = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    if (activeEmps.length === 0) {
      setMonthlySheetData([]);
      return;
    }

    const rows = activeEmps.map(emp => {
      const existing = salaries.find(s => s.employeeId === emp.id);
      const advBal = advanceBalances[emp.id] || 0;
      const empMonthlySalary = emp.monthlySalary || 20000.0;
      const empBasicRate = emp.basicRate !== undefined ? emp.basicRate : 400.0;

      if (existing) {
        return computeSalaryRow({
          ...existing,
          employeeName: emp.employeeName,
          employeeNumber: emp.employeeNumber,
          designation: emp.designation,
          monthlySalary: existing.monthlySalary || empMonthlySalary,
          basicRate: existing.basicRate !== undefined ? existing.basicRate : empBasicRate,
          prevAdvanceBalance: (existing.balanceAdvance !== undefined && existing.advDeducted !== undefined)
            ? Number(existing.balanceAdvance) + Number(existing.advDeducted)
            : advBal
        });
      }

      // Default initial row for uncomputed month
      return computeSalaryRow({
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeNumber: emp.employeeNumber,
        designation: emp.designation,
        salaryMonth: salaryMonthStr,
        month: selectedMonth,
        year: selectedYear,
        monthlySalary: empMonthlySalary,
        basicRate: empBasicRate,
        totalWorkingDays: globalWorkingDays,
        presentDays: globalWorkingDays,
        leaveDays: 0,
        absentDays: 0,
        halfDays: 0,
        overtimeHours: 0,
        otAmount: 0.0,
        bonus: 0.0,
        incentive: 0.0,
        advDeducted: 0.0,
        currentAdvance: 0.0,
        balanceAdvance: advBal,
        prevAdvanceBalance: advBal,
        paymentStatus: 'PENDING',
        paymentMode: 'Bank Transfer'
      });
    });

    setMonthlySheetData(rows);
  }, [employees, salaries, advanceBalances, salaryMonthStr, selectedMonth, selectedYear, globalWorkingDays]);

  // Handle cell edit in Month-End Sheet
  const handleMonthlySheetFieldChange = (empId, field, rawValue) => {
    setMonthlySheetData(prev => prev.map(row => {
      if (row.employeeId === empId) {
        const val = (field === 'paymentStatus' || field === 'paymentMode' || field === 'remarks') 
          ? rawValue 
          : (parseFloat(rawValue) || 0);

        const isCustomEpf = field === 'epf' ? true : row.isCustomEpf;
        const isCustomEsi = field === 'esi' ? true : row.isCustomEsi;

        const updatedRow = { ...row, [field]: val, isCustomEpf, isCustomEsi };
        return computeSalaryRow(updatedRow);
      }
      return row;
    }));
  };

  // 1-Click Auto-Fill Full Month Attendance (e.g. all 26 present, 0 leave, 0 absent)
  const handleAutoFillFullMonth = () => {
    setMonthlySheetData(prev => prev.map(row => {
      const updated = {
        ...row,
        totalWorkingDays: globalWorkingDays,
        presentDays: globalWorkingDays,
        leaveDays: 0,
        absentDays: 0,
        halfDays: 0,
        overtimeHours: 0
      };
      return computeSalaryRow(updated);
    }));
    setToast({ 
      message: `Auto-filled full attendance (${globalWorkingDays} working days, 0 leave/absent) for all staff!`, 
      type: 'success' 
    });
  };

  // Change global working days for all staff
  const handleGlobalWorkingDaysChange = (days) => {
    const d = parseFloat(days) || 26;
    setGlobalWorkingDays(d);
    setMonthlySheetData(prev => prev.map(row => {
      return computeSalaryRow({ ...row, totalWorkingDays: d });
    }));
  };

  // Save Monthly Attendance Sheet & Update Payroll Database
  const handleSaveMonthlySheet = async () => {
    try {
      setSaving(true);
      const saved = await saveSalariesBatch(monthlySheetData);
      setSalaries(saved || []);
      setToast({ 
        message: `Successfully saved Month-End Attendance & Calculated Payroll for ${salaryMonthStr}! (${monthlySheetData.length} records updated)`, 
        type: 'success' 
      });
    } catch (err) {
      console.error('Failed to save monthly attendance sheet:', err);
      setToast({ message: 'Failed to save monthly attendance sheet: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Load Advance History when selecting employee in ledger tab
  const loadAdvanceLedger = async (empId) => {
    try {
      const hist = await fetchEmployeeAdvances(empId);
      setAdvanceHistory(hist || []);
    } catch (err) {
      console.error('Failed to load advances:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'advances' && employees.length > 0) {
      const targetId = selectedEmployeeForLedger ? selectedEmployeeForLedger.id : employees[0].id;
      if (!selectedEmployeeForLedger) {
        setSelectedEmployeeForLedger(employees[0]);
      }
      loadAdvanceLedger(targetId);
    }
  }, [activeTab, employees, selectedEmployeeForLedger]);

  // Merge Employees with Attendance Records for current date (Daily Tab)
  const dailyAttendanceList = useMemo(() => {
    const activeEmps = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active');
    return activeEmps.map(emp => {
      const existing = attendanceRecords.find(a => a.employeeId === emp.id);
      return {
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeNumber: emp.employeeNumber,
        designation: emp.designation,
        status: existing ? existing.status : 'PRESENT',
        inTime: existing ? existing.inTime || '09:00' : '09:00',
        outTime: existing ? existing.outTime || '18:00' : '18:00',
        overtimeHours: existing ? existing.overtimeHours || 0 : 0,
        remarks: existing ? existing.remarks || '' : ''
      };
    });
  }, [employees, attendanceRecords]);

  // Local state for daily editing
  const [editedAttendance, setEditedAttendance] = useState([]);
  useEffect(() => {
    setEditedAttendance(dailyAttendanceList);
  }, [dailyAttendanceList]);

  // Handle Daily Attendance status toggle
  const handleDailyStatusChange = (empId, newStatus) => {
    setEditedAttendance(prev => prev.map(item => {
      if (item.employeeId === empId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  // Handle Daily Attendance field change
  const handleDailyAttendanceFieldChange = (empId, field, val) => {
    setEditedAttendance(prev => prev.map(item => {
      if (item.employeeId === empId) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Save Daily Attendance
  const handleSaveDailyAttendance = async () => {
    try {
      setSaving(true);
      await saveDailyAttendanceBatch(selectedDate, editedAttendance);
      setToast({ message: `Daily Attendance saved for ${selectedDate}!`, type: 'success' });
      loadDailyAttendance();
    } catch (err) {
      setToast({ message: 'Failed to save attendance: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Mark All Present (Daily)
  const handleMarkAllPresent = async () => {
    try {
      setSaving(true);
      await markAllEmployeesPresent(selectedDate);
      setToast({ message: `All active employees marked PRESENT for ${selectedDate}!`, type: 'success' });
      loadDailyAttendance();
    } catch (err) {
      setToast({ message: 'Operation failed: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Auto-Generate Monthly Salaries from Daily records
  const handleGenerateSalaries = async () => {
    try {
      setSaving(true);
      const generated = await generateMonthlySalaries(selectedMonth, selectedYear, globalWorkingDays);
      setSalaries(generated || []);
      setToast({ message: `Generated salary calculations for ${salaryMonthStr}! (${generated.length} employees)`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate salaries: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Save/Update Individual Salary Row
  const handleSaveSalaryRow = async (salaryRecord) => {
    try {
      await saveSalaryRecord(salaryRecord);
      setToast({ message: `Updated salary for ${salaryRecord.employeeName}!`, type: 'success' });
      loadSalaries();
    } catch (err) {
      setToast({ message: 'Failed to save salary: ' + err.message, type: 'error' });
    }
  };

  // Toggle Salary Payment Status
  const handleTogglePaymentStatus = async (salary) => {
    const nextStatus = salary.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const updated = {
      ...salary,
      paymentStatus: nextStatus,
      paymentDate: nextStatus === 'PAID' ? new Date().toISOString().split('T')[0] : ''
    };
    handleSaveSalaryRow(updated);
  };

  // Save Advance Entry
  const handleSaveAdvance = async (advanceData) => {
    try {
      await saveAdvanceTransaction(advanceData);
      setToast({ message: `Advance entry of Rs. ${advanceData.amount} recorded!`, type: 'success' });
      setAdvanceModalOpen(false);
      loadInitialData();
      if (selectedEmployeeForLedger && selectedEmployeeForLedger.id === advanceData.employeeId) {
        loadAdvanceLedger(advanceData.employeeId);
      }
      loadSalaries();
    } catch (err) {
      setToast({ message: 'Failed to record advance: ' + err.message, type: 'error' });
    }
  };

  // Filtered Sheet Data for Monthly Sheet & Payroll
  const filteredMonthlySheet = useMemo(() => {
    if (!searchQuery) return monthlySheetData;
    const q = searchQuery.toLowerCase();
    return monthlySheetData.filter(s => 
      (s.employeeName && s.employeeName.toLowerCase().includes(q)) ||
      (s.employeeNumber && s.employeeNumber.toLowerCase().includes(q)) ||
      (s.designation && s.designation.toLowerCase().includes(q))
    );
  }, [monthlySheetData, searchQuery]);

  const filteredSalaries = useMemo(() => {
    if (!searchQuery) return salaries;
    const q = searchQuery.toLowerCase();
    return salaries.filter(s => 
      (s.employeeName && s.employeeName.toLowerCase().includes(q)) ||
      (s.employeeNumber && s.employeeNumber.toLowerCase().includes(q)) ||
      (s.designation && s.designation.toLowerCase().includes(q))
    );
  }, [salaries, searchQuery]);

  // Overall Statistics
  const sheetStats = useMemo(() => {
    let totalMonthlyPool = 0;
    let totalGross = 0;
    let totalNet = 0;
    let totalLeaveWage = 0;
    let totalEpf = 0;
    let totalEsi = 0;
    let totalEpfEsi = 0;
    let totalLop = 0;
    let totalBonus = 0;
    let totalIncentive = 0;
    let totalGrandTotal = 0;
    let totalAdvDeducted = 0;
    let totalBalanceAdvance = 0;
    let paidCount = 0;

    monthlySheetData.forEach(s => {
      totalMonthlyPool += (s.monthlySalary || 0);
      totalGross += (s.totalWages || 0);
      totalLeaveWage += (s.leaveWage || 0);
      totalEpf += (s.epf || 0);
      totalEsi += (s.esi || 0);
      totalEpfEsi += (s.epfAndEsi || (s.epf || 0) + (s.esi || 0));
      totalLop += (s.lop || 0);
      totalBonus += (s.bonus || 0);
      totalIncentive += (s.incentive || 0);
      totalGrandTotal += (s.grandTotal || 0);
      totalNet += (s.netCredit || 0);
      totalAdvDeducted += (s.advDeducted || 0);
      totalBalanceAdvance += (s.balanceAdvance || 0);
      if (s.paymentStatus === 'PAID') paidCount++;
    });

    return { 
      totalMonthlyPool,
      totalGross, 
      totalLeaveWage,
      totalEpf,
      totalEsi,
      totalEpfEsi, 
      totalLop, 
      totalBonus,
      totalIncentive,
      totalGrandTotal,
      totalNet, 
      totalAdvDeducted, 
      totalBalanceAdvance, 
      paidCount, 
      count: monthlySheetData.length 
    };
  }, [monthlySheetData]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Printable Salary Slip Modal */}
      {printSlipSalary && (
        <SalarySlipPrintModal
          isOpen={!!printSlipSalary}
          onClose={() => setPrintSlipSalary(null)}
          salary={printSlipSalary}
          companyDetails={companyDetails}
        />
      )}

      {/* Circular Analog Clock Time Picker Modal */}
      {timePickerConfig.isOpen && (
        <ClockTimePickerModal
          isOpen={timePickerConfig.isOpen}
          onClose={() => setTimePickerConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleTimePickerConfirm}
          initialTime={timePickerConfig.initialTime}
          title={timePickerConfig.title}
        />
      )}

      {/* Record Advance Modal */}
      {advanceModalOpen && (
        <AdvanceModal
          isOpen={advanceModalOpen}
          onClose={() => setAdvanceModalOpen(false)}
          onSave={handleSaveAdvance}
          employees={employees.filter(e => (e.status || 'Active').toLowerCase() === 'active')}
        />
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(56, 189, 248, 0.15) 100%)',
        border: '1.5px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '18px',
        padding: '1.35rem 1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '0.85rem',
            borderRadius: '14px',
            color: 'white',
            display: 'flex',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Calendar size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Personnel Management</span>
              <ChevronRight size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Attendance, Salary & Payslip Register</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Staff Attendance & Monthly Payroll Management
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '750px', lineHeight: 1.45 }}>
              Enter attendance daily or in <strong>bulk month-end summary</strong>, calculate automated Leave Wages & LOP deductions, track EPF/ESI and staff advances, and print instant official payslips.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAdvanceModalOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.1)' }}
          >
            <CreditCard size={15} />
            <span>Record Staff Advance</span>
          </button>

          {activeTab === 'monthly_sheet' ? (
            <>
              <button
                onClick={handleAutoFillFullMonth}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)' }}
                title="Auto fill all working days as present"
              >
                <Zap size={15} />
                <span>Auto-Fill Full Month</span>
              </button>

              <button
                onClick={handleSaveMonthlySheet}
                disabled={saving}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : `Save & Calculate Payroll (${selectedMonth})`}</span>
              </button>
            </>
          ) : activeTab === 'attendance' ? (
            <>
              <button
                onClick={handleMarkAllPresent}
                disabled={saving}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.1)' }}
              >
                <CheckCircle2 size={15} />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleSaveDailyAttendance}
                disabled={saving}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Daily Attendance'}</span>
              </button>
            </>
          ) : activeTab === 'payroll' ? (
            <button
              onClick={handleGenerateSalaries}
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <Zap size={16} />
              <span>{saving ? 'Calculating...' : `Recalculate (${salaryMonthStr})`}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 4 Main Tab Nav Switchers */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        padding: '0.5rem 0.75rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('monthly_sheet')}
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'monthly_sheet' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
              color: activeTab === 'monthly_sheet' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'monthly_sheet' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>1. Month-End Attendance & Wage Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'attendance' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
              color: activeTab === 'attendance' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'attendance' ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none',
              cursor: 'pointer'
            }}
          >
            <Calendar size={16} />
            <span>2. Daily Attendance Register</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'payroll' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: activeTab === 'payroll' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'payroll' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
              cursor: 'pointer'
            }}
          >
            <DollarSign size={16} />
            <span>3. Monthly Salary & Payslips</span>
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'advances' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: activeTab === 'advances' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'advances' ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
              cursor: 'pointer'
            }}
          >
            <CreditCard size={16} />
            <span>4. Staff Advance & Loan Ledger</span>
          </button>
        </div>

        {/* Date & Period Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeTab === 'attendance' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Date:</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: '150px' }}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Month:</span>
              <select
                className="form-select"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: '130px' }}
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {MONTH_NAMES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: '90px' }}
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {activeTab === 'monthly_sheet' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }} title="Standard working days in this month">
                    Working Days:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="form-input"
                    style={{ width: '60px', padding: '0.35rem 0.45rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: 700 }}
                    value={globalWorkingDays}
                    onChange={e => handleGlobalWorkingDaysChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONTH-END ATTENDANCE & WAGE SHEET (BULK MONTHLY INPUT & AUTO-CALC) */}
      {/* ========================================================================= */}
      {activeTab === 'monthly_sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Formula & Calculation Logic Guide Ribbon */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1.5px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.78rem',
            color: 'var(--text-main)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontWeight: 800, fontSize: '0.825rem' }}>
                <Calculator size={16} />
                <span>Salary Calculation Engine:</span>
              </div>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong>Per Day</strong> = Per Month ÷ 26
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                <strong style={{ color: '#60a5fa' }}>Basic Wage</strong> = Editable (₹400/day)
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong style={{ color: '#a78bfa' }}>Other Wage</strong> = Per Day - Basic
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong style={{ color: '#38bdf8' }}>Total Wage</strong> = Basic + Other + OT
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                <strong style={{ color: '#f87171' }}>EPF 12%</strong> = MIN(Basic × P, ₹15,000) × 12%
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
                <strong style={{ color: '#fb923c' }}>ESI 0.75%</strong> = MIN(Total, ₹21,000) × 0.75%
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <strong style={{ color: '#34d399' }}>Net Credit</strong> = Total - (EPF + ESI) - Adv + Bonus + Inc
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleAutoFillFullMonth}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)' }}
              >
                <Zap size={13} />
                <span>Set All 26 Present</span>
              </button>
            </div>
          </div>

          {/* Stat Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Net Salary Payout ({salaryMonthStr})
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalNet)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                {sheetStats.count} Staff Calculated
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Earned Gross Wages
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#818cf8', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalGross)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Basic + Others + OT pool
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total EPF Deductions (12%)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f87171', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalEpf)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                12% on Basic (Max ₹15k wage)
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total ESI Deductions (0.75%)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fb923c', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalEsi)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                0.75% on Total (Max ₹21k wage)
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Advances Deducted
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalAdvDeducted)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Staff loan recovery
              </span>
            </div>
          </div>

          {/* Month-End Attendance & Wage Editable Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Month-End Bulk Attendance & Wage Calculation Sheet ({salaryMonthStr})
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '250px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                    placeholder="Filter staff..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSaveMonthlySheet}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save & Calculate'}</span>
                </button>
              </div>
            </div>

            <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
              <table className="custom-table compact-sheet-table" style={{ minWidth: '2280px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>S.No</th>
                    <th style={{ width: '200px', minWidth: '190px' }}>Employee Name & ID</th>
                    <th style={{ width: '125px', minWidth: '120px', textAlign: 'right' }} title="Per Month Salary (Standard Gross)">Per Month (₹)</th>
                    <th style={{ width: '75px', minWidth: '70px', textAlign: 'center' }} title="Total Working Days in Month">W.Days</th>
                    <th style={{ width: '95px', minWidth: '90px', textAlign: 'right', color: '#818cf8' }} title="Per Day Rate = Per Month / W.Days">Per Day</th>
                    <th style={{ width: '120px', minWidth: '115px', textAlign: 'right', color: '#60a5fa' }} title="Basic Wage per day (Editable, e.g. ₹400)">Basic Wage (₹)</th>
                    <th style={{ width: '105px', minWidth: '100px', textAlign: 'right', color: '#a78bfa' }} title="Other Wage / Day = Per Day - Basic Wage">Other Wage</th>
                    <th style={{ width: '85px', minWidth: '80px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 800 }} title="Present Days (P)">P</th>
                    <th style={{ width: '85px', minWidth: '80px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }} title="Paid Leave (PL)">PL</th>
                    <th style={{ width: '85px', minWidth: '80px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 800 }} title="Absent Days (A / LOP)">A</th>
                    <th style={{ width: '80px', minWidth: '75px', textAlign: 'center' }} title="Overtime Hours">OT (h)</th>
                    <th style={{ width: '115px', minWidth: '110px', textAlign: 'right', color: '#60a5fa' }} title="Earned Basic = Basic Wage × Present Days">Earned Basic</th>
                    <th style={{ width: '115px', minWidth: '110px', textAlign: 'right', color: '#a78bfa' }} title="Earned Others = Other Wage × Present Days">Earned Others</th>
                    <th style={{ width: '120px', minWidth: '115px', textAlign: 'right', fontWeight: 800 }} title="Total Wages = Earned Basic + Earned Others + OT">Total Wages</th>
                    <th style={{ width: '110px', minWidth: '105px', textAlign: 'right', color: '#f87171' }} title="EPF = MIN(Earned Basic, ₹15,000) × 12%">EPF 12% (-)</th>
                    <th style={{ width: '105px', minWidth: '100px', textAlign: 'right', color: '#fb923c' }} title="ESI = MIN(Total Wages, ₹21,000) × 0.75%">ESI 0.75% (-)</th>
                    <th style={{ width: '120px', minWidth: '115px', textAlign: 'right', color: '#ec4899', fontWeight: 700 }} title="Deducted EPF & ESI = EPF + ESI">Deducted (EPF+ESI)</th>
                    <th style={{ width: '95px', minWidth: '90px', textAlign: 'right' }} title="Bonus">Bonus (+)</th>
                    <th style={{ width: '95px', minWidth: '90px', textAlign: 'right' }} title="Incentive">Incentive (+)</th>
                    <th style={{ width: '120px', minWidth: '115px', textAlign: 'right', color: '#818cf8', fontWeight: 800 }} title="Grand Total = Total Wages + Leave Wage + Bonus - (EPF + ESI)">Grand Total</th>
                    <th style={{ width: '110px', minWidth: '105px', textAlign: 'right', color: '#fbbf24' }} title="Advance Deducted this month">Adv Deducted</th>
                    <th style={{ width: '135px', minWidth: '130px', textAlign: 'right', background: 'rgba(16, 185, 129, 0.2)' }} title="Net Credit = Total Wage - Deducted EPF&ESI - Adv Deducted + Bonus + Incentive">Net Credit (=)</th>
                    <th style={{ width: '120px', minWidth: '115px', textAlign: 'right', background: 'rgba(251, 191, 36, 0.12)' }} title="Remaining Loan / Advance Balance">Bal Advance</th>
                    <th style={{ width: '85px', minWidth: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMonthlySheet.length === 0 ? (
                    <tr>
                      <td colSpan={24} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={32} style={{ margin: '0 auto 0.5rem auto', color: '#818cf8' }} />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No active employees found. Add employees in Employee Master first.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMonthlySheet.map((row, idx) => (
                      <tr key={row.employeeId || idx}>
                        {/* S.No */}
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>

                        {/* Name & ID */}
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            {row.employeeName}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#818cf8', display: 'flex', gap: '0.3rem' }}>
                            <span>{row.employeeNumber || 'ID #' + row.employeeId}</span>
                            <span>•</span>
                            <span>{row.designation || 'Staff'}</span>
                          </div>
                        </td>

                        {/* Per Month Salary (editable) */}
                        <td>
                          <input
                            type="number"
                            step="500"
                            className="table-num-input"
                            style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}
                            value={row.monthlySalary || 20000}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'monthlySalary', e.target.value)}
                            title="Monthly Gross Salary Standard"
                          />
                        </td>

                        {/* Total Working Days */}
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            className="table-num-input"
                            style={{ textAlign: 'center', fontWeight: 700 }}
                            value={row.totalWorkingDays}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'totalWorkingDays', e.target.value)}
                          />
                        </td>

                        {/* Per Day Rate (Calculated: Per Month / W.Days) */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#818cf8', fontSize: '0.8rem' }}>
                          ₹{formatCurrency(row.perDayRate)}
                        </td>

                        {/* Basic Wage / Day (Editable, default 400) */}
                        <td>
                          <input
                            type="number"
                            step="10"
                            className="table-num-input"
                            style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.45)', background: 'rgba(96, 165, 250, 0.06)' }}
                            value={row.basicRate !== undefined ? row.basicRate : 400}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'basicRate', e.target.value)}
                            title="Basic Wage per day (Editable)"
                          />
                        </td>

                        {/* Other Wage / Day (Calculated: Per Day - Basic Wage) */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#a78bfa', fontSize: '0.8rem' }}>
                          ₹{formatCurrency(row.othersRate)}
                        </td>

                        {/* Present Days (P) */}
                        <td style={{ background: 'rgba(16, 185, 129, 0.05)', textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={row.totalWorkingDays || 31}
                            className="table-num-input"
                            style={{ 
                              textAlign: 'center', 
                              fontWeight: 800, 
                              color: '#34d399',
                              borderColor: 'rgba(16, 185, 129, 0.5)',
                              background: 'rgba(16, 185, 129, 0.08)'
                            }}
                            value={row.presentDays !== undefined ? row.presentDays : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'presentDays', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Paid Leave Days (PL) */}
                        <td style={{ background: 'rgba(56, 189, 248, 0.05)', textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="table-num-input"
                            style={{ 
                              textAlign: 'center', 
                              fontWeight: 800, 
                              color: '#38bdf8',
                              borderColor: 'rgba(56, 189, 248, 0.5)',
                              background: 'rgba(56, 189, 248, 0.08)'
                            }}
                            value={row.leaveDays !== undefined ? row.leaveDays : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'leaveDays', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Absent Days (A) */}
                        <td style={{ background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="table-num-input"
                            style={{ 
                              textAlign: 'center', 
                              fontWeight: 800, 
                              color: '#f87171',
                              borderColor: 'rgba(239, 68, 68, 0.5)',
                              background: 'rgba(239, 68, 68, 0.08)'
                            }}
                            value={row.absentDays !== undefined ? row.absentDays : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'absentDays', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* OT Hours */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            className="table-num-input"
                            style={{ 
                              textAlign: 'center',
                              color: '#c084fc',
                              borderColor: 'rgba(192, 132, 252, 0.35)',
                              background: 'rgba(192, 132, 252, 0.05)'
                            }}
                            value={row.overtimeHours !== undefined ? row.overtimeHours : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'overtimeHours', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Earned Basic = Basic Rate × P */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.8rem' }}>
                          ₹{formatCurrency(row.earnedBasic)}
                        </td>

                        {/* Earned Others = Others Rate × P */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#a78bfa', fontSize: '0.8rem' }}>
                          ₹{formatCurrency(row.earnedOthers)}
                        </td>

                        {/* Total Wages = Earned Basic + Earned Others + OT */}
                        <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.825rem' }}>
                          ₹{formatCurrency(row.totalWages)}
                        </td>

                        {/* EPF (12% of Earned Basic, max ₹15k wage) */}
                        <td>
                          <input
                            type="number"
                            step="10"
                            className="table-num-input"
                            style={{ textAlign: 'right', color: '#f87171', fontFamily: 'monospace', fontWeight: 700, borderColor: 'rgba(248, 113, 113, 0.35)', background: 'rgba(248, 113, 113, 0.05)' }}
                            value={row.epf !== undefined ? row.epf : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'epf', e.target.value)}
                            title="EPF Deduction = MIN(Basic × P, 15000) × 12%"
                            placeholder="0"
                          />
                        </td>

                        {/* ESI (0.75% of Total Wages, max ₹21k wage) */}
                        <td>
                          <input
                            type="number"
                            step="5"
                            className="table-num-input"
                            style={{ textAlign: 'right', color: '#fb923c', fontFamily: 'monospace', fontWeight: 700, borderColor: 'rgba(251, 146, 60, 0.35)', background: 'rgba(251, 146, 60, 0.05)' }}
                            value={row.esi !== undefined ? row.esi : ''}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'esi', e.target.value)}
                            title="ESI Deduction = MIN(Total Wage, 21000) × 0.75%"
                            placeholder="0"
                          />
                        </td>

                        {/* Deducted EPF & ESI */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#ec4899', fontSize: '0.8rem' }}>
                          ₹{formatCurrency(row.epfAndEsi)}
                        </td>

                        {/* Bonus (+) */}
                        <td>
                          <input
                            type="number"
                            step="100"
                            className="table-num-input"
                            style={{ textAlign: 'right', fontFamily: 'monospace' }}
                            value={row.bonus !== undefined ? row.bonus : 0}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'bonus', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Incentive (+) */}
                        <td>
                          <input
                            type="number"
                            step="50"
                            className="table-num-input"
                            style={{ textAlign: 'right', fontFamily: 'monospace' }}
                            value={row.incentive !== undefined ? row.incentive : 0}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'incentive', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Grand Total = Total Wages + Leave Wage + Bonus - (EPF + ESI) */}
                        <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#818cf8', fontSize: '0.85rem' }}>
                          ₹{formatCurrency(row.grandTotal)}
                        </td>

                        {/* Adv Deducted (-) */}
                        <td>
                          <input
                            type="number"
                            step="100"
                            className="table-num-input"
                            style={{ textAlign: 'right', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, borderColor: 'rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.05)' }}
                            value={row.advDeducted !== undefined ? row.advDeducted : 0}
                            onChange={e => handleMonthlySheetFieldChange(row.employeeId, 'advDeducted', e.target.value)}
                            placeholder="0"
                          />
                        </td>

                        {/* Net Credit (=) = Total Wage + Leave Wage - (EPF+ESI) - Adv Deducted + Bonus + Incentive */}
                        <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.925rem', fontFamily: 'monospace', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}>
                          ₹{formatCurrency(row.netCredit)}
                        </td>

                        {/* Balance Advance */}
                        <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.08)' }}>
                          ₹{formatCurrency(row.balanceAdvance)}
                        </td>

                        {/* Actions: View / Print Official Payslip */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setPrintSlipSalary(row)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                            title="Print Official Payslip"
                          >
                            <Printer size={13} />
                            <span>Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Floating Save Action Bar */}
            <div style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(0, 0, 0, 0.35)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Info size={15} color="#38bdf8" />
                <span>Formulas are live calculated. Click <strong>"Save Monthly Attendance & Update Payroll"</strong> to persist to records & slip print.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={handleSaveMonthlySheet}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving Records...' : `Save Monthly Attendance & Update Payroll`}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="#34d399" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Daily Attendance Roster for {selectedDate} ({editedAttendance.length} Staff on Roll)
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span>
                Present: <strong>{editedAttendance.filter(a => a.status === 'PRESENT').length}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }}></span>
                Absent / LOP: <strong>{editedAttendance.filter(a => a.status === 'ABSENT').length}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span>
                Paid Leave: <strong>{editedAttendance.filter(a => a.status === 'PAID_LEAVE').length}</strong>
              </span>
            </div>
          </div>

          <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
            <table className="custom-table" style={{ minWidth: '950px' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th style={{ width: '220px' }}>Employee Name & ID</th>
                  <th style={{ width: '180px' }}>Designation / Role</th>
                  <th style={{ width: '280px', textAlign: 'center' }}>Attendance Status</th>
                  <th style={{ width: '110px' }}>In Time</th>
                  <th style={{ width: '110px' }}>Out Time</th>
                  <th style={{ width: '100px' }}>OT (Hours)</th>
                  <th>Daily Remarks</th>
                </tr>
              </thead>
              <tbody>
                {editedAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Users size={32} style={{ margin: '0 auto 0.5rem auto', color: '#818cf8' }} />
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No active employees found. Add employees in Employee Master first.</p>
                    </td>
                  </tr>
                ) : (
                  editedAttendance.map((emp, idx) => (
                    <tr key={emp.employeeId || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {emp.employeeName}
                        </div>
                        {emp.employeeNumber && (
                          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#818cf8' }}>
                            {emp.employeeNumber}
                          </span>
                        )}
                      </td>

                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {emp.designation || 'Staff'}
                      </td>

                      {/* Status Badges Selectors */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handleDailyStatusChange(emp.employeeId, 'PRESENT')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: emp.status === 'PRESENT' ? '#10b981' : 'transparent',
                              color: emp.status === 'PRESENT' ? '#ffffff' : 'var(--text-muted)'
                            }}
                            title="Present (Full Day)"
                          >
                            P (Present)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDailyStatusChange(emp.employeeId, 'ABSENT')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: emp.status === 'ABSENT' ? '#ef4444' : 'transparent',
                              color: emp.status === 'ABSENT' ? '#ffffff' : 'var(--text-muted)'
                            }}
                            title="Absent / Loss of Pay (LOP)"
                          >
                            A (LOP)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDailyStatusChange(emp.employeeId, 'HALF_DAY')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: emp.status === 'HALF_DAY' ? '#f59e0b' : 'transparent',
                              color: emp.status === 'HALF_DAY' ? '#ffffff' : 'var(--text-muted)'
                            }}
                            title="Half Day (0.5 Day)"
                          >
                            HD
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDailyStatusChange(emp.employeeId, 'PAID_LEAVE')}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: emp.status === 'PAID_LEAVE' ? '#0ea5e9' : 'transparent',
                              color: emp.status === 'PAID_LEAVE' ? '#ffffff' : 'var(--text-muted)'
                            }}
                            title="Paid Leave (Leave Wage eligible)"
                          >
                            PL
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDailyStatusChange(emp.employeeId, 'HOLIDAY')}
                            style={{
                              padding: '3px 6px',
                              borderRadius: '6px',
                              fontSize: '0.725rem',
                              border: 'none',
                              cursor: 'pointer',
                              background: emp.status === 'HOLIDAY' ? '#8b5cf6' : 'transparent',
                              color: emp.status === 'HOLIDAY' ? '#ffffff' : 'var(--text-subtle)'
                            }}
                            title="Official Holiday"
                          >
                            H
                          </button>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => setTimePickerConfig({
                            isOpen: true,
                            employeeId: emp.employeeId,
                            employeeName: emp.employeeName,
                            field: 'inTime',
                            initialTime: emp.inTime || '09:00',
                            title: `${emp.employeeName} - Set In Time`
                          })}
                          className="btn btn-outline"
                          style={{
                            padding: '0.28rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.08)',
                            borderColor: 'rgba(56, 189, 248, 0.35)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                          title="Click to open Analog Clock Time Picker"
                        >
                          <Clock size={13} />
                          <span>{format12Hour(emp.inTime)}</span>
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => setTimePickerConfig({
                            isOpen: true,
                            employeeId: emp.employeeId,
                            employeeName: emp.employeeName,
                            field: 'outTime',
                            initialTime: emp.outTime || '18:00',
                            title: `${emp.employeeName} - Set Out Time`
                          })}
                          className="btn btn-outline"
                          style={{
                            padding: '0.28rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#c084fc',
                            background: 'rgba(192, 132, 252, 0.08)',
                            borderColor: 'rgba(192, 132, 252, 0.35)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                          title="Click to open Analog Clock Time Picker"
                        >
                          <Clock size={13} />
                          <span>{format12Hour(emp.outTime)}</span>
                        </button>
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.5"
                          className="form-input"
                          style={{ padding: '0.25rem 0.4rem', fontSize: '0.8rem', textAlign: 'center' }}
                          value={emp.overtimeHours}
                          onChange={e => handleDailyAttendanceFieldChange(emp.employeeId, 'overtimeHours', parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                          placeholder="Optional remarks..."
                          value={emp.remarks}
                          onChange={e => handleDailyAttendanceFieldChange(emp.employeeId, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MONTHLY SALARY & PAYROLL GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Net Payout ({salaryMonthStr})
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalNet)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                {sheetStats.paidCount} of {sheetStats.count} Paid
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Gross Wages
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#818cf8', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalGross)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Base standard payroll
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total EPF & ESI Deductions
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f87171', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalEpfEsi)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Statutory compliance
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Advance Balance
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px', fontFamily: 'monospace' }}>
                Rs. {formatCurrency(sheetStats.totalBalanceAdvance)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Active staff loans
              </span>
            </div>
          </div>

          {/* Salaries Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} color="#34d399" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Salary Register & Payslip Summary ({salaryMonthStr})
                </h3>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                  placeholder="Search employee, ID, role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
              <table className="custom-table compact-sheet-table" style={{ minWidth: '1650px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>S.No</th>
                    <th style={{ width: '180px' }}>Employee Full Name</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Per Month (₹)</th>
                    <th style={{ width: '90px', textAlign: 'right', color: '#818cf8' }}>Per Day</th>
                    <th style={{ width: '85px', textAlign: 'right', color: '#60a5fa' }}>Basic / Day</th>
                    <th style={{ width: '85px', textAlign: 'right', color: '#a78bfa' }}>Other / Day</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>P / PL / A</th>
                    <th style={{ width: '110px', textAlign: 'right', fontWeight: 800 }}>Total Wages</th>
                    <th style={{ width: '95px', textAlign: 'right', color: '#f87171' }}>EPF 12%</th>
                    <th style={{ width: '90px', textAlign: 'right', color: '#fb923c' }}>ESI 0.75%</th>
                    <th style={{ width: '100px', textAlign: 'right', color: '#ec4899', fontWeight: 700 }}>Deducted (EPF+ESI)</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Bonus & Inc.</th>
                    <th style={{ width: '110px', textAlign: 'right', color: '#818cf8', fontWeight: 800 }}>Grand Total</th>
                    <th style={{ width: '100px', textAlign: 'right', color: '#fbbf24' }}>Adv Deducted</th>
                    <th style={{ width: '125px', textAlign: 'right', background: 'rgba(16, 185, 129, 0.15)', fontWeight: 900 }}>Net Credit</th>
                    <th style={{ width: '115px', textAlign: 'right', background: 'rgba(251, 191, 36, 0.12)' }}>Balance Advance</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={18} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <DollarSign size={32} style={{ margin: '0 auto 0.6rem auto', color: '#34d399' }} />
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>No saved salary records found for {salaryMonthStr}.</p>
                        <button onClick={handleGenerateSalaries} className="btn btn-primary" style={{ fontSize: '0.825rem', margin: '0 auto' }}>
                          <Zap size={14} />
                          <span>Generate {salaryMonthStr} Payroll</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredSalaries.map((sal, idx) => (
                      <tr key={sal.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>

                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {sal.employeeName}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#818cf8', display: 'flex', gap: '0.3rem' }}>
                            <span>{sal.employeeNumber || 'ID #' + sal.employeeId}</span>
                            <span>•</span>
                            <span>{sal.designation || 'Staff'}</span>
                          </div>
                        </td>

                        {/* Monthly Salary */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                          ₹{formatCurrency(sal.monthlySalary || sal.totalWages || 20000)}
                        </td>

                        {/* Per Day Rate */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#818cf8', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.perDayRate || (sal.totalWages && sal.totalWorkingDays ? sal.totalWages / sal.totalWorkingDays : 769.23))}
                        </td>

                        {/* Basic / Day */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.basicRate !== undefined ? sal.basicRate : 400)}
                        </td>

                        {/* Other / Day */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#a78bfa', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.othersRate !== undefined ? sal.othersRate : Math.max(0, (sal.perDayRate || 769.23) - (sal.basicRate || 400)))}
                        </td>

                        {/* Attendance Roster Summary */}
                        <td style={{ textAlign: 'center', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                          <span style={{ color: '#34d399', fontWeight: 800 }}>{sal.presentDays || 0}P</span>
                          {' / '}
                          <span style={{ color: '#38bdf8' }}>{sal.leaveDays || 0}PL</span>
                          {' / '}
                          <span style={{ color: '#f87171' }}>{sal.absentDays || 0}A</span>
                        </td>

                        {/* Total Wages */}
                        <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                          ₹{formatCurrency(sal.totalWages)}
                        </td>

                        {/* EPF 12% */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#f87171', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.epf || 0)}
                        </td>

                        {/* ESI 0.75% */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fb923c', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.esi || 0)}
                        </td>

                        {/* Deducted EPF & ESI */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#ec4899', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.epfAndEsi || ((sal.epf || 0) + (sal.esi || 0)))}
                        </td>

                        {/* Bonus & Incentive */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: (sal.bonus > 0 || sal.incentive > 0) ? '#34d399' : 'var(--text-muted)' }}>
                          ₹{formatCurrency((sal.bonus || 0) + (sal.incentive || 0))}
                        </td>

                        {/* Grand Total */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#818cf8', fontWeight: 800 }}>
                          ₹{formatCurrency(sal.grandTotal || (sal.totalWages - (sal.epfAndEsi || 0)))}
                        </td>

                        {/* Adv Deducted */}
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>
                          ₹{formatCurrency(sal.advDeducted)}
                        </td>

                        {/* Net Credit */}
                        <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', fontFamily: 'monospace', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}>
                          ₹{formatCurrency(sal.netCredit)}
                        </td>

                        {/* Balance Advance */}
                        <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>
                          ₹{formatCurrency(sal.balanceAdvance)}
                        </td>

                        {/* Payment Status */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentStatus(sal)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: sal.paymentStatus === 'PAID' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                              color: sal.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24'
                            }}
                            title="Click to toggle Paid/Pending"
                          >
                            {sal.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                          </button>
                        </td>

                        {/* Action: View & Print Official Slip */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setPrintSlipSalary(sal)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                            title="View & Print Official Payslip"
                          >
                            <Printer size={13} />
                            <span>Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STAFF ADVANCE & LOAN LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'advances' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(500px, 2fr)', gap: '1.25rem' }}>
          
          {/* Left Side: Staff List with Running Balance */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Staff Loan Balances
              </h3>
              <button
                onClick={() => setAdvanceModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <Plus size={13} />
                <span>New Advance</span>
              </button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
              {employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').map(emp => {
                const isSelected = selectedEmployeeForLedger && selectedEmployeeForLedger.id === emp.id;
                const bal = advanceBalances[emp.id] || 0;
                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmployeeForLedger(emp);
                      loadAdvanceLedger(emp.id);
                    }}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderBottom: '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                        {emp.employeeName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {emp.employeeNumber || 'ID #' + emp.id} • {emp.designation || 'Staff'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
                        Rs. {formatCurrency(bal)}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>
                        Balance Loan
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Detailed Transaction History for Selected Staff */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Advance Statement: {selectedEmployeeForLedger ? selectedEmployeeForLedger.employeeName : 'Select Staff'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  History of loans taken, monthly salary deductions, and direct repayments.
                </p>
              </div>

              {selectedEmployeeForLedger && (
                <button
                  onClick={() => setAdvanceModalOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                >
                  <Plus size={13} />
                  <span>Add Transaction</span>
                </button>
              )}
            </div>

            <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto', flex: 1 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>Date</th>
                    <th style={{ width: '160px' }}>Transaction Type</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Balance After</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {advanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CreditCard size={30} style={{ margin: '0 auto 0.5rem auto', color: '#fbbf24' }} />
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>No advance or loan records found for this employee.</p>
                      </td>
                    </tr>
                  ) : (
                    advanceHistory.map((adv, idx) => {
                      const isLoan = adv.transactionType === 'LOAN_GIVEN';
                      return (
                        <tr key={adv.id || idx}>
                          <td style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                            {adv.advanceDate}
                          </td>

                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isLoan ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                              color: isLoan ? '#fbbf24' : '#34d399'
                            }}>
                              {isLoan ? '📤 Loan Given' : '📥 Repaid / Deducted'}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: isLoan ? '#fbbf24' : '#34d399' }}>
                            {isLoan ? '+' : '-'} Rs. {formatCurrency(adv.amount)}
                          </td>

                          <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                            Rs. {formatCurrency(adv.balanceAfter)}
                          </td>

                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {adv.description || adv.salaryMonth || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
