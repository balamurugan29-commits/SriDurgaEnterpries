import React, { useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  ShieldCheck, 
  Landmark, 
  User, 
  Calendar, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';

export const SalarySlipPrintModal = ({ isOpen, onClose, salary, companyDetails = {} }) => {
  const printRef = useRef(null);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !salary) return null;

  const formatCurrency = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('salary-slip-printable-area');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Salary Slip - ${salary.employeeName || 'Staff'} (${salary.salaryMonth || 'Monthly'})</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 10px;
                color: #000000;
                background: #ffffff;
                font-size: 13px;
                line-height: 1.4;
              }
              .slip-card {
                border: 2px solid #000000;
                max-width: 580px;
                margin: 0 auto;
                padding: 18px 24px;
                background: #ffffff;
              }
              .company-header {
                text-align: center;
                border-bottom: 2px solid #000000;
                padding-bottom: 10px;
                margin-bottom: 12px;
              }
              .company-title {
                font-size: 18px;
                font-weight: 900;
                letter-spacing: 0.5px;
                margin: 0;
                text-transform: uppercase;
              }
              .company-sub {
                font-size: 11px;
                color: #333333;
                margin-top: 3px;
              }
              .slip-title {
                text-align: center;
                margin-bottom: 12px;
              }
              .emp-name {
                font-size: 16px;
                font-weight: 900;
                margin: 0;
                text-transform: capitalize;
              }
              .salary-month {
                font-size: 13px;
                font-weight: 700;
                color: #222222;
                margin: 2px 0 0 0;
              }
              .meta-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
                font-size: 11.5px;
                border-bottom: 1px solid #000000;
                padding-bottom: 10px;
                margin-bottom: 12px;
              }
              .salary-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
              }
              .salary-table th, .salary-table td {
                border: 1px solid #000000;
                padding: 7px 12px;
                font-size: 13px;
              }
              .salary-table td.label-col {
                font-weight: 600;
                width: 55%;
              }
              .salary-table td.amount-col {
                font-weight: 700;
                text-align: right;
                font-family: monospace, sans-serif;
                font-size: 13.5px;
              }
              .highlight-row {
                background-color: #f1f5f9 !important;
                font-weight: 900 !important;
                font-size: 14px !important;
              }
              .sign-grid {
                display: flex;
                justify-content: space-between;
                margin-top: 35px;
                padding-top: 10px;
              }
              .sign-box {
                text-align: center;
                width: 180px;
                border-top: 1px dashed #000000;
                padding-top: 5px;
                font-size: 11px;
                font-weight: 700;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const companyName = companyDetails.companyName || 'SRI DURGA ENTERPRISES';
  const companyAddress = companyDetails.address || '# 10, V.G. NAGAR, KOVILPATHU, KARAIKAL - 609 605.';
  const companyPhone = companyDetails.phone || '04368 - 225786 / 94432 87986';

  return (
    <div 
      className="no-print-modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card-solid)',
          border: '1.5px solid rgba(99, 102, 241, 0.45)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Modal Toolbar Header */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '0.55rem',
              borderRadius: '10px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
            }}>
              <Printer size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Salary Slip: {salary.employeeName}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Period: <strong>{salary.salaryMonth}</strong> • Net Pay: <strong>Rs. {formatCurrency(salary.netCredit)}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.825rem',
                padding: '0.45rem 1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 700
              }}
            >
              <Printer size={15} />
              <span>Print Slip</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Area Preview */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#0b1120' }}>
          
          <div 
            id="salary-slip-printable-area" 
            ref={printRef}
            style={{
              background: '#ffffff',
              color: '#000000',
              padding: '24px 28px',
              borderRadius: '8px',
              border: '2px solid #000000',
              maxWidth: '520px',
              margin: '0 auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
            }}
          >
            {/* 1. Header with Company Details */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {companyName}
              </div>
              <div style={{ fontSize: '11px', color: '#444444', marginTop: '2px' }}>
                {companyAddress} • Ph: {companyPhone}
              </div>
            </div>

            {/* 2. Employee Title & Salary Month (Matching Screenshot Exactly) */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'capitalize', color: '#000000' }}>
                {salary.employeeName}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#222222', marginTop: '2px' }}>
                Salary {salary.salaryMonth || 'August - 2026'}
              </div>
            </div>

            {/* 3. Employee Meta Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 12px',
              fontSize: '11px',
              borderBottom: '1px solid #000000',
              paddingBottom: '8px',
              marginBottom: '14px'
            }}>
              <div>
                <strong>Staff ID:</strong> {salary.employeeNumber || 'N/A'}
              </div>
              <div>
                <strong>Designation:</strong> {salary.designation || 'Staff'}
              </div>
              {salary.bankName && (
                <div>
                  <strong>Bank:</strong> {salary.bankName}
                </div>
              )}
              {salary.accountNumber && (
                <div>
                  <strong>A/C No:</strong> {salary.accountNumber}
                </div>
              )}
              {salary.epfNumber && (
                <div>
                  <strong>EPF / UAN:</strong> {salary.epfNumber}
                </div>
              )}
              {salary.esiNumber && (
                <div>
                  <strong>ESI No:</strong> {salary.esiNumber}
                </div>
              )}
            </div>

            {/* 4. Salary Calculation Table (EXACT FORMAT MATCH) */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000000',
              marginBottom: '16px'
            }}>
              <tbody>
                {/* Rate Structure Row */}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12px', width: '55%' }}>
                    Per Month Standard / W.Days
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>
                    Rs. {formatCurrency(salary.monthlySalary || salary.totalWages || 20000)} / {salary.totalWorkingDays || 26} Days
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12px' }}>
                    Per Day Rate (Basic + Other)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12px', fontFamily: 'monospace' }}>
                    Rs. {formatCurrency(salary.perDayRate || 769.23)}/day (Basic: Rs. {formatCurrency(salary.basicRate !== undefined ? salary.basicRate : 400)} + Other: Rs. {formatCurrency(salary.othersRate !== undefined ? salary.othersRate : Math.max(0, (salary.perDayRate || 769.23) - (salary.basicRate || 400)))})
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                    Attendance Summary
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                    Present: <strong>{salary.presentDays || 0}</strong> | PL: <strong>{salary.leaveDays || 0}</strong> | Abs: <strong>{salary.absentDays || 0}</strong>
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                    Earned Basic (Basic × Present)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                    Rs. {formatCurrency(salary.earnedBasic !== undefined ? salary.earnedBasic : ((salary.basicRate || 400) * (salary.presentDays || 0)))}
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                    Earned Others (Other × Present)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                    Rs. {formatCurrency(salary.earnedOthers !== undefined ? salary.earnedOthers : ((salary.othersRate || 369.23) * (salary.presentDays || 0)))}
                  </td>
                </tr>

                {salary.otAmount > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                      Overtime Wages ({salary.overtimeHours || 0} Hours)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                      Rs. {formatCurrency(salary.otAmount)}
                    </td>
                  </tr>
                )}

                <tr style={{ background: '#f1f5f9' }}>
                  <td style={{ padding: '7px 12px', border: '1px solid #000000', fontWeight: 800, fontSize: '13px' }}>
                    Total Earned Wages
                  </td>
                  <td style={{ padding: '7px 12px', border: '1px solid #000000', fontWeight: 800, textAlign: 'right', fontSize: '13px', fontFamily: 'monospace' }}>
                    Rs. {formatCurrency(salary.totalWages)}
                  </td>
                </tr>

                {salary.leaveWage > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                      Leave Wage (+)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                      Rs. {formatCurrency(salary.leaveWage)}
                    </td>
                  </tr>
                )}

                {salary.bonus > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                      Bonus (+)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                      Rs. {formatCurrency(salary.bonus)}
                    </td>
                  </tr>
                )}

                {salary.incentive > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                      Incentive (+)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                      Rs. {formatCurrency(salary.incentive)}
                    </td>
                  </tr>
                )}

                {/* Deductions */}
                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                    EPF Deduction (12% of Basic, Max ₹15k wage) (-)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#b91c1c' }}>
                    Rs. {formatCurrency(salary.epf || 0)}
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                    ESIC Deduction (0.75% of Total, Max ₹21k wage) (-)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#b91c1c' }}>
                    Rs. {formatCurrency(salary.esi || 0)}
                  </td>
                </tr>

                <tr style={{ background: '#fef2f2' }}>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, fontSize: '12.5px', color: '#991b1b' }}>
                    Total Deductions (EPF + ESI) (-)
                  </td>
                  <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#991b1b' }}>
                    Rs. {formatCurrency(salary.epfAndEsi || ((salary.epf || 0) + (salary.esi || 0)))}
                  </td>
                </tr>

                {salary.grandTotal > 0 && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 800, fontSize: '12.5px' }}>
                      Grand Total (Total + Leave Wage + Bonus - EPF - ESI)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 800, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#1e3a8a' }}>
                      Rs. {formatCurrency(salary.grandTotal)}
                    </td>
                  </tr>
                )}

                {salary.advDeducted > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 600, fontSize: '12.5px' }}>
                      Advance Deducted (-)
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#b91c1c' }}>
                      Rs. {formatCurrency(salary.advDeducted)}
                    </td>
                  </tr>
                )}

                <tr style={{ background: '#f1f5f9' }}>
                  <td style={{ padding: '8px 12px', border: '1.5px solid #000000', fontWeight: 900, fontSize: '13.5px', textTransform: 'uppercase' }}>
                    Net Credit (Take-Home Pay)
                  </td>
                  <td style={{ padding: '8px 12px', border: '1.5px solid #000000', fontWeight: 900, textAlign: 'right', fontSize: '14.5px', fontFamily: 'monospace', color: '#047857' }}>
                    Rs. {formatCurrency(salary.netCredit)}
                  </td>
                </tr>

                {salary.balanceAdvance > 0 && (
                  <tr style={{ background: '#fffbeb' }}>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 700, fontSize: '12px' }}>
                      Remaining Advance / Loan Balance
                    </td>
                    <td style={{ padding: '6px 12px', border: '1px solid #000000', fontWeight: 900, textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', color: '#b45309' }}>
                      Rs. {formatCurrency(salary.balanceAdvance)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 5. Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '160px', borderTop: '1px dashed #000000', paddingTop: '5px', fontSize: '11px', fontWeight: 700 }}>
                Employee Signature
              </div>
              <div style={{ textAlign: 'center', width: '160px', borderTop: '1px dashed #000000', paddingTop: '5px', fontSize: '11px', fontWeight: 700 }}>
                Authorized Signatory
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Status: <strong style={{ color: salary.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24' }}>{salary.paymentStatus || 'PENDING'}</strong> {salary.paymentDate ? `(${salary.paymentDate})` : ''}
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}>
              Close
            </button>
            <button 
              onClick={handlePrint} 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>Print Salary Slip</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
