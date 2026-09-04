import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock } from 'lucide-react';

/**
 * Material / Mobile Style Circular Analog Clock Time Picker Modal
 * Supports Hours (1-12) & Minutes (00-59), AM/PM toggles, smooth pointer dragging/clicking,
 * auto-transition from Hour to Minute mode, and keyboard Escape to close.
 */
export const ClockTimePickerModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialTime = '09:00',
  title = 'Select Time'
}) => {
  // Parse initial 24h string into 12h representation
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 9, minute: 0, period: 'AM' };
    const parts = timeStr.split(':');
    let h24 = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h24)) h24 = 9;
    if (isNaN(m)) m = 0;

    const period = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    return { hour: h12, minute: m, period };
  };

  const [mode, setMode] = useState('hours'); // 'hours' | 'minutes'
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [isDragging, setIsDragging] = useState(false);

  const clockRef = useRef(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseTime(initialTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
      setMode('hours');
    }
  }, [isOpen, initialTime]);

  // Escape key handler
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

  if (!isOpen) return null;

  // Clock constants
  const CLOCK_SIZE = 260;
  const CENTER = CLOCK_SIZE / 2;
  const RADIUS = 92;

  // Compute angle from center based on client coordinates
  const calculateAngleAndValue = (clientX, clientY) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const x = clientX - (rect.left + CENTER);
    const y = clientY - (rect.top + CENTER);

    // Calculate angle in degrees (0 deg is top / 12 o'clock)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      setSelectedHour(h);
    } else {
      let m = Math.round(angle / 6) % 60;
      setSelectedMinute(m);
    }
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    calculateAngleAndValue(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    calculateAngleAndValue(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Auto-advance from hours to minutes
      if (mode === 'hours') {
        setMode('minutes');
      }
    }
  };

  // Convert currently selected 12h time back to 24h formatted string 'HH:mm'
  const handleConfirm = () => {
    let h24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour < 12) {
      h24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      h24 = 0;
    }

    const formatted24 = `${String(h24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onConfirm(formatted24);
    onClose();
  };

  // Angle calculations for the pointer hand
  const currentAngle = mode === 'hours'
    ? (selectedHour % 12) * 30 - 90
    : (selectedMinute * 6) - 90;

  const currentRad = (currentAngle * Math.PI) / 180;
  const pointerX = CENTER + RADIUS * Math.cos(currentRad);
  const pointerY = CENTER + RADIUS * Math.sin(currentRad);

  // Hour marks (1 to 12)
  const hourMarks = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Minute marks (00, 05, 10, 15, ..., 55)
  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.18s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.15))',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2)',
          width: '100%',
          maxWidth: '340px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          userSelect: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Top Header: Time Digits & AM/PM Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
          
          {/* Time Display Capsule [ HH : MM ] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            borderRadius: '14px',
            padding: '4px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setMode('hours')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'hours' ? '#3b82f6' : 'transparent',
                color: mode === 'hours' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                boxShadow: mode === 'hours' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {String(selectedHour).padStart(2, '0')}
            </button>

            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', padding: '0 2px' }}>
              :
            </span>

            <button
              type="button"
              onClick={() => setMode('minutes')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'minutes' ? '#3b82f6' : 'transparent',
                color: mode === 'minutes' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                boxShadow: mode === 'minutes' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {String(selectedMinute).padStart(2, '0')}
            </button>
          </div>

          {/* AM / PM Capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            borderRadius: '14px',
            padding: '4px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setSelectedPeriod('AM')}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: selectedPeriod === 'AM' ? '#3b82f6' : 'transparent',
                color: selectedPeriod === 'AM' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                boxShadow: selectedPeriod === 'AM' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              AM
            </button>

            <button
              type="button"
              onClick={() => setSelectedPeriod('PM')}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: selectedPeriod === 'PM' ? '#3b82f6' : 'transparent',
                color: selectedPeriod === 'PM' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                boxShadow: selectedPeriod === 'PM' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              PM
            </button>
          </div>

        </div>

        {/* Circular Clock Dial Face */}
        <div
          ref={clockRef}
          onPointerDown={handlePointerDown}
          style={{
            position: 'relative',
            width: `${CLOCK_SIZE}px`,
            height: `${CLOCK_SIZE}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'inset 0 4px 14px rgba(0, 0, 0, 0.35)',
            touchAction: 'none',
            cursor: 'crosshair',
            overflow: 'hidden'
          }}
        >
          {/* SVG Clock Hand & Center Pivot */}
          <svg
            width={CLOCK_SIZE}
            height={CLOCK_SIZE}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            {/* Center Pivot Dot */}
            <circle cx={CENTER} cy={CENTER} r="4" fill="#3b82f6" />

            {/* Line pointer */}
            <line
              x1={CENTER}
              y1={CENTER}
              x2={pointerX}
              y2={pointerY}
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Selected Target Bubble */}
            <circle
              cx={pointerX}
              cy={pointerY}
              r="17"
              fill="#3b82f6"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.6))' }}
            />
          </svg>

          {/* Clock Face Numbers */}
          {(mode === 'hours' ? hourMarks : minuteMarks).map((val) => {
            const angleDeg = mode === 'hours'
              ? (val % 12) * 30 - 90
              : (val * 6) - 90;
            
            const rad = (angleDeg * Math.PI) / 180;
            const x = CENTER + RADIUS * Math.cos(rad);
            const y = CENTER + RADIUS * Math.sin(rad);

            const isSelected = mode === 'hours'
              ? selectedHour === val
              : selectedMinute === val;

            return (
              <div
                key={val}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: isSelected ? 900 : 600,
                  color: isSelected ? '#ffffff' : 'var(--text-main, #e2e8f0)',
                  pointerEvents: 'none',
                  transition: 'color 0.1s ease',
                  zIndex: 2
                }}
              >
                {mode === 'minutes' ? String(val).padStart(2, '0') : val}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Separator & Buttons */}
        <div style={{
          width: '100%',
          borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: 'transparent',
              border: '1.5px solid rgba(147, 51, 234, 0.45)',
              color: '#c084fc',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: '0.55rem 1.35rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.45)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
};
