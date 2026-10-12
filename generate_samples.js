const fs = require('fs');
const path = require('path');
const XLSX = require('./Pixel/xlsx.full.min.js');

const sampleRows = [
  { USN: '1RV22CS142', Name: 'Sneha Reddy', Department: 'Computer Science', Semester: 5, TotalClasses: 250, AttendedClasses: 206, AttendancePct: 82.4, Status: 'Eligible' },
  { USN: '1RV22CS155', Name: 'Rohan Das', Department: 'Computer Science', Semester: 5, TotalClasses: 250, AttendedClasses: 215, AttendancePct: 86.0, Status: 'Eligible' },
  { USN: '1RV22CS108', Name: 'Ananya Iyer', Department: 'Computer Science', Semester: 5, TotalClasses: 250, AttendedClasses: 228, AttendancePct: 91.2, Status: 'Eligible' },
  { USN: '1RV22CS190', Name: 'Vikram Malhotra', Department: 'Computer Science', Semester: 5, TotalClasses: 250, AttendedClasses: 198, AttendancePct: 79.2, Status: 'Eligible' },
  { USN: '1RV22EC078', Name: 'Karthik Verma', Department: 'Electronics', Semester: 5, TotalClasses: 240, AttendedClasses: 164, AttendancePct: 68.3, Status: 'Conditional/Ineligible' },
  { USN: '1RV22EC045', Name: 'Pooja Hegde', Department: 'Electronics', Semester: 5, TotalClasses: 240, AttendedClasses: 202, AttendancePct: 84.2, Status: 'Eligible' },
  { USN: '1RV22EC112', Name: 'Aditya Rao', Department: 'Electronics', Semester: 5, TotalClasses: 240, AttendedClasses: 190, AttendancePct: 79.2, Status: 'Eligible' },
  { USN: '1RV22ME032', Name: 'Meera Nambiar', Department: 'Mechanical', Semester: 5, TotalClasses: 230, AttendedClasses: 178, AttendancePct: 77.4, Status: 'Eligible' },
  { USN: '1RV22ME089', Name: 'Devendra Patel', Department: 'Mechanical', Semester: 5, TotalClasses: 230, AttendedClasses: 188, AttendancePct: 81.7, Status: 'Eligible' },
  { USN: '1RV22IS024', Name: 'Tanvi Saxena', Department: 'Information Science', Semester: 5, TotalClasses: 245, AttendedClasses: 212, AttendancePct: 86.5, Status: 'Eligible' },
  { USN: '1RV22IS091', Name: 'Farhan Akhtar', Department: 'Information Science', Semester: 5, TotalClasses: 245, AttendedClasses: 165, AttendancePct: 67.3, Status: 'Conditional/Ineligible' },
  { USN: '1RV22DS015', Name: 'Aarav Gupta', Department: 'Design & AI', Semester: 5, TotalClasses: 220, AttendedClasses: 194, AttendancePct: 88.2, Status: 'Eligible' },
  { USN: '1RV22ERR01', Name: 'Error Sample Row', Department: 'Computer Science', Semester: 5, TotalClasses: 200, AttendedClasses: 240, AttendancePct: 120.0, Status: 'Error: Attended > Total' }
];

// Write CSV
const csvHeader = 'USN,Name,Department,Semester,TotalClasses,AttendedClasses,AttendancePct,Status\n';
const csvContent = csvHeader + sampleRows.map(r => `${r.USN},"${r.Name}","${r.Department}",${r.Semester},${r.TotalClasses},${r.AttendedClasses},${r.AttendancePct},"${r.Status}"`).join('\n');

fs.writeFileSync(path.join(__dirname, 'Pixel', 'sample_attendance.csv'), csvContent);
fs.writeFileSync(path.join(__dirname, 'sample_attendance.csv'), csvContent);

// Write XLSX via buffer
const ws = XLSX.utils.json_to_sheet(sampleRows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'AttendanceData');
const xlsxBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync(path.join(__dirname, 'Pixel', 'sample_attendance.xlsx'), xlsxBuf);
fs.writeFileSync(path.join(__dirname, 'sample_attendance.xlsx'), xlsxBuf);

console.log('Sample CSV and XLSX successfully created in both Pixel and root!');
