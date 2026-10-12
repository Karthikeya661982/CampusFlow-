// CampusFlow — Technical Event Participation Approval and Attendance Monitoring Engine
(function () {
  'use strict';

  // --- Constants & System Roles ---
  const DEFAULT_USERS = {
    admin: {
      id: 'A2001',
      name: 'Arjun Sharma',
      role: 'admin',
      title: 'Technical Event In-Charge',
      avatar: 'AS',
      avatarClass: 'admin-avatar',
      dept: 'Engineering & Technology'
    },
    proctor: {
      id: 'P1001',
      name: 'Dr. Alan Smith',
      role: 'proctor',
      title: 'Senior Faculty Proctor',
      avatar: 'AS',
      avatarClass: 'proctor-avatar',
      dept: 'Computer Science',
      assignedStudents: ['25EU02094', '1RV22CS142', '1RV22CS155', '1RV22CS108', '1RV22CS190', '1RV22IS024', '1RV22IS091']
    },
    student: {
      id: '25EU02094',
      name: 'Madupu Karthikeya',
      role: 'student',
      title: 'B.Tech CSE - AIML (Sem IV)',
      avatar: 'MK',
      avatarClass: 'student-avatar',
      dept: 'Computer Science',
      yearSection: 'IV-AIML',
      proctor: 'Dr. Alan Smith'
    }
  };

  // Canonical sample student registry (Roll Number is primary key)
  const INITIAL_STUDENTS = [
    { roll: '25EU02094', name: 'Madupu Karthikeya', dept: 'Computer Science', yearSection: 'IV-AIML', conducted: 240, attended: 210, asOf: '2026-10-10', suppliedPct: 87.5, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22CS142', name: 'Sneha Reddy', dept: 'Computer Science', yearSection: 'III-A', conducted: 250, attended: 206, asOf: '2026-10-10', suppliedPct: 82.4, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22CS155', name: 'Rohan Das', dept: 'Computer Science', yearSection: 'III-A', conducted: 250, attended: 215, asOf: '2026-10-10', suppliedPct: 86.0, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22CS108', name: 'Ananya Iyer', dept: 'Computer Science', yearSection: 'III-B', conducted: 250, attended: 228, asOf: '2026-10-10', suppliedPct: 91.2, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22CS190', name: 'Vikram Malhotra', dept: 'Computer Science', yearSection: 'III-B', conducted: 250, attended: 198, asOf: '2026-10-10', suppliedPct: 79.2, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22EC078', name: 'Karthik Verma', dept: 'Electronics', yearSection: 'III-A', conducted: 240, attended: 164, asOf: '2026-10-09', suppliedPct: 68.3, proctor: 'Prof. Rao' },
    { roll: '1RV22EC045', name: 'Pooja Hegde', dept: 'Electronics', yearSection: 'III-A', conducted: 240, attended: 202, asOf: '2026-10-09', suppliedPct: 84.2, proctor: 'Prof. Rao' },
    { roll: '1RV22EC112', name: 'Aditya Rao', dept: 'Electronics', yearSection: 'III-B', conducted: 240, attended: 190, asOf: '2026-10-09', suppliedPct: 79.2, proctor: 'Prof. Rao' },
    { roll: '1RV22ME032', name: 'Meera Nambiar', dept: 'Mechanical', yearSection: 'III-A', conducted: 230, attended: 178, asOf: '2026-10-08', suppliedPct: 77.4, proctor: 'Dr. Kulkarni' },
    { roll: '1RV22ME089', name: 'Devendra Patel', dept: 'Mechanical', yearSection: 'III-B', conducted: 230, attended: 188, asOf: '2026-10-08', suppliedPct: 81.7, proctor: 'Dr. Kulkarni' },
    { roll: '1RV22IS024', name: 'Tanvi Saxena', dept: 'Information Science', yearSection: 'III-A', conducted: 245, attended: 212, asOf: '2026-10-10', suppliedPct: 86.5, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22IS091', name: 'Farhan Akhtar', dept: 'Information Science', yearSection: 'III-B', conducted: 245, attended: 165, asOf: '2026-10-10', suppliedPct: 67.3, proctor: 'Dr. Alan Smith' },
    { roll: '1RV22DS015', name: 'Aarav Gupta', dept: 'Design & AI', yearSection: 'III-A', conducted: 220, attended: 194, asOf: '2026-10-09', suppliedPct: 88.2, proctor: 'Prof. Sarah' },
    { roll: '1RV22CS999', name: 'Nikhil Sharma', dept: 'Computer Science', yearSection: 'III-C', conducted: 0, attended: 0, asOf: '2026-08-01', suppliedPct: 0, proctor: 'Dr. Alan Smith' }
  ];

  // Initial traceable requests
  const INITIAL_REQUESTS = [
    {
      id: 'REQ-2026-0042',
      roll: '25EU02094',
      studentName: 'Madupu Karthikeya',
      dept: 'Computer Science',
      yearSection: 'IV-AIML',
      proctor: 'Dr. Alan Smith',
      event: 'AI & Cloud Innovations Summit 2026',
      organizer: 'TechCorp India & IEEE',
      category: 'Conference',
      venue: 'Hyderabad International Convention Centre',
      start: '2026-11-15',
      end: '2026-11-17',
      url: 'https://aisummit2026.example.com',
      purpose: 'Presenting research paper on transformer attention optimizations; attending workshops on edge AI.',
      docName: 'acceptance_letter_ai_summit.pdf',
      status: 'Submitted', // Submitted, Under Proctor Review, Recommended for Approval, Recommended for Rejection, Returned for Correction, Pending Final Decision, Approved, Rejected, Withdrawn
      submittedAt: '2026-10-11T10:30:00Z',
      proctorRemarks: '',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-11 10:30', user: 'Madupu Karthikeya', role: 'Student', action: 'Submitted participation request', status: 'Submitted', remarks: 'Initial application submitted for conference presentation.' }
      ]
    },
    {
      id: 'REQ-2026-0038',
      roll: '1RV22CS142',
      studentName: 'Sneha Reddy',
      dept: 'Computer Science',
      yearSection: 'III-A',
      proctor: 'Dr. Alan Smith',
      event: 'HackMIT Global 2026',
      organizer: 'MIT Tech Review',
      category: 'Hackathon',
      venue: 'Online / Remote',
      start: '2026-10-24',
      end: '2026-10-26',
      url: 'https://hackmit.org',
      purpose: 'Selected as top 50 global finalist team for decentralized identity hackathon.',
      docName: 'hackmit_invitation_confirmation.png',
      status: 'Recommended for Approval',
      submittedAt: '2026-10-09T14:20:00Z',
      proctorRemarks: 'Verified technical hackathon credentials and solid attendance record (82.4%). Strongly recommended.',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-09 14:20', user: 'Sneha Reddy', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Team invitation attached.' },
        { date: '2026-10-10 11:15', user: 'Dr. Alan Smith', role: 'Proctor', action: 'Recommended for Approval', status: 'Recommended for Approval', remarks: 'Verified technical hackathon credentials and solid attendance record (82.4%).' }
      ]
    },
    {
      id: 'REQ-2026-0035',
      roll: '1RV22CS108',
      studentName: 'Ananya Iyer',
      dept: 'Computer Science',
      yearSection: 'III-B',
      proctor: 'Dr. Alan Smith',
      event: 'IEEE Cloud Summit 2026',
      organizer: 'IEEE Computer Society',
      category: 'Conference',
      venue: 'Bangalore Tech Park',
      start: '2026-11-05',
      end: '2026-11-07',
      url: 'https://ieee-cloud.org',
      purpose: 'Poster presentation on serverless distributed tracing.',
      docName: 'ieee_poster_acceptance.pdf',
      status: 'Approved',
      submittedAt: '2026-10-04T09:15:00Z',
      proctorRemarks: 'Top 5% student in class with 91.2% attendance. Recommended.',
      inchargeRemarks: 'Approved with institutional on-duty attendance credit. Keep paper presentation on department archive.',
      decisionDate: '2026-10-08',
      decisionAuthority: 'Arjun Sharma (Technical Event In-Charge)',
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-04 09:15', user: 'Ananya Iyer', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Poster acceptance attached.' },
        { date: '2026-10-06 16:00', user: 'Dr. Alan Smith', role: 'Proctor', action: 'Recommended for Approval', status: 'Recommended for Approval', remarks: 'Verified poster presentation.' },
        { date: '2026-10-08 10:45', user: 'Arjun Sharma', role: 'In-Charge', action: 'Approved', status: 'Approved', remarks: 'Approved with institutional on-duty attendance credit.' }
      ]
    },
    {
      id: 'REQ-2026-0031',
      roll: '1RV22EC078',
      studentName: 'Karthik Verma',
      dept: 'Electronics',
      yearSection: 'III-A',
      proctor: 'Prof. Rao',
      event: 'VLSI Chip Design Expo',
      organizer: 'Cadence Design Systems',
      category: 'Workshop',
      venue: 'Hyderabad Campus',
      start: '2026-11-12',
      end: '2026-11-13',
      url: '',
      purpose: 'Hands-on hardware synthesis workshop using Cadence EDA tools.',
      docName: 'cadence_registration.pdf',
      status: 'Rejected',
      submittedAt: '2026-10-03T11:00:00Z',
      proctorRemarks: 'Attendance is 68.3%, which is strictly below the institutional 75% threshold.',
      inchargeRemarks: 'Attendance criterion not met (68.3% < 75%). No authorized Dean waiver provided. Rejected per university bylaws.',
      decisionDate: '2026-10-06',
      decisionAuthority: 'Arjun Sharma (Technical Event In-Charge)',
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-03 11:00', user: 'Karthik Verma', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Registration slip attached.' },
        { date: '2026-10-05 14:30', user: 'Prof. Rao', role: 'Proctor', action: 'Recommended for Rejection', status: 'Recommended for Rejection', remarks: 'Attendance is 68.3%, below minimum 75% threshold.' },
        { date: '2026-10-06 09:30', user: 'Arjun Sharma', role: 'In-Charge', action: 'Rejected', status: 'Rejected', remarks: 'Attendance criterion not met (68.3% < 75%). Rejected.' }
      ]
    },
    {
      id: 'REQ-2026-0027',
      roll: '1RV22CS190',
      studentName: 'Vikram Malhotra',
      dept: 'Computer Science',
      yearSection: 'III-B',
      proctor: 'Dr. Alan Smith',
      event: 'Quantum Computing Bootcamp',
      organizer: 'IBM Quantum Learning',
      category: 'Workshop',
      venue: 'Online Interactive',
      start: '2026-10-30',
      end: '2026-10-31',
      url: 'https://ibm.com/quantum',
      purpose: 'Qiskit programming certificate path.',
      docName: 'incomplete_invite.pdf',
      status: 'Returned for Correction',
      submittedAt: '2026-10-07T12:00:00Z',
      proctorRemarks: 'Please attach official syllabus schedule and registration confirmation showing your name.',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-07 12:00', user: 'Vikram Malhotra', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Initial application.' },
        { date: '2026-10-09 15:20', user: 'Dr. Alan Smith', role: 'Proctor', action: 'Returned for Correction', status: 'Returned for Correction', remarks: 'Please attach official syllabus schedule and confirmation showing your name.' }
      ]
    },
    {
      id: 'REQ-2026-0022',
      roll: '1RV22DS015',
      studentName: 'Aarav Gupta',
      dept: 'Design & AI',
      yearSection: 'III-A',
      proctor: 'Prof. Sarah',
      event: 'UX Design Sprint India',
      organizer: 'DesignX Community',
      category: 'Hackathon',
      venue: 'Bangalore Design Centre',
      start: '2026-11-20',
      end: '2026-11-22',
      url: 'https://designx.in',
      purpose: 'Prototyping accessibility UI systems for smart city kiosks.',
      docName: 'designx_selection.pdf',
      status: 'Pending Final Decision',
      submittedAt: '2026-10-08T16:00:00Z',
      proctorRemarks: 'Strong project portfolio and 88.2% attendance. Recommended.',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-08 16:00', user: 'Aarav Gupta', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Portfolio selected.' },
        { date: '2026-10-10 11:00', user: 'Prof. Sarah', role: 'Proctor', action: 'Recommended for Approval', status: 'Pending Final Decision', remarks: 'Strong project portfolio and 88.2% attendance.' }
      ]
    },
    {
      id: 'REQ-2026-0018',
      roll: '1RV22IS091',
      studentName: 'Farhan Akhtar',
      dept: 'Information Science',
      yearSection: 'III-B',
      proctor: 'Dr. Alan Smith',
      event: 'National Coding Prelims',
      organizer: 'HackerRank Academic',
      category: 'Technical Competition',
      venue: 'Online',
      start: '2026-11-28',
      end: '2026-11-29',
      url: '',
      purpose: 'Competitive algorithmic programming contest.',
      docName: '',
      status: 'Recommended for Rejection',
      submittedAt: '2026-10-09T18:00:00Z',
      proctorRemarks: 'Attendance is 67.3% (< 75% threshold). Student has not produced remedial attendance clearance.',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-09 18:00', user: 'Farhan Akhtar', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Contest registration.' },
        { date: '2026-10-11 14:00', user: 'Dr. Alan Smith', role: 'Proctor', action: 'Recommended for Rejection', status: 'Recommended for Rejection', remarks: 'Attendance is 67.3% (< 75% threshold). Student has not produced remedial clearance.' }
      ]
    },
    {
      id: 'REQ-2026-0012',
      roll: '25EU02094',
      studentName: 'Madupu Karthikeya',
      dept: 'Computer Science',
      yearSection: 'IV-AIML',
      proctor: 'Dr. Alan Smith',
      event: 'Web3 & Distributed Systems Workshop',
      organizer: 'Web3 Foundation',
      category: 'Workshop',
      venue: 'Bangalore Hub',
      start: '2026-10-18',
      end: '2026-10-19',
      url: 'https://web3.foundation',
      purpose: 'Consensus mechanisms deep-dive.',
      docName: 'web3_draft.pdf',
      status: 'Returned for Correction',
      submittedAt: '2026-10-05T10:00:00Z',
      proctorRemarks: 'Please provide official verification of registration fee waiver from organizers.',
      inchargeRemarks: '',
      decisionDate: null,
      decisionAuthority: null,
      overrideAuthorized: false,
      overrideReason: '',
      history: [
        { date: '2026-10-05 10:00', user: 'Madupu Karthikeya', role: 'Student', action: 'Submitted request', status: 'Submitted', remarks: 'Initial application.' },
        { date: '2026-10-07 16:30', user: 'Dr. Alan Smith', role: 'Proctor', action: 'Returned for Correction', status: 'Returned for Correction', remarks: 'Please provide official verification of registration fee waiver from organizers.' }
      ]
    }
  ];

  const INITIAL_IMPORT_HISTORY = [
    {
      version: 'v1.0 (Baseline)',
      filename: 'sample_attendance.xlsx',
      importedAt: '2026-10-10 09:30',
      importedBy: 'Arjun Sharma',
      totalRows: 14,
      validRows: 13,
      invalidRows: 1,
      unmatchedRows: 0,
      notes: 'Initial institutional semester dataset ingestion.'
    }
  ];

  // Storage Persistence Helper
  function getStorage(key, fallback) {
    try {
      const data = localStorage.getItem('cf_' + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem('cf_' + key, JSON.stringify(value));
    } catch (e) {}
  }

  const savedStudent = getStorage('currentStudentUser', null);
  if (savedStudent) {
    DEFAULT_USERS.student = savedStudent;
  }

  // --- Central Reactive State ---
  let state = {
    isLoggedIn: getStorage('isLoggedIn', false),
    role: getStorage('role', 'student'), // admin, proctor, student
    activePage: 'dashboard', // dashboard, requests, attendance, reports, rules, audit
    threshold: getStorage('threshold', 75), // Editable minimum attendance threshold
    students: getStorage('students', INITIAL_STUDENTS),
    requests: getStorage('requests', INITIAL_REQUESTS),
    importHistory: getStorage('importHistory', INITIAL_IMPORT_HISTORY),
    
    // Filtering states
    requestFilter: 'all',
    searchQuery: '',
    deptFilter: 'all',
    yearSectionFilter: 'all',
    eligibilityFilter: 'all',
    categoryFilter: 'all',
    proctorFilter: 'all',
    
    // Staging data for pending import file preview
    stagedImport: null
  };

  // --- Attendance & Eligibility Engine ---
  function computeStudentAttendance(student) {
    if (!student || student.conducted === undefined || student.conducted === null || student.conducted === 0) {
      return {
        pct: null,
        displayPct: 'Unavailable',
        conducted: student ? student.conducted : 0,
        attended: student ? student.attended : 0,
        status: 'Verification Required',
        isEligible: false,
        reason: 'Classes conducted is 0 or record is missing in official registry.'
      };
    }

    const calculated = (student.attended / student.conducted) * 100;
    const rounded = Math.round(calculated * 10) / 10;
    const isStale = isDataStale(student.asOf);

    if (rounded < state.threshold) {
      return {
        pct: rounded,
        displayPct: rounded.toFixed(1) + '%',
        conducted: student.conducted,
        attended: student.attended,
        status: 'Ineligible',
        isEligible: false,
        reason: `Attendance (${rounded.toFixed(1)}%) is below institutional threshold (${state.threshold}%).`
      };
    } else if (isStale) {
      return {
        pct: rounded,
        displayPct: rounded.toFixed(1) + '%',
        conducted: student.conducted,
        attended: student.attended,
        status: 'Verification Required',
        isEligible: false,
        reason: `Attendance data is stale (dated ${student.asOf}, > 30 days old). Manual verification required.`
      };
    } else {
      return {
        pct: rounded,
        displayPct: rounded.toFixed(1) + '%',
        conducted: student.conducted,
        attended: student.attended,
        status: 'Eligible',
        isEligible: true,
        reason: `Attendance (${rounded.toFixed(1)}%) meets institutional criteria.`
      };
    }
  }

  function isDataStale(dateStr) {
    if (!dateStr) return true;
    try {
      const d = new Date(dateStr);
      const now = new Date('2026-10-12'); // Anchor to current institutional session
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    } catch (e) {
      return true;
    }
  }

  // Detect overlapping requests for the same student
  function checkDateOverlap(studentRoll, startDate, endDate, excludeRequestId) {
    const s1 = new Date(startDate);
    const e1 = new Date(endDate);
    if (isNaN(s1) || isNaN(e1)) return [];

    return state.requests.filter(r => {
      if (r.roll !== studentRoll) return false;
      if (r.id === excludeRequestId) return false;
      if (r.status === 'Withdrawn' || r.status === 'Rejected') return false;

      const s2 = new Date(r.start);
      const e2 = new Date(r.end);
      if (isNaN(s2) || isNaN(e2)) return false;

      // Overlap: s1 <= e2 && e1 >= s2
      return s1 <= e2 && e1 >= s2;
    });
  }

  // --- UI Toast & Notifications ---
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3800);
  }

  // Status Badge Formatter
  function renderStatusBadge(status, overlapWarning, overrideAuthorized) {
    let cls = 'status-draft';
    let icon = '•';

    switch (status) {
      case 'Draft':
        cls = 'status-draft'; icon = '✎'; break;
      case 'Submitted':
        cls = 'status-submitted'; icon = '✉'; break;
      case 'Under Proctor Review':
        cls = 'status-proctor-review'; icon = '◷'; break;
      case 'Returned for Correction':
        cls = 'status-returned'; icon = '↩'; break;
      case 'Recommended for Approval':
        cls = 'status-rec-approve'; icon = '↗'; break;
      case 'Recommended for Rejection':
        cls = 'status-rec-reject'; icon = '↘'; break;
      case 'Pending Final Decision':
        cls = 'status-incharge-review'; icon = '◉'; break;
      case 'Approved':
        cls = 'status-approved'; icon = '✓'; break;
      case 'Rejected':
        cls = 'status-rejected'; icon = '✕'; break;
      case 'Withdrawn':
        cls = 'status-withdrawn'; icon = '⊘'; break;
    }

    let html = `<span class="status-badge ${cls}">${icon} ${status}</span>`;
    if (overlapWarning) {
      html += ` <span class="badge-overlap" title="Overlaps with another event request">⚠ Overlap</span>`;
    }
    if (overrideAuthorized) {
      html += ` <span class="badge-override" title="Institutional exception override authorized">★ Override</span>`;
    }
    return html;
  }

  // Eligibility Badge Formatter
  function renderEligibilityBadge(elig) {
    if (elig.status === 'Eligible') {
      return `<span class="status-badge status-approved">✓ Eligible (${elig.displayPct})</span>`;
    } else if (elig.status === 'Ineligible') {
      return `<span class="status-badge status-rejected">✕ Ineligible (${elig.displayPct})</span>`;
    } else {
      return `<span class="status-badge status-proctor-review">⚠ ${elig.status}</span>`;
    }
  }

  // --- Role & Header Synchronization ---
  function syncHeaderAndRole() {
    const user = DEFAULT_USERS[state.role];
    if (!user) return;

    // Synchronize select element
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
      if (roleSelect.value !== state.role) {
        roleSelect.value = state.role;
      }
      const studentOpt = roleSelect.querySelector('option[value="student"]');
      if (studentOpt && DEFAULT_USERS.student) {
        studentOpt.textContent = `Student (${DEFAULT_USERS.student.name} - ${DEFAULT_USERS.student.id})`;
      }
      const proctorOpt = roleSelect.querySelector('option[value="proctor"]');
      if (proctorOpt && DEFAULT_USERS.proctor) {
        proctorOpt.textContent = `Faculty Proctor (${DEFAULT_USERS.proctor.name})`;
      }
    }

    // Role Indicator Dot color
    const dot = document.getElementById('roleDot');
    if (dot) {
      dot.style.background = state.role === 'admin' ? '#4f46e5' : (state.role === 'proctor' ? '#059669' : '#d97706');
    }

    // Topbar avatar
    const topAvatar = document.getElementById('topAvatar');
    if (topAvatar) {
      topAvatar.textContent = user.avatar;
      topAvatar.className = `avatar ${user.avatarClass} top-avatar`;
    }

    // Sidebar Profile
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarAvatar) {
      sidebarAvatar.textContent = user.avatar;
      sidebarAvatar.className = `avatar ${user.avatarClass}`;
    }
    if (sidebarUserName) sidebarUserName.textContent = user.name;
    if (sidebarUserRole) sidebarUserRole.textContent = user.title;

    // Sidebar Threshold Text
    const threshText = document.getElementById('sidebarThresholdText');
    if (threshText) {
      threshText.textContent = `Minimum ${state.threshold}% attendance required for institutional on-duty approval.`;
    }

    // Sidebar Requests Pending Badge
    const sidebarBadge = document.getElementById('sidebarReqBadge');
    if (sidebarBadge) {
      let count = 0;
      if (state.role === 'student') {
        count = state.requests.filter(r => r.roll === user.id && ['Submitted', 'Under Proctor Review', 'Returned for Correction', 'Pending Final Decision'].includes(r.status)).length;
      } else if (state.role === 'proctor') {
        count = state.requests.filter(r => user.assignedStudents.includes(r.roll) && ['Submitted', 'Under Proctor Review'].includes(r.status)).length;
      } else {
        count = state.requests.filter(r => ['Recommended for Approval', 'Recommended for Rejection', 'Pending Final Decision'].includes(r.status)).length;
      }
      sidebarBadge.textContent = count;
      sidebarBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // Active Navigation styling
    document.querySelectorAll('.main-nav .nav-item').forEach(link => {
      const page = link.getAttribute('data-page');
      if (page === state.activePage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Page Breadcrumb
    const pageCrumb = document.getElementById('pageCrumb');
    if (pageCrumb) {
      const titles = {
        dashboard: 'Overview',
        requests: 'Event Requests Queue',
        attendance: 'Attendance Registry',
        reports: 'Reports & Audit Exports',
        rules: 'Eligibility Configuration',
        audit: 'Audit & Ingestion Trail'
      };
      pageCrumb.textContent = titles[state.activePage] || 'Overview';
    }
  }

  // --- Filtering Logic for Requests ---
  function getFilteredRequests() {
    let list = [...state.requests];
    const user = DEFAULT_USERS[state.role];

    // Enforce role-based scoping
    if (state.role === 'student') {
      list = list.filter(r => r.roll === user.id);
    } else if (state.role === 'proctor') {
      // PROCTOR ACCESS RESTRICTION: Only assigned students
      list = list.filter(r => user.assignedStudents.includes(r.roll));
    }

    // Tab Status Filter
    if (state.requestFilter !== 'all') {
      if (state.requestFilter === 'pending') {
        list = list.filter(r => ['Submitted', 'Under Proctor Review', 'Pending Final Decision', 'Recommended for Approval', 'Recommended for Rejection'].includes(r.status));
      } else if (state.requestFilter === 'returned') {
        list = list.filter(r => r.status === 'Returned for Correction');
      } else if (state.requestFilter === 'ineligible') {
        list = list.filter(r => {
          const st = state.students.find(s => s.roll === r.roll);
          const elig = computeStudentAttendance(st);
          return !elig.isEligible;
        });
      } else {
        list = list.filter(r => r.status.toLowerCase() === state.requestFilter.toLowerCase());
      }
    }

    // Department Filter
    if (state.deptFilter !== 'all') {
      list = list.filter(r => r.dept.toLowerCase() === state.deptFilter.toLowerCase());
    }

    // Year/Section Filter
    if (state.yearSectionFilter !== 'all') {
      list = list.filter(r => r.yearSection.toLowerCase() === state.yearSectionFilter.toLowerCase());
    }

    // Category Filter
    if (state.categoryFilter !== 'all') {
      list = list.filter(r => r.category.toLowerCase() === state.categoryFilter.toLowerCase());
    }

    // Proctor Filter
    if (state.proctorFilter !== 'all') {
      list = list.filter(r => r.proctor.toLowerCase() === state.proctorFilter.toLowerCase());
    }

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.roll.toLowerCase().includes(q) ||
        r.event.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.organizer.toLowerCase().includes(q)
      );
    }

    return list;
  }

  // --- View: Dashboard Renderer ---
  function renderDashboardView() {
    const content = document.getElementById('content');
    if (!content) return;

    const user = DEFAULT_USERS[state.role];
    const todayStr = 'MONDAY, OCTOBER 12, 2026';

    if (state.role === 'student') {
      renderStudentDashboard(content, user, todayStr);
    } else if (state.role === 'proctor') {
      renderProctorDashboard(content, user, todayStr);
    } else {
      renderInChargeDashboard(content, user, todayStr);
    }
  }

  // Student Dashboard
  function renderStudentDashboard(container, user, todayStr) {
    const studentData = state.students.find(s => s.roll === user.id) || { conducted: 240, attended: 210, asOf: '2026-10-10' };
    const elig = computeStudentAttendance(studentData);
    const myReqs = state.requests.filter(r => r.roll === user.id);
    const pendingCount = myReqs.filter(r => ['Submitted', 'Under Proctor Review', 'Pending Final Decision'].includes(r.status)).length;
    const returnedCount = myReqs.filter(r => r.status === 'Returned for Correction').length;
    const approvedCount = myReqs.filter(r => r.status === 'Approved').length;
    const upcomingEvents = myReqs.filter(r => r.status === 'Approved' && new Date(r.start) >= new Date('2026-10-01'));

    container.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> ${todayStr}</div>
          <h1>Welcome, ${user.name} <span class="wave">✦</span></h1>
          <p class="subhead">${user.title} • Assigned Proctor: <strong>${user.proctor}</strong></p>
        </div>
        <div>
          <button class="primary-button" id="btnOpenNewRequest"><span>＋</span> Submit Event Request</button>
        </div>
      </section>

      <!-- Student Stat Grid -->
      <section class="stat-grid">
        <article class="stat-card" style="cursor:pointer;" data-nav="attendance" title="View Full Attendance Registry">
          <div class="stat-top">
            <span>Verified Attendance</span>
            <span class="stat-icon icon-blue">◉</span>
          </div>
          <div class="stat-value">
            ${elig.displayPct}
            <span class="trend ${elig.isEligible ? 'up' : 'down'}">${elig.status}</span>
          </div>
          <div class="stat-note">${studentData.attended}/${studentData.conducted} classes attended • Data As Of: <strong>${studentData.asOf || 'N/A'}</strong></div>
          <div class="sparkline blue-line"><svg viewBox="0 0 180 34"><path d="M0 25 C30 22 60 20 90 17 120 13 150 9 180 2"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="pending" title="View Pending Review Requests">
          <div class="stat-top">
            <span>Pending Reviews</span>
            <span class="stat-icon icon-amber">◷</span>
          </div>
          <div class="stat-value">${pendingCount < 10 ? '0' + pendingCount : pendingCount}</div>
          <div class="stat-note">Under Proctor or In-Charge review</div>
          <div class="sparkline amber-line"><svg viewBox="0 0 180 34"><path d="M0 28 C45 24 90 18 135 12 180 4"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="returned" title="View Returned Requests for Correction">
          <div class="stat-top">
            <span>Returned For Correction</span>
            <span class="stat-icon icon-red">↩</span>
          </div>
          <div class="stat-value" style="color: ${returnedCount > 0 ? '#b91c1c' : '#0f172a'};">${returnedCount < 10 ? '0' + returnedCount : returnedCount}</div>
          <div class="stat-note">${returnedCount > 0 ? 'Action required: Edit & resubmit' : 'No clarification requests'}</div>
          <div class="sparkline red-line"><svg viewBox="0 0 180 34"><path d="M0 26 C45 28 90 20 135 24 180 18"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="approved" title="View Approved On-Duty Leaves">
          <div class="stat-top">
            <span>Approved On-Duty Leaves</span>
            <span class="stat-icon icon-green">✓</span>
          </div>
          <div class="stat-value">${approvedCount < 10 ? '0' + approvedCount : approvedCount}</div>
          <div class="stat-note">Institutional OD credit granted</div>
          <div class="sparkline green-line"><svg viewBox="0 0 180 34"><path d="M0 27 C50 20 100 15 180 1"/></svg></div>
        </article>
      </section>

      <!-- Eligibility Notice Alert -->
      <section class="form-banner ${elig.isEligible ? 'banner-info' : 'banner-danger'}">
        <strong>Institutional Attendance Verification:</strong> ${elig.reason} 
        <span>(Threshold: ${state.threshold}%)</span>
      </section>

      <!-- Split Layout: My Requests & Upcoming Approved Events -->
      <section class="overview-grid">
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>My Participation Requests <span class="heading-badge">${myReqs.length}</span></h2>
              <p>Track live status, proctor remarks, and approval trail</p>
            </div>
            <button class="text-button" data-nav="requests">View all <span>→</span></button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>REF NO</th>
                  <th>EVENT DETAILS</th>
                  <th>DATES</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                ${myReqs.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding:32px; color:#94a3b8;">No applications submitted yet. Click "Submit Event Request" above.</td></tr>` : 
                myReqs.map(r => {
                  const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);
                  const canEdit = r.status === 'Returned for Correction' || r.status === 'Draft';
                  const canWithdraw = ['Draft', 'Submitted', 'Under Proctor Review', 'Returned for Correction'].includes(r.status);

                  return `
                    <tr>
                      <td><strong>${r.id}</strong></td>
                      <td>
                        <div class="event-col">
                          <strong>${r.event}</strong>
                          <small>${r.category} • ${r.venue}</small>
                        </div>
                      </td>
                      <td><small style="font-weight:600;">${r.start} to ${r.end}</small></td>
                      <td>${renderStatusBadge(r.status, overlaps.length > 0, r.overrideAuthorized)}</td>
                      <td>
                        <button class="action-btn" data-view="${r.id}">View Details</button>
                        ${canEdit ? `<button class="action-btn action-btn-primary" style="margin-left:4px;" data-edit="${r.id}">Edit & Resubmit</button>` : ''}
                        ${canWithdraw ? `<button class="action-btn action-btn-danger" style="margin-left:4px;" data-withdraw="${r.id}">Withdraw</button>` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </article>

        <!-- Upcoming Approved Events Schedule -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Upcoming Approved Events</h2>
              <p>Approved leaves scheduled on your academic calendar</p>
            </div>
          </div>

          <div class="activity-list">
            ${upcomingEvents.length === 0 ? `
              <div style="padding:24px; text-align:center; color:#94a3b8; font-size:0.86rem;">
                No upcoming approved events scheduled yet.
              </div>
            ` : upcomingEvents.map(e => `
              <div class="activity-item">
                <div class="activity-icon act-approve">✓</div>
                <div>
                  <p><strong>${e.event}</strong> (${e.category})</p>
                  <small style="color:#059669; font-weight:600;">Dates: ${e.start} to ${e.end} • ${e.venue}</small>
                  <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">Approved by: ${e.decisionAuthority || 'Event In-Charge'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      </section>
    `;

    attachCommonViewListeners();
  }

  // Proctor Dashboard
  function renderProctorDashboard(container, user, todayStr) {
    const assignedStudents = state.students.filter(s => user.assignedStudents.includes(s.roll));
    const assignedReqs = state.requests.filter(r => user.assignedStudents.includes(r.roll));

    const pendingReviews = assignedReqs.filter(r => ['Submitted', 'Under Proctor Review'].includes(r.status));
    const clarificationReqs = assignedReqs.filter(r => r.status === 'Returned for Correction');
    const ineligibleReqs = assignedReqs.filter(r => {
      const st = assignedStudents.find(s => s.roll === r.roll);
      return st && !computeStudentAttendance(st).isEligible;
    });
    const recentlyReviewed = assignedReqs.filter(r => ['Recommended for Approval', 'Recommended for Rejection', 'Approved', 'Rejected'].includes(r.status));

    container.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> ${todayStr}</div>
          <h1>Proctor Review Console: ${user.name}</h1>
          <p class="subhead">Faculty review of external technical event participation requests for assigned mentees.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="secondary-button" data-nav="requests">View Full Mentee Queue <span>→</span></button>
        </div>
      </section>

      <!-- Proctor Stat Grid -->
      <section class="stat-grid">
        <article class="stat-card" style="cursor:pointer;" data-nav="requests" title="View All Mentee Requests">
          <div class="stat-top"><span>Assigned Students</span><span class="stat-icon icon-blue">♧</span></div>
          <div class="stat-value">${assignedStudents.length}</div>
          <div class="stat-note">Students under your proctorial care</div>
          <div class="sparkline blue-line"><svg viewBox="0 0 180 34"><path d="M0 25 C45 20 90 22 180 5"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="pending" title="Filter Pending Reviews">
          <div class="stat-top"><span>Pending Recommendations</span><span class="stat-icon icon-amber">◷</span></div>
          <div class="stat-value" style="color: ${pendingReviews.length > 0 ? '#b45309' : '#0f172a'};">${pendingReviews.length < 10 ? '0' + pendingReviews.length : pendingReviews.length}</div>
          <div class="stat-note">Awaiting your recommendation review</div>
          <div class="sparkline amber-line"><svg viewBox="0 0 180 34"><path d="M0 28 C45 22 90 20 180 8"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="returned" title="Filter Clarification Requests">
          <div class="stat-top"><span>Clarification Requests</span><span class="stat-icon icon-purple">↩</span></div>
          <div class="stat-value">${clarificationReqs.length < 10 ? '0' + clarificationReqs.length : clarificationReqs.length}</div>
          <div class="stat-note">Returned to student for corrections</div>
          <div class="sparkline purple-line"><svg viewBox="0 0 180 34"><path d="M0 26 C45 28 90 18 180 14"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="ineligible" title="Filter Attendance-Ineligible Mentees">
          <div class="stat-top"><span>Attendance-Ineligible</span><span class="stat-icon icon-red">⚠</span></div>
          <div class="stat-value" style="color: ${ineligibleReqs.length > 0 ? '#b91c1c' : '#0f172a'};">${ineligibleReqs.length < 10 ? '0' + ineligibleReqs.length : ineligibleReqs.length}</div>
          <div class="stat-note">Applicants below ${state.threshold}% threshold</div>
          <div class="sparkline red-line"><svg viewBox="0 0 180 34"><path d="M0 26 C45 20 90 26 180 18"/></svg></div>
        </article>
      </section>

      <!-- Assigned Students Action Queue -->
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Pending Review Queue <span class="heading-badge">${pendingReviews.length}</span></h2>
            <p>Proctors evaluate and recommend approval/rejection or return for correction. (Proctors recommend; In-Charge finalizes).</p>
          </div>
          <button class="text-button" data-nav="requests">Mentee Registry <span>→</span></button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REF NO</th>
                <th>STUDENT (ROLL NO)</th>
                <th>EVENT DETAILS</th>
                <th>DATES</th>
                <th>ATTENDANCE & FRESHNESS</th>
                <th>FLAGS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${pendingReviews.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding:32px; color:#94a3b8;">No pending requests requiring proctor review. All caught up!</td></tr>` :
              pendingReviews.map(r => {
                const st = state.students.find(s => s.roll === r.roll);
                const elig = computeStudentAttendance(st);
                const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

                return `
                  <tr>
                    <td><strong>${r.id}</strong></td>
                    <td>
                      <div class="student-col">
                        <div class="avatar student-avatar" style="width:28px; height:28px; font-size:0.75rem;">${r.studentName.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                          <strong>${r.studentName}</strong>
                          <small>${r.roll} • ${r.dept}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="event-col">
                        <strong>${r.event}</strong>
                        <small>${r.category} • ${r.venue}</small>
                      </div>
                    </td>
                    <td><small style="font-weight:600;">${r.start} to ${r.end}</small></td>
                    <td>
                      <strong style="color: ${elig.isEligible ? '#059669' : '#dc2626'}">${elig.displayPct}</strong>
                      <small style="display:block; color:#64748b;">As Of: ${st ? st.asOf : 'N/A'}</small>
                    </td>
                    <td>
                      ${!elig.isEligible ? `<span class="badge-overlap" style="background:#fef2f2; color:#991b1b;">Below ${state.threshold}%</span>` : ''}
                      ${overlaps.length > 0 ? `<span class="badge-overlap">Overlap (${overlaps.length})</span>` : ''}
                      ${elig.isEligible && overlaps.length === 0 ? `<span style="color:#059669; font-size:0.75rem;">✓ Clean</span>` : ''}
                    </td>
                    <td>
                      <button class="action-btn action-btn-primary" data-proctor-review="${r.id}">Review & Recommend</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Recently Reviewed Requests -->
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Recently Evaluated Mentees</h2>
            <p>Historical audit trail of proctor recommendations and institutional outcomes</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REF NO</th>
                <th>STUDENT</th>
                <th>EVENT</th>
                <th>YOUR RECOMMENDATION</th>
                <th>FINAL OUTCOME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${recentlyReviewed.slice(0, 5).map(r => `
                <tr>
                  <td><strong>${r.id}</strong></td>
                  <td>${r.studentName} (${r.roll})</td>
                  <td>${r.event}</td>
                  <td><small><strong>${r.status}</strong>: ${r.proctorRemarks || 'No remarks recorded'}</small></td>
                  <td>${renderStatusBadge(r.status, false, r.overrideAuthorized)}</td>
                  <td><button class="action-btn" data-view="${r.id}">View Audit Trail</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    attachCommonViewListeners();
  }

  // Technical Event In-Charge Dashboard
  function renderInChargeDashboard(container, user, todayStr) {
    const totalRequests = state.requests.length;
    const pendingIncharge = state.requests.filter(r => ['Recommended for Approval', 'Recommended for Rejection', 'Pending Final Decision'].includes(r.status));
    const approvedCount = state.requests.filter(r => r.status === 'Approved').length;
    const rejectedCount = state.requests.filter(r => r.status === 'Rejected').length;
    const latestImport = state.importHistory[0] || { version: 'None', importedAt: 'N/A', validRows: 0 };

    const ineligibleApplicants = state.requests.filter(r => {
      const st = state.students.find(s => s.roll === r.roll);
      return st && !computeStudentAttendance(st).isEligible;
    }).length;

    const upcomingApproved = state.requests.filter(r => r.status === 'Approved' && new Date(r.start) >= new Date('2026-10-01')).length;

    // Attendance stats
    const avgAttendance = (state.students.reduce((acc, s) => {
      const el = computeStudentAttendance(s);
      return acc + (el.pct || 0);
    }, 0) / (state.students.length || 1)).toFixed(1);

    container.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> ${todayStr}</div>
          <h1>Technical Event Monitoring Console</h1>
          <p class="subhead">Institutional oversight, attendance eligibility enforcement, and final approval governance.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="secondary-button" id="btnDownloadTemplatesQuick"><span>⬇</span> Import Templates</button>
          <button class="primary-button" data-nav="attendance"><span>⬆</span> Import Attendance</button>
        </div>
      </section>

      <!-- High-Level Governance KPIs -->
      <section class="stat-grid">
        <article class="stat-card" style="cursor:pointer;" data-nav-req="pending" title="View Decision Queue">
          <div class="stat-top"><span>Decision Queue</span><span class="stat-icon icon-amber">◷</span></div>
          <div class="stat-value" style="color: ${pendingIncharge.length > 0 ? '#b45309' : '#0f172a'};">${pendingIncharge.length < 10 ? '0' + pendingIncharge.length : pendingIncharge.length}</div>
          <div class="stat-note">Requests awaiting final institutional verdict</div>
          <div class="sparkline amber-line"><svg viewBox="0 0 180 34"><path d="M0 28 C15 25 30 21 62 16 90 12 120 12 180 2"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="approved" title="View Approved Participations">
          <div class="stat-top"><span>Approved Participations</span><span class="stat-icon icon-green">✓</span></div>
          <div class="stat-value">${approvedCount < 10 ? '0' + approvedCount : approvedCount}</div>
          <div class="stat-note">Total institutional on-duty approvals</div>
          <div class="sparkline green-line"><svg viewBox="0 0 180 34"><path d="M0 27 C15 22 48 22 91 10 138 14 180 1"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav-req="ineligible" title="View Attendance Flags">
          <div class="stat-top"><span>Attendance Ineligibility Flags</span><span class="stat-icon icon-red">⚠</span></div>
          <div class="stat-value" style="color: #b91c1c;">${ineligibleApplicants < 10 ? '0' + ineligibleApplicants : ineligibleApplicants}</div>
          <div class="stat-note">Students below ${state.threshold}% threshold</div>
          <div class="sparkline red-line"><svg viewBox="0 0 180 34"><path d="M0 28 C30 25 60 20 90 24 120 18 180 12"/></svg></div>
        </article>

        <article class="stat-card" style="cursor:pointer;" data-nav="audit" title="View Dataset Versions and Ingestion Logs">
          <div class="stat-top"><span>Active Dataset Version</span><span class="stat-icon icon-purple">◉</span></div>
          <div class="stat-value" style="font-size:1.35rem;">${latestImport.version}</div>
          <div class="stat-note">${state.students.length} students • Synced ${latestImport.importedAt}</div>
          <div class="sparkline purple-line"><svg viewBox="0 0 180 34"><path d="M0 28 C31 24 77 12 121 14 180 3"/></svg></div>
        </article>
      </section>

      <!-- Institutional Master Queue -->
      <section class="overview-grid">
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Pending Decision Queue <span class="heading-badge">${pendingIncharge.length}</span></h2>
              <p>Review proctor recommendation, verify attendance, and record final decision</p>
            </div>
            <button class="text-button" data-nav="requests">Full Registry <span>→</span></button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>REF NO</th>
                  <th>STUDENT</th>
                  <th>EVENT</th>
                  <th>PROCTOR REC.</th>
                  <th>ATTENDANCE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                ${pendingIncharge.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:32px; color:#94a3b8;">No requests awaiting final in-charge decision.</td></tr>` :
                pendingIncharge.slice(0, 5).map(r => {
                  const st = state.students.find(s => s.roll === r.roll);
                  const elig = computeStudentAttendance(st);
                  const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

                  return `
                    <tr>
                      <td><strong>${r.id}</strong></td>
                      <td>
                        <strong>${r.studentName}</strong>
                        <small style="display:block; color:#64748b;">${r.roll} • ${r.dept}</small>
                      </td>
                      <td>
                        <strong>${r.event}</strong>
                        <small style="display:block; color:#64748b;">${r.category} • ${r.venue}</small>
                      </td>
                      <td>
                        <small><strong>${r.status}</strong></small>
                        <small style="display:block; color:#64748b; font-style:italic;">"${(r.proctorRemarks || 'No remarks').slice(0, 40)}..."</small>
                      </td>
                      <td>
                        ${renderEligibilityBadge(elig)}
                        ${overlaps.length > 0 ? `<div class="badge-overlap">Overlap Detected</div>` : ''}
                      </td>
                      <td>
                        <button class="action-btn action-btn-primary" data-incharge-decide="${r.id}">Make Decision</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </article>

        <!-- Category Distribution Donut Chart -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Event Category Distribution</h2>
              <p>Participation requests breakdown by domain</p>
            </div>
          </div>
          <div class="chart-wrap">
            <div class="donut-chart" id="dashDonutChart">
              <div class="donut-center">
                <strong>${state.requests.length}</strong>
                <small>Total requests</small>
              </div>
            </div>
            <div class="legend" id="dashCategoryLegend"></div>
          </div>
          <div class="chart-foot">
            <span><i class="foot-dot"></i> Current Semester Analytics</span>
            <span>Policy Threshold: <strong>${state.threshold}%</strong></span>
          </div>
        </article>
      </section>

      <!-- Department Attendance Averages and Recent Activities -->
      <section class="bottom-grid">
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Department Attendance Benchmark</h2>
              <p>Eligibility threshold comparison (${state.threshold}%)</p>
            </div>
            <button class="select-chip" data-nav="attendance">Registry ↗</button>
          </div>
          <div class="attendance-summary">
            <div>
              <strong>${avgAttendance}%</strong>
              <small>Campus Average</small>
            </div>
            <div class="summary-divider"></div>
            <div>
              <strong>${Math.round((state.students.filter(s => computeStudentAttendance(s).isEligible).length / (state.students.length || 1)) * 100)}%</strong>
              <small>Eligible Student Pool</small>
            </div>
            <span class="summary-trend">Active Threshold: ${state.threshold}%</span>
          </div>
          <div class="bar-chart" id="dashBarChart"></div>
          <div class="bar-labels" id="dashBarLabels"></div>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Institutional Audit Log</h2>
              <p>Traceable action records with timestamp & actor attribution</p>
            </div>
            <button class="text-button" data-nav="audit">Audit Log ↗</button>
          </div>
          <div class="activity-list" id="dashAuditList"></div>
        </article>
      </section>
    `;

    renderDonutChart('dashDonutChart', 'dashCategoryLegend');
    renderBarChart('dashBarChart', 'dashBarLabels');
    renderAuditSnippet('dashAuditList');
    attachCommonViewListeners();
  }

  // --- Dynamic SVG & Canvas Charts ---
  function renderDonutChart(chartId, legendId) {
    const chart = document.getElementById(chartId);
    const legend = document.getElementById(legendId);
    if (!chart || !legend) return;

    const categories = ['Hackathon', 'Workshop', 'Conference', 'Technical Competition', 'Industrial Visit', 'Other'];
    const colors = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
    const counts = {};
    categories.forEach(c => counts[c] = 0);

    state.requests.forEach(r => {
      if (counts[r.category] !== undefined) counts[r.category]++;
      else counts['Other']++;
    });

    const total = state.requests.length || 1;
    let accumulated = 0;
    const conicSegments = categories.map((cat, idx) => {
      const fraction = (counts[cat] / total) * 100;
      const start = accumulated;
      accumulated += fraction;
      return `${colors[idx]} ${start}% ${accumulated}%`;
    }).join(', ');

    chart.style.background = `conic-gradient(${conicSegments})`;

    legend.innerHTML = categories.map((cat, idx) => `
      <div>
        <i class="legend-dot" style="background:${colors[idx]};"></i>
        <span>${cat}</span>
        <strong>${counts[cat]}</strong>
      </div>
    `).join('');
  }

  function renderBarChart(chartId, labelsId) {
    const chart = document.getElementById(chartId);
    const labels = document.getElementById(labelsId);
    if (!chart || !labels) return;

    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Design & AI', 'Information Science'];
    const data = departments.map(dept => {
      const matching = state.students.filter(s => s.dept.toLowerCase().includes(dept.toLowerCase()));
      const avg = matching.length ? (matching.reduce((acc, s) => acc + (computeStudentAttendance(s).pct || 0), 0) / matching.length) : 0;
      return { dept, avg: Math.round(avg * 10) / 10 };
    });

    chart.innerHTML = data.map(d => {
      const height = Math.min(100, Math.max(15, d.avg));
      return `
        <div class="bar-col">
          <div class="bar-fill" style="height: ${height}%;" data-val="${d.avg}%"></div>
        </div>
      `;
    }).join('');

    labels.innerHTML = data.map(d => `<span>${d.dept.split(' ')[0]}</span>`).join('');
  }

  function renderAuditSnippet(containerId) {
    const list = document.getElementById(containerId);
    if (!list) return;

    // Pull last 4 actions across all request histories
    const logs = [];
    state.requests.forEach(r => {
      (r.history || []).forEach(h => {
        logs.push({ ...h, reqId: r.id, event: r.event });
      });
    });

    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = logs.slice(0, 4).map(l => `
      <div class="activity-item">
        <div class="activity-icon ${l.action.includes('Approved') ? 'act-approve' : (l.action.includes('Reject') ? 'act-reject' : (l.action.includes('Return') ? 'act-return' : 'act-submit'))}">
          ${l.action.includes('Approved') ? '✓' : (l.action.includes('Reject') ? '✕' : (l.action.includes('Return') ? '↩' : '▤'))}
        </div>
        <div>
          <p><strong>${l.user} (${l.role})</strong>: ${l.action} on <strong>${l.reqId}</strong></p>
          <small style="color:#64748b;">${l.remarks || 'No remarks provided'}</small>
          <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">${l.date}</div>
        </div>
      </div>
    `).join('');
  }

  // --- View: Full Requests Queue ---
  function renderRequestsView() {
    const content = document.getElementById('content');
    if (!content) return;

    const list = getFilteredRequests();
    const user = DEFAULT_USERS[state.role];

    // Compute unique departments and proctors for filter dropdowns
    const depts = Array.from(new Set(state.students.map(s => s.dept)));
    const proctors = Array.from(new Set(state.students.map(s => s.proctor).filter(Boolean)));

    content.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> AUDITABLE EVENT REGISTRY</div>
          <h1>Technical Event Participation Requests</h1>
          <p class="subhead">${state.role === 'student' ? 'Track your participation requests and modify returned drafts.' : 'Traceable multi-role approval workflow with attendance verification.'}</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="secondary-button" id="btnExportRequestsCsv">Export CSV</button>
          <button class="secondary-button" id="btnExportRequestsXlsx">Export Excel (.xlsx)</button>
          ${state.role === 'student' ? `<button class="primary-button" id="btnOpenNewRequest"><span>＋</span> New Request</button>` : ''}
        </div>
      </section>

      <!-- Advanced Multi-Parameter Filter Controls -->
      <section class="filter-bar">
        <div class="chips-row">
          <button class="chip-filter ${state.requestFilter === 'all' ? 'active' : ''}" data-filter="all">All (${state.requests.length})</button>
          <button class="chip-filter ${state.requestFilter === 'pending' ? 'active' : ''}" data-filter="pending">Pending Queue</button>
          <button class="chip-filter ${state.requestFilter === 'returned' ? 'active' : ''}" data-filter="returned">Returned for Correction</button>
          <button class="chip-filter ${state.requestFilter === 'ineligible' ? 'active' : ''}" data-filter="ineligible">Attendance Ineligible</button>
          <button class="chip-filter ${state.requestFilter === 'approved' ? 'active' : ''}" data-filter="approved">Approved</button>
          <button class="chip-filter ${state.requestFilter === 'rejected' ? 'active' : ''}" data-filter="rejected">Rejected</button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-left:auto;">
          <input type="text" id="filterSearch" placeholder="Search by roll, name, event..." value="${state.searchQuery}" style="width:200px;" />

          ${state.role !== 'student' ? `
            <select id="filterDept">
              <option value="all">All Departments</option>
              ${depts.map(d => `<option value="${d}" ${state.deptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          ` : ''}

          <select id="filterCategory">
            <option value="all">All Categories</option>
            <option value="Hackathon" ${state.categoryFilter === 'Hackathon' ? 'selected' : ''}>Hackathon</option>
            <option value="Workshop" ${state.categoryFilter === 'Workshop' ? 'selected' : ''}>Workshop</option>
            <option value="Conference" ${state.categoryFilter === 'Conference' ? 'selected' : ''}>Conference</option>
            <option value="Technical Competition" ${state.categoryFilter === 'Technical Competition' ? 'selected' : ''}>Technical Competition</option>
            <option value="Industrial Visit" ${state.categoryFilter === 'Industrial Visit' ? 'selected' : ''}>Industrial Visit</option>
            <option value="Other" ${state.categoryFilter === 'Other' ? 'selected' : ''}>Other</option>
          </select>

          ${state.role === 'admin' ? `
            <select id="filterProctor">
              <option value="all">All Proctors</option>
              ${proctors.map(p => `<option value="${p}" ${state.proctorFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          ` : ''}
        </div>
      </section>

      <!-- Table View -->
      <section class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REF NUMBER</th>
                <th>STUDENT DETAILS</th>
                <th>EVENT & ORGANIZER</th>
                <th>CATEGORY</th>
                <th>DATES</th>
                <th>ATTENDANCE & ELIGIBILITY</th>
                <th>WORKFLOW STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding:36px; color:#94a3b8;">No participation requests match the active filter criteria.</td></tr>` :
              list.map(r => {
                const st = state.students.find(s => s.roll === r.roll);
                const elig = computeStudentAttendance(st);
                const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

                const isMyStudent = (state.role === 'proctor' && user.assignedStudents.includes(r.roll));
                const canProctorReview = isMyStudent && ['Submitted', 'Under Proctor Review'].includes(r.status);
                const canInchargeDecide = (state.role === 'admin') && ['Recommended for Approval', 'Recommended for Rejection', 'Pending Final Decision', 'Submitted', 'Under Proctor Review'].includes(r.status);
                const canEditReturned = (state.role === 'student' && r.roll === user.id) && (r.status === 'Returned for Correction' || r.status === 'Draft');
                const canWithdraw = (state.role === 'student' && r.roll === user.id) && ['Draft', 'Submitted', 'Under Proctor Review', 'Returned for Correction'].includes(r.status);

                return `
                  <tr>
                    <td><strong>${r.id}</strong></td>
                    <td>
                      <div class="student-col">
                        <div class="avatar student-avatar" style="width:28px; height:28px; font-size:0.75rem;">${r.studentName.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                          <strong>${r.studentName}</strong>
                          <small>${r.roll} • ${r.dept} (${r.yearSection})</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="event-col">
                        <strong>${r.event}</strong>
                        <small>Org: ${r.organizer}</small>
                      </div>
                    </td>
                    <td><small><strong>${r.category}</strong></small></td>
                    <td><small style="font-weight:600;">${r.start} to ${r.end}</small></td>
                    <td>
                      ${renderEligibilityBadge(elig)}
                      <small style="display:block; color:#64748b; margin-top:2px;">As of: ${st ? st.asOf : 'N/A'}</small>
                    </td>
                    <td>
                      ${renderStatusBadge(r.status, overlaps.length > 0, r.overrideAuthorized)}
                      ${r.overrideAuthorized ? `<small style="display:block; color:#6d28d9; font-weight:600;">Exception Approved</small>` : ''}
                    </td>
                    <td>
                      <button class="action-btn" data-view="${r.id}">Audit Trail</button>
                      ${canProctorReview ? `<button class="action-btn action-btn-primary" style="margin-left:4px;" data-proctor-review="${r.id}">Review</button>` : ''}
                      ${canInchargeDecide ? `<button class="action-btn action-btn-primary" style="margin-left:4px;" data-incharge-decide="${r.id}">Final Decision</button>` : ''}
                      ${canEditReturned ? `<button class="action-btn action-btn-primary" style="margin-left:4px;" data-edit="${r.id}">Edit</button>` : ''}
                      ${canWithdraw ? `<button class="action-btn action-btn-danger" style="margin-left:4px;" data-withdraw="${r.id}">Withdraw</button>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    attachRequestFilterListeners();
    attachCommonViewListeners();
  }

  // --- View: Attendance Registry & Ingestion ---
  function renderAttendanceView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> REGISTRY & DATA INGESTION</div>
          <h1>Institutional Attendance Registry</h1>
          <p class="subhead">Official attendance source of truth. Supports .xlsx and .csv ingestion with non-destructive validation preview.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <input type="file" id="fileAttendanceInput" accept=".xlsx, .xls, .csv" style="display:none;" />
          <button class="secondary-button" id="btnDownloadTemplates"><span>⬇</span> Download Templates</button>
          <button class="primary-button" id="btnTriggerFileImport"><span>⬆</span> Import Attendance (.xlsx / .csv)</button>
        </div>
      </section>

      <!-- Ingestion Verification Banner -->
      <section class="form-banner banner-info">
        <strong>Ingestion Rules:</strong> Attendance % is calculated as <code>Classes Attended / Classes Conducted × 100</code>. If classes conducted is 0 or record is missing, value is treated as <strong>"Unavailable"</strong> (never 0%). Incomplete or failing files leave the current dataset 100% untouched.
      </section>

      <!-- Student Registry Table -->
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Verified Student Records <span class="heading-badge" id="attBadgeCount">${state.students.length}</span></h2>
            <p>Roll-matched records utilized by real-time eligibility engine</p>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <input type="text" id="attSearch" placeholder="Filter by roll, name..." style="width:190px; padding:6px 12px; font-size:0.84rem;" />
            <select id="attDeptFilter" style="padding:6px 10px; font-size:0.84rem;">
              <option value="all">All Departments</option>
              ${Array.from(new Set(state.students.map(s => s.dept))).map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
            <select id="attEligFilter" style="padding:6px 10px; font-size:0.84rem;">
              <option value="all">All Statuses</option>
              <option value="eligible">Eligible Only (≥ ${state.threshold}%)</option>
              <option value="ineligible">Ineligible Only (< ${state.threshold}%)</option>
              <option value="verify">Verification Required</option>
            </select>
            <button class="secondary-button" id="btnAttExportFilteredCsv" style="padding:6px 10px; font-size:0.78rem;">CSV ↗</button>
            <button class="primary-button" id="btnAttExportFilteredXlsx" style="padding:6px 10px; font-size:0.78rem;">Excel ↗</button>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ROLL NUMBER</th>
                <th>STUDENT NAME</th>
                <th>DEPARTMENT</th>
                <th>YEAR/SECTION</th>
                <th>CLASSES CONDUCTED</th>
                <th>CLASSES ATTENDED</th>
                <th>CALCULATED %</th>
                <th>SUPPLIED %</th>
                <th>ELIGIBILITY STATUS</th>
                <th>DATA AS OF</th>
                <th>ASSIGNED PROCTOR</th>
              </tr>
            </thead>
            <tbody id="attTableRows">
              ${renderAttendanceRows(state.students)}
            </tbody>
          </table>
        </div>
      </section>
    `;

    // Filter coordinator for attendance registry
    function getFilteredAttendance() {
      const q = (document.getElementById('attSearch')?.value || '').toLowerCase().trim();
      const dept = document.getElementById('attDeptFilter')?.value || 'all';
      const elig = document.getElementById('attEligFilter')?.value || 'all';

      return state.students.filter(s => {
        const matchesQuery = !q || s.roll.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.yearSection.toLowerCase().includes(q);
        const matchesDept = dept === 'all' || s.dept === dept;
        const statusObj = computeStudentAttendance(s);
        let matchesElig = true;
        if (elig === 'eligible') matchesElig = statusObj.isEligible;
        else if (elig === 'ineligible') matchesElig = !statusObj.isEligible && statusObj.status === 'Ineligible';
        else if (elig === 'verify') matchesElig = statusObj.status === 'Verification Required';
        return matchesQuery && matchesDept && matchesElig;
      });
    }

    function refreshAttendanceTable() {
      const filtered = getFilteredAttendance();
      const tbody = document.getElementById('attTableRows');
      if (tbody) tbody.innerHTML = renderAttendanceRows(filtered);
      const badge = document.getElementById('attBadgeCount');
      if (badge) badge.textContent = filtered.length;
    }

    const searchInput = document.getElementById('attSearch');
    if (searchInput) searchInput.oninput = refreshAttendanceTable;

    const deptSelect = document.getElementById('attDeptFilter');
    if (deptSelect) deptSelect.onchange = refreshAttendanceTable;

    const eligSelect = document.getElementById('attEligFilter');
    if (eligSelect) eligSelect.onchange = refreshAttendanceTable;

    const expAttCsv = document.getElementById('btnAttExportFilteredCsv');
    if (expAttCsv) expAttCsv.onclick = () => exportAttendance('csv');

    const expAttXlsx = document.getElementById('btnAttExportFilteredXlsx');
    if (expAttXlsx) expAttXlsx.onclick = () => exportAttendance('xlsx');

    // Hook template download & upload triggers
    const triggerBtn = document.getElementById('btnTriggerFileImport');
    const fileInput = document.getElementById('fileAttendanceInput');
    if (triggerBtn && fileInput) {
      triggerBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          processAttendanceFile(e.target.files[0]);
        }
      };
    }

    const tmplBtn = document.getElementById('btnDownloadTemplates');
    if (tmplBtn) {
      tmplBtn.onclick = () => {
        const modal = document.getElementById('templateModalBackdrop');
        if (modal) modal.classList.add('open');
      };
    }
  }

  function renderAttendanceRows(studentList) {
    if (!studentList.length) {
      return `<tr><td colspan="11" style="text-align:center; padding:32px; color:#94a3b8;">No matching student records found.</td></tr>`;
    }

    return studentList.map(s => {
      const elig = computeStudentAttendance(s);
      return `
        <tr>
          <td><strong>${s.roll}</strong></td>
          <td><strong>${s.name}</strong></td>
          <td>${s.dept}</td>
          <td>${s.yearSection}</td>
          <td>${s.conducted}</td>
          <td>${s.attended}</td>
          <td><strong style="color: ${elig.isEligible ? '#059669' : '#dc2626'}">${elig.displayPct}</strong></td>
          <td><small>${s.suppliedPct ? s.suppliedPct + '%' : '—'}</small></td>
          <td>${renderEligibilityBadge(elig)}</td>
          <td><small style="font-weight:600;">${s.asOf || 'N/A'}</small></td>
          <td><small>${s.proctor || 'Dr. Alan Smith'}</small></td>
        </tr>
      `;
    }).join('');
  }

  // --- View: Eligibility Rules Configuration ---
  function renderRulesView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> INSTITUTIONAL THRESHOLD</div>
          <h1>Eligibility Rules & Policy Parameters</h1>
          <p class="subhead">Configure minimum attendance thresholds, staleness limits, and overlap conflict constraints.</p>
        </div>
      </section>

      <section class="panel" style="max-width: 680px;">
        <form id="frmSaveRules">
          <div class="form-grid" style="grid-template-columns: 1fr;">
            <label>
              Minimum Attendance Threshold (%)
              <input type="number" id="cfgThreshold" min="50" max="95" value="${state.threshold}" required />
              <small style="color:#64748b;">Current default: 75%. Modifying this parameter immediately recalculates eligibility across the student body.</small>
            </label>

            <label>
              Attendance Data Freshness Limit (Days)
              <input type="number" id="cfgStaleDays" min="7" max="90" value="30" required />
              <small style="color:#64748b;">Records older than this limit are marked as "Verification Required" and cannot be approved automatically.</small>
            </label>

            <label class="checkbox-label" style="margin-top:10px;">
              <input type="checkbox" id="cfgBlockOverlap" checked />
              <span>Flag overlapping event dates for manual dean/proctor intervention</span>
            </label>

            <!-- Real-time simulation impact card -->
            <div id="rulesSimulationBox" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin-top:16px;">
              <div style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">POLICY IMPACT SIMULATION</div>
              <div id="simContent" style="font-size:0.86rem; color:#0f172a;"></div>
            </div>
          </div>

          <div class="form-actions" style="margin-top:24px; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <button type="button" class="secondary-button" id="btnResetRules">↺ Reset Default (75%)</button>
            <button type="submit" class="primary-button">Save Institutional Rules</button>
          </div>
        </form>
      </section>
    `;

    function updateSimulation(tVal) {
      const thresh = parseFloat(tVal) || state.threshold;
      let eligible = 0;
      let ineligible = 0;
      state.students.forEach(s => {
        if (!s.conducted) ineligible++;
        else {
          const pct = (s.attended / s.conducted) * 100;
          if (pct >= thresh) eligible++;
          else ineligible++;
        }
      });
      const simEl = document.getElementById('simContent');
      if (simEl) {
        simEl.innerHTML = `At <strong>${thresh}%</strong> threshold: <span style="color:#059669; font-weight:700;">${eligible} Eligible</span> (${Math.round((eligible/state.students.length)*100)}%) and <span style="color:#dc2626; font-weight:700;">${ineligible} Ineligible</span> students across ${state.students.length} enrolled records.`;
      }
    }

    updateSimulation(state.threshold);

    const threshInput = document.getElementById('cfgThreshold');
    if (threshInput) {
      threshInput.oninput = (e) => updateSimulation(e.target.value);
    }

    const resetRulesBtn = document.getElementById('btnResetRules');
    if (resetRulesBtn) {
      resetRulesBtn.onclick = () => {
        state.threshold = 75;
        setStorage('threshold', 75);
        document.getElementById('cfgThreshold').value = 75;
        updateSimulation(75);
        showToast('Institutional threshold reset to baseline (75%).');
        syncHeaderAndRole();
      };
    }

    const form = document.getElementById('frmSaveRules');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const newThresh = parseFloat(document.getElementById('cfgThreshold').value);
        if (newThresh >= 50 && newThresh <= 100) {
          state.threshold = newThresh;
          setStorage('threshold', newThresh);
          showToast(`Institutional threshold updated to ${newThresh}%. Eligibility recalculated.`);
          syncHeaderAndRole();
        }
      };
    }
  }

  // --- View: Reports & Exports ---
  function renderReportsView() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> COMPLIANCE REPORTING</div>
          <h1>Institutional Reports & Audit Exports</h1>
          <p class="subhead">Download formal compliance reports formatted for internal accreditation and state regulatory reviews.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="primary-button" id="btnExportFullPackage"><span>📦</span> Full Institutional Audit Package (.xlsx)</button>
        </div>
      </section>

      <section class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">
        <article class="stat-card" style="padding:22px;">
          <h3 style="font-size:1.05rem; margin-bottom:6px;">Student Attendance Eligibility Report</h3>
          <p style="color:#64748b; font-size:0.82rem; margin-bottom:16px;">
            Registry breakdown showing conducted/attended classes, percentage, eligibility status, and data date.
          </p>
          <div style="display:flex; gap:8px;">
            <button class="secondary-button" id="btnExportAttCsv">Download CSV</button>
            <button class="primary-button" id="btnExportAttXlsx">Excel (.xlsx)</button>
          </div>
        </article>

        <article class="stat-card" style="padding:22px;">
          <h3 style="font-size:1.05rem; margin-bottom:6px;">Event Approval & OD Compliance Report</h3>
          <p style="color:#64748b; font-size:0.82rem; margin-bottom:16px;">
            Audit trail of participation requests, recommendations, final approvals, rejections, and exception overrides.
          </p>
          <div style="display:flex; gap:8px;">
            <button class="secondary-button" id="btnExportReqCsv">Download CSV</button>
            <button class="primary-button" id="btnExportReqXlsx">Excel (.xlsx)</button>
          </div>
        </article>

        <article class="stat-card" style="padding:22px;">
          <h3 style="font-size:1.05rem; margin-bottom:6px;">System Audit & Action History Log</h3>
          <p style="color:#64748b; font-size:0.82rem; margin-bottom:16px;">
            Timestamped trace of all system actions, actor identities, role scopes, decisions, and dataset ingestion records.
          </p>
          <div style="display:flex; gap:8px;">
            <button class="secondary-button" id="btnExportAuditRepCsv">Download CSV</button>
            <button class="primary-button" id="btnExportAuditRepXlsx">Excel (.xlsx)</button>
          </div>
        </article>
      </section>
    `;

    document.getElementById('btnExportAttCsv').onclick = () => exportAttendance('csv');
    document.getElementById('btnExportAttXlsx').onclick = () => exportAttendance('xlsx');
    document.getElementById('btnExportReqCsv').onclick = () => exportRequests('csv');
    document.getElementById('btnExportReqXlsx').onclick = () => exportRequests('xlsx');
    document.getElementById('btnExportAuditRepCsv').onclick = () => exportAudit('csv');
    document.getElementById('btnExportAuditRepXlsx').onclick = () => exportAudit('xlsx');
    document.getElementById('btnExportFullPackage').onclick = () => exportComprehensivePackage();
  }

  // --- View: Audit Trail & Dataset Versions ---
  function renderAuditView() {
    const content = document.getElementById('content');
    if (!content) return;

    // Aggregate all historical events across all requests
    const allHistory = [];
    state.requests.forEach(r => {
      (r.history || []).forEach(h => {
        allHistory.push({
          ...h,
          reqId: r.id,
          studentName: r.studentName,
          roll: r.roll,
          event: r.event
        });
      });
    });
    // Sort chronological descending
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    content.innerHTML = `
      <section class="welcome-row">
        <div>
          <div class="eyebrow"><span class="live-dot"></span> AUDIT TRAIL</div>
          <h1>System Ingestion & Dataset Version Logs</h1>
          <p class="subhead">Complete traceability of every attendance file import, validation outcome, and governance decision.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="secondary-button" id="btnExportAuditCsv">Export Audit (CSV)</button>
          <button class="primary-button" id="btnExportAuditXlsx">Export Audit (.xlsx)</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Attendance Dataset Versions</h2>
            <p>Chronological history of successful dataset updates</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>VERSION</th>
                <th>SOURCE FILENAME</th>
                <th>TIMESTAMP</th>
                <th>IMPORTED BY</th>
                <th>TOTAL ROWS</th>
                <th>VALID ROWS</th>
                <th>INVALID ROWS</th>
                <th>AUDIT NOTES</th>
              </tr>
            </thead>
            <tbody>
              ${state.importHistory.map(h => `
                <tr>
                  <td><strong>${h.version}</strong></td>
                  <td><code>${h.filename}</code></td>
                  <td><small>${h.importedAt}</small></td>
                  <td>${h.importedBy}</td>
                  <td>${h.totalRows}</td>
                  <td><span style="color:#059669; font-weight:700;">${h.validRows}</span></td>
                  <td><span style="color:#dc2626; font-weight:700;">${h.invalidRows}</span></td>
                  <td><small>${h.notes}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Global Event Decision & Workflow Trail -->
      <section class="panel" style="margin-top:20px;">
        <div class="panel-heading">
          <div>
            <h2>Workflow Decision & Action Audit Trail <span class="heading-badge">${allHistory.length}</span></h2>
            <p>Every recorded action across student submissions, proctor recommendations, and in-charge decisions</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>REF ID</th>
                <th>STUDENT</th>
                <th>ACTOR & ROLE</th>
                <th>ACTION TAKEN</th>
                <th>STATUS</th>
                <th>AUDIT REMARKS</th>
              </tr>
            </thead>
            <tbody>
              ${allHistory.map(h => `
                <tr>
                  <td><small style="font-weight:600;">${h.date}</small></td>
                  <td><strong>${h.reqId}</strong></td>
                  <td>${h.studentName} (${h.roll})</td>
                  <td><strong>${h.user}</strong> <small>(${h.role})</small></td>
                  <td><span style="font-weight:600;">${h.action}</span></td>
                  <td>${renderStatusBadge(h.status, false, false)}</td>
                  <td><small style="color:#475569;">${h.remarks || '—'}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    const btnCsv = document.getElementById('btnExportAuditCsv');
    if (btnCsv) btnCsv.onclick = () => exportAudit('csv');

    const btnXlsx = document.getElementById('btnExportAuditXlsx');
    if (btnXlsx) btnXlsx.onclick = () => exportAudit('xlsx');

    attachCommonViewListeners();
  }

  // --- File Parsing & Non-Destructive Import Preview Engine ---
  function processAttendanceFile(file) {
    const reader = new FileReader();
    const ext = file.name.split('.').pop().toLowerCase();

    reader.onload = function (e) {
      try {
        let rawData = [];

        if (ext === 'xlsx' || ext === 'xls') {
          if (!window.XLSX) {
            showToast('Excel parser library not loaded. Please try CSV.');
            return;
          }
          const buf = new Uint8Array(e.target.result);
          const wb = window.XLSX.read(buf, { type: 'array' });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          rawData = window.XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        } else {
          // Parse CSV text
          const text = e.target.result;
          const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
              const rowObj = {};
              header.forEach((h, idx) => {
                rowObj[h] = parts[idx] !== undefined ? parts[idx] : '';
              });
              rawData.push(rowObj);
            }
          }
        }

        if (!rawData.length) {
          showToast('File is empty or could not be read.');
          return;
        }

        // Validate headers and rows
        validateAndShowImportPreview(file.name, rawData);
      } catch (err) {
        showToast('Error processing file: ' + err.message);
      }
    };

    if (ext === 'xlsx' || ext === 'xls') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }

  function validateAndShowImportPreview(fileName, rawRows) {
    const previewRows = [];
    const seenRolls = new Set();
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let unmatchedCount = 0;

    rawRows.forEach((r, idx) => {
      // Flexible case-insensitive column matching
      const roll = (r['Roll Number'] || r['roll number'] || r['Roll No'] || r['USN'] || r['usn'] || '').toString().trim();
      const name = (r['Student Name'] || r['student name'] || r['Name'] || r['name'] || '').toString().trim();
      const dept = (r['Department'] || r['department'] || r['Dept'] || '').toString().trim();
      const yearSection = (r['Year/Section'] || r['year/section'] || r['Semester'] || r['Section'] || '').toString().trim();
      const conductedVal = r['Classes Conducted'] !== undefined ? r['Classes Conducted'] : r['TotalClasses'];
      const attendedVal = r['Classes Attended'] !== undefined ? r['Classes Attended'] : r['AttendedClasses'];
      const asOf = (r['Data As Of'] || r['data as of'] || r['AsOf'] || new Date().toISOString().slice(0, 10)).toString().trim();
      const suppliedPctVal = r['Attendance Percentage'] || r['attendance percentage'] || r['AttendancePct'];

      let conducted = parseInt(conductedVal, 10);
      let attended = parseInt(attendedVal, 10);
      let suppliedPct = suppliedPctVal !== undefined && suppliedPctVal !== '' ? parseFloat(suppliedPctVal) : null;

      let status = 'Valid';
      let errorNote = '';

      if (!roll) {
        status = 'Invalid';
        errorNote = 'Missing required Roll Number.';
        invalidCount++;
      } else if (seenRolls.has(roll)) {
        status = 'Duplicate';
        errorNote = `Duplicate roll number (${roll}) within import file.`;
        duplicateCount++;
      } else if (isNaN(conducted) || isNaN(attended) || conducted < 0 || attended < 0) {
        status = 'Invalid';
        errorNote = 'Invalid or non-numeric class count values.';
        invalidCount++;
      } else if (attended > conducted) {
        status = 'Invalid';
        errorNote = `Classes attended (${attended}) cannot exceed conducted (${conducted}).`;
        invalidCount++;
      } else {
        // Check if student exists in current registry
        const existingStudent = state.students.find(s => s.roll.toLowerCase() === roll.toLowerCase());
        if (!existingStudent) {
          status = 'Unmatched';
          errorNote = 'New or unmatched roll number (will register as new student).';
          unmatchedCount++;
        }

        seenRolls.add(roll);
        validCount++;
      }

      const calculatedPct = (conducted > 0) ? (Math.round((attended / conducted) * 1000) / 10) : null;
      if (suppliedPct !== null && calculatedPct !== null && Math.abs(suppliedPct - calculatedPct) > 0.5) {
        errorNote += ` Note: Supplied percentage (${suppliedPct}%) differs from calculated (${calculatedPct}%). Calculated will be used.`;
      }

      previewRows.push({
        rowNum: idx + 1,
        roll,
        name: name || (state.students.find(s => s.roll === roll) || {}).name || 'Unknown Student',
        dept: dept || (state.students.find(s => s.roll === roll) || {}).dept || 'General',
        yearSection: yearSection || (state.students.find(s => s.roll === roll) || {}).yearSection || '5',
        conducted: isNaN(conducted) ? 0 : conducted,
        attended: isNaN(attended) ? 0 : attended,
        asOf,
        suppliedPct,
        calculatedPct,
        status,
        errorNote
      });
    });

    state.stagedImport = {
      fileName,
      totalRows: rawRows.length,
      validCount,
      invalidCount,
      duplicateCount,
      unmatchedCount,
      previewRows
    };

    // Render Preview Modal
    const metricsContainer = document.getElementById('previewMetricsContainer');
    if (metricsContainer) {
      metricsContainer.innerHTML = `
        <div class="preview-metric-card metric-valid">
          <strong>${validCount}</strong>
          <small>Valid Rows Ready</small>
        </div>
        <div class="preview-metric-card metric-invalid">
          <strong>${invalidCount}</strong>
          <small>Invalid / Error Rows</small>
        </div>
        <div class="preview-metric-card metric-duplicate">
          <strong>${duplicateCount}</strong>
          <small>Duplicate Roll Nos</small>
        </div>
        <div class="preview-metric-card metric-unmatched">
          <strong>${unmatchedCount}</strong>
          <small>Unmatched Roll Nos</small>
        </div>
      `;
    }

    const rowsTbody = document.getElementById('importPreviewRows');
    if (rowsTbody) {
      rowsTbody.innerHTML = previewRows.map(r => `
        <tr style="background: ${r.status === 'Invalid' ? '#fff1f2' : (r.status === 'Duplicate' ? '#fffbeb' : '#ffffff')};">
          <td>${r.rowNum}</td>
          <td><strong>${r.roll || '—'}</strong></td>
          <td>${r.name}</td>
          <td>${r.dept}</td>
          <td>${r.yearSection}</td>
          <td>${r.attended} / ${r.conducted}</td>
          <td><strong>${r.calculatedPct !== null ? r.calculatedPct + '%' : 'Unavailable'}</strong></td>
          <td>${r.suppliedPct !== null ? r.suppliedPct + '%' : '—'}</td>
          <td>
            <span class="status-badge ${r.status === 'Valid' ? 'status-approved' : (r.status === 'Invalid' ? 'status-rejected' : 'status-proctor-review')}">
              ${r.status}
            </span>
          </td>
          <td><small style="color:${r.status === 'Invalid' ? '#b91c1c' : '#475569'};">${r.errorNote || 'Passes all criteria'}</small></td>
        </tr>
      `).join('');
    }

    const btnCommit = document.getElementById('btnCommitImport');
    if (btnCommit) {
      btnCommit.disabled = validCount === 0;
    }

    const modal = document.getElementById('importPreviewBackdrop');
    if (modal) modal.classList.add('open');
  }

  function commitStagedImport() {
    if (!state.stagedImport) return;

    const { fileName, previewRows, validCount, invalidCount, unmatchedCount, duplicateCount } = state.stagedImport;

    // Filter to valid and unmatched rows (excluding strictly invalid & duplicates)
    const validRows = previewRows.filter(r => r.status === 'Valid' || r.status === 'Unmatched');
    if (!validRows.length) {
      showToast('No valid rows to commit.');
      return;
    }

    // Merge or update into student registry
    const updatedStudents = [...state.students];

    validRows.forEach(row => {
      const idx = updatedStudents.findIndex(s => s.roll.toLowerCase() === row.roll.toLowerCase());
      const studentObj = {
        roll: row.roll,
        name: row.name,
        dept: row.dept,
        yearSection: row.yearSection,
        conducted: row.conducted,
        attended: row.attended,
        asOf: row.asOf,
        suppliedPct: row.suppliedPct,
        proctor: (idx >= 0 ? updatedStudents[idx].proctor : 'Dr. Alan Smith')
      };

      if (idx >= 0) {
        updatedStudents[idx] = studentObj;
      } else {
        updatedStudents.push(studentObj);
      }
    });

    state.students = updatedStudents;
    setStorage('students', state.students);

    // Record in Audit History
    const newVersionNum = (state.importHistory.length + 1).toFixed(1);
    const historyEntry = {
      version: `v${newVersionNum}`,
      filename: fileName,
      importedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      importedBy: DEFAULT_USERS[state.role].name,
      totalRows: previewRows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      unmatchedRows: unmatchedCount,
      notes: `Ingested ${validCount} student records. Rejected ${invalidCount + duplicateCount} faulty rows.`
    };

    state.importHistory.unshift(historyEntry);
    setStorage('importHistory', state.importHistory);

    // Close preview modal
    document.getElementById('importPreviewBackdrop').classList.remove('open');
    state.stagedImport = null;

    showToast(`Successfully committed Dataset Version ${historyEntry.version} (${validCount} records updated)!`);
    renderCurrentPage();
  }

  // --- Download Sample Templates ---
  function generateSampleTemplates() {
    const sampleData = [
      { 'Roll Number': '25EU02094', 'Student Name': 'Madupu Karthikeya', 'Department': 'Computer Science', 'Year/Section': 'IV-AIML', 'Classes Conducted': 240, 'Classes Attended': 210, 'Data As Of': '2026-10-12', 'Attendance Percentage': 87.5 },
      { 'Roll Number': '1RV22CS142', 'Student Name': 'Sneha Reddy', 'Department': 'Computer Science', 'Year/Section': 'III-A', 'Classes Conducted': 250, 'Classes Attended': 206, 'Data As Of': '2026-10-12', 'Attendance Percentage': 82.4 },
      { 'Roll Number': '1RV22EC078', 'Student Name': 'Karthik Verma', 'Department': 'Electronics', 'Year/Section': 'III-A', 'Classes Conducted': 240, 'Classes Attended': 164, 'Data As Of': '2026-10-12', 'Attendance Percentage': 68.3 },
      { 'Roll Number': '1RV22ME032', 'Student Name': 'Meera Nambiar', 'Department': 'Mechanical', 'Year/Section': 'III-A', 'Classes Conducted': 230, 'Classes Attended': 178, 'Data As Of': '2026-10-12', 'Attendance Percentage': 77.4 }
    ];

    return sampleData;
  }

  function downloadTemplateCsv() {
    const data = generateSampleTemplates();
    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];
    data.forEach(row => {
      lines.push(headers.map(h => `"${row[h]}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance_import_template.csv';
    link.click();
    showToast('Downloaded attendance_import_template.csv');
  }

  function downloadTemplateXlsx() {
    if (!window.XLSX) {
      downloadTemplateCsv();
      return;
    }
    const data = generateSampleTemplates();
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'AttendanceData');
    window.XLSX.writeFile(wb, 'attendance_import_template.xlsx');
    showToast('Downloaded attendance_import_template.xlsx');
  }

  // --- Export Reports ---
  function exportAttendance(format) {
    const rows = state.students.map(s => {
      const elig = computeStudentAttendance(s);
      return {
        'Roll Number': s.roll,
        'Student Name': s.name,
        'Department': s.dept,
        'Year/Section': s.yearSection,
        'Classes Conducted': s.conducted,
        'Classes Attended': s.attended,
        'Calculated Attendance %': elig.displayPct,
        'Eligibility Status': elig.status,
        'Eligibility Ground / Note': elig.reason,
        'Data As Of': s.asOf || 'N/A',
        'Assigned Proctor': s.proctor || 'Dr. Alan Smith'
      };
    });

    if (format === 'xlsx' && window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'AttendanceEligibility');
      window.XLSX.writeFile(wb, `Attendance_Eligibility_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Attendance_Eligibility_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
    showToast(`Exported Attendance Eligibility Report (${format.toUpperCase()})`);
  }

  function exportRequests(format) {
    const rows = state.requests.map(r => {
      const st = state.students.find(s => s.roll === r.roll);
      const elig = computeStudentAttendance(st);
      return {
        'Reference ID': r.id,
        'Roll Number': r.roll,
        'Student Name': r.studentName,
        'Department': r.dept,
        'Event Title': r.event,
        'Category': r.category,
        'Organizer': r.organizer,
        'Venue': r.venue,
        'Start Date': r.start,
        'End Date': r.end,
        'Student Attendance %': elig.displayPct,
        'Workflow Status': r.status,
        'Proctor Recommendation': r.proctorRemarks || 'None',
        'Final Remarks': r.inchargeRemarks || 'None',
        'Decision Authority': r.decisionAuthority || 'Pending',
        'Decision Date': r.decisionDate || 'Pending',
        'Exception Override': r.overrideAuthorized ? `YES: ${r.overrideReason}` : 'NO'
      };
    });

    if (format === 'xlsx' && window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'EventApprovals');
      window.XLSX.writeFile(wb, `Event_Approvals_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Event_Approvals_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
    showToast(`Exported Event Approvals Report (${format.toUpperCase()})`);
  }

  function exportAudit(format) {
    const rows = [];
    state.requests.forEach(r => {
      (r.history || []).forEach(h => {
        rows.push({
          'Timestamp': h.date,
          'Reference ID': r.id,
          'Student Roll': r.roll,
          'Student Name': r.studentName,
          'Action Taken': h.action,
          'Workflow Status': h.status,
          'Actor Name': h.user,
          'Actor Role': h.role,
          'Audit Remarks': h.remarks || 'None'
        });
      });
    });

    if (!rows.length) {
      showToast('No audit trail records found.');
      return;
    }

    if (format === 'xlsx' && window.XLSX) {
      const ws1 = window.XLSX.utils.json_to_sheet(rows);
      const ws2 = window.XLSX.utils.json_to_sheet(state.importHistory);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws1, 'WorkflowAuditTrail');
      window.XLSX.utils.book_append_sheet(wb, ws2, 'DatasetVersionLogs');
      window.XLSX.writeFile(wb, `System_Audit_Trail_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `System_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
    showToast(`Exported Audit Trail Report (${format.toUpperCase()})`);
  }

  function exportComprehensivePackage() {
    if (!window.XLSX) {
      showToast('Excel library readying...');
      return;
    }
    const attRows = state.students.map(s => {
      const elig = computeStudentAttendance(s);
      return {
        'Roll Number': s.roll,
        'Student Name': s.name,
        'Department': s.dept,
        'Year/Section': s.yearSection,
        'Classes Conducted': s.conducted,
        'Classes Attended': s.attended,
        'Calculated Attendance %': elig.displayPct,
        'Eligibility Status': elig.status,
        'Data As Of': s.asOf || 'N/A',
        'Assigned Proctor': s.proctor || 'Dr. Alan Smith'
      };
    });

    const reqRows = state.requests.map(r => {
      const st = state.students.find(s => s.roll === r.roll);
      const elig = computeStudentAttendance(st);
      return {
        'Reference ID': r.id,
        'Roll Number': r.roll,
        'Student Name': r.studentName,
        'Department': r.dept,
        'Event Title': r.event,
        'Category': r.category,
        'Dates': `${r.start} to ${r.end}`,
        'Venue': r.venue,
        'Attendance %': elig.displayPct,
        'Workflow Status': r.status,
        'Proctor Recommendation': r.proctorRemarks || 'None',
        'Final Authority Decision': r.inchargeRemarks || 'None',
        'Exception Override': r.overrideAuthorized ? `YES (${r.overrideReason})` : 'NO'
      };
    });

    const auditRows = [];
    state.requests.forEach(r => {
      (r.history || []).forEach(h => {
        auditRows.push({
          'Timestamp': h.date,
          'Reference ID': r.id,
          'Student Name': r.studentName,
          'Actor': `${h.user} (${h.role})`,
          'Action': h.action,
          'Remarks': h.remarks || 'None'
        });
      });
    });

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(attRows), 'AttendanceRegistry');
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(reqRows), 'EventApprovals');
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(auditRows), 'AuditTrail');
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(state.importHistory), 'DatasetVersions');

    window.XLSX.writeFile(wb, `SAHE_Comprehensive_Audit_Package_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Downloaded Full Institutional Compliance Package (.xlsx)');
  }

  // --- Modal: Request Audit Trail & Interactive Details View ---
  function openRequestDetailsModal(reqId) {
    const r = state.requests.find(x => x.id === reqId);
    if (!r) return;

    const user = DEFAULT_USERS[state.role];
    const st = state.students.find(s => s.roll === r.roll);
    const elig = computeStudentAttendance(st);
    const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

    const container = document.getElementById('detailsModalContent');
    const actionsContainer = document.getElementById('detailsModalActions');
    if (!container) return;

    container.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; margin: 16px 0;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:0.86rem;">
          <div><strong>Reference Number:</strong> ${r.id}</div>
          <div><strong>Current Status:</strong> ${renderStatusBadge(r.status, overlaps.length > 0, r.overrideAuthorized)}</div>
          <div><strong>Student Name:</strong> ${r.studentName} (${r.roll})</div>
          <div><strong>Department:</strong> ${r.dept} (${r.yearSection})</div>
          <div><strong>Event Title:</strong> ${r.event}</div>
          <div><strong>Category & Organizer:</strong> ${r.category} • ${r.organizer}</div>
          <div><strong>Duration:</strong> ${r.start} to ${r.end}</div>
          <div><strong>Venue:</strong> ${r.venue}</div>
          <div>
            <strong>Verified Attendance:</strong> 
            ${renderEligibilityBadge(elig)}
            <small style="display:block; color:#64748b;">Conducted: ${st?st.conducted:0}, Attended: ${st?st.attended:0} (As Of: ${st?st.asOf:'N/A'})</small>
          </div>
          <div>
            <strong>Assigned Faculty Proctor:</strong> ${r.proctor}
          </div>
        </div>

        ${r.url ? `
          <div style="margin-top:12px; font-size:0.84rem;">
            <strong>Official Event URL:</strong> <a href="${r.url}" target="_blank" rel="noopener" style="color:#4f46e5;">${r.url} ↗</a>
          </div>
        ` : ''}

        <div style="margin-top:12px; font-size:0.84rem; background:#ffffff; padding:10px; border-radius:6px; border:1px solid #edf2f7;">
          <strong>Purpose / Academic Benefit:</strong>
          <p style="color:#475569; margin-top:2px;">${r.purpose || 'Not specified'}</p>
        </div>

        ${r.docName ? `
          <div style="margin-top:10px; font-size:0.82rem; color:#0369a1;">
            <strong>Supporting Attachment:</strong> 📄 ${r.docName} (Verified document)
          </div>
        ` : ''}

        ${overlaps.length > 0 ? `
          <div class="form-banner banner-warning" style="margin-top:12px;">
            <strong>Date Overlap Conflict Detected:</strong>
            ${overlaps.map(o => `<div>• Overlaps with <strong>${o.id} (${o.event})</strong> scheduled ${o.start} to ${o.end}</div>`).join('')}
          </div>
        ` : ''}

        ${r.overrideAuthorized ? `
          <div class="form-banner banner-info" style="margin-top:12px; background:#f5f3ff; color:#6d28d9; border-color:#ddd6fe;">
            <strong>Authorized Exception Override on Record:</strong>
            <div>${r.overrideReason} (Approved by ${r.decisionAuthority})</div>
          </div>
        ` : ''}
      </div>

      <div>
        <h4 style="font-size:0.95rem; margin-bottom:8px;">Traceable Action History & Audit Log</h4>
        <div class="timeline">
          ${(r.history || []).map(h => `
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <p><strong>${h.action}</strong> by <strong>${h.user} (${h.role})</strong></p>
              <small style="display:block; color:#475569;">Remarks: "${h.remarks || 'No remarks entered'}"</small>
              <small style="color:#94a3b8;">${h.date}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (actionsContainer) {
      const isMyStudent = (state.role === 'proctor' && user.assignedStudents && user.assignedStudents.includes(r.roll));
      const canProctorReview = isMyStudent && ['Submitted', 'Under Proctor Review'].includes(r.status);
      const canInchargeDecide = (state.role === 'admin') && ['Recommended for Approval', 'Recommended for Rejection', 'Pending Final Decision', 'Submitted', 'Under Proctor Review'].includes(r.status);
      const canEditReturned = (state.role === 'student' && r.roll === user.id) && (r.status === 'Returned for Correction' || r.status === 'Draft');
      const canWithdraw = (state.role === 'student' && r.roll === user.id) && ['Draft', 'Submitted', 'Under Proctor Review', 'Returned for Correction'].includes(r.status);

      actionsContainer.innerHTML = `
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; width:100%; justify-content:space-between;">
          <div style="display:flex; gap:8px;">
            <button type="button" class="secondary-button" id="btnDismissDetails">Close</button>
            <button type="button" class="secondary-button" id="btnDetailsPrint">🖨 Print / Export</button>
          </div>
          <div style="display:flex; gap:8px;">
            ${canWithdraw ? `<button type="button" class="action-btn-danger" id="btnDetailsWithdraw" style="padding:8px 14px; border-radius:8px;">Withdraw Request</button>` : ''}
            ${canEditReturned ? `<button type="button" class="primary-button" id="btnDetailsEdit">✎ Edit & Resubmit</button>` : ''}
            ${canProctorReview ? `<button type="button" class="primary-button" id="btnDetailsProctor">Review & Recommend</button>` : ''}
            ${canInchargeDecide ? `<button type="button" class="primary-button" id="btnDetailsIncharge">Record Final Decision</button>` : ''}
          </div>
        </div>
      `;

      const btnDismiss = document.getElementById('btnDismissDetails');
      if (btnDismiss) btnDismiss.onclick = () => document.getElementById('detailsModalBackdrop').classList.remove('open');

      const btnPrint = document.getElementById('btnDetailsPrint');
      if (btnPrint) btnPrint.onclick = () => window.print();

      const btnEdit = document.getElementById('btnDetailsEdit');
      if (btnEdit) {
        btnEdit.onclick = () => {
          document.getElementById('detailsModalBackdrop').classList.remove('open');
          openRequestModal(r.id);
        };
      }

      const btnProc = document.getElementById('btnDetailsProctor');
      if (btnProc) {
        btnProc.onclick = () => {
          document.getElementById('detailsModalBackdrop').classList.remove('open');
          openProctorModal(r.id);
        };
      }

      const btnInc = document.getElementById('btnDetailsIncharge');
      if (btnInc) {
        btnInc.onclick = () => {
          document.getElementById('detailsModalBackdrop').classList.remove('open');
          openInchargeModal(r.id);
        };
      }

      const btnWd = document.getElementById('btnDetailsWithdraw');
      if (btnWd) {
        btnWd.onclick = () => {
          if (confirm(`Are you sure you want to withdraw request ${r.id}? This action cannot be undone.`)) {
            r.status = 'Withdrawn';
            r.history = r.history || [];
            r.history.push({
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              user: user.name,
              role: 'Student',
              action: 'Withdrawn',
              status: 'Withdrawn',
              remarks: 'Withdrawn by student prior to final review.'
            });
            setStorage('requests', state.requests);
            document.getElementById('detailsModalBackdrop').classList.remove('open');
            showToast(`Request ${r.id} has been withdrawn.`);
            renderCurrentPage();
          }
        };
      }
    }

    document.getElementById('detailsModalBackdrop').classList.add('open');
  }

  // --- Modal: User Profile & Session Modal ---
  function openProfileModal() {
    const user = DEFAULT_USERS[state.role];
    const container = document.getElementById('profileModalContent');
    const modal = document.getElementById('profileModalBackdrop');
    if (!container || !modal) return;

    let extraDetails = '';
    if (state.role === 'student') {
      const st = state.students.find(s => s.roll === user.id) || { conducted: 240, attended: 210, asOf: '2026-10-10' };
      const elig = computeStudentAttendance(st);
      const reqCount = state.requests.filter(r => r.roll === user.id).length;
      extraDetails = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin: 14px 0; font-size:0.86rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><strong>Verified Attendance:</strong> ${renderEligibilityBadge(elig)}</div>
            <div><strong>Classes Logged:</strong> ${st.attended} / ${st.conducted} classes</div>
            <div><strong>Assigned Proctor:</strong> ${user.proctor || 'Dr. Alan Smith'}</div>
            <div><strong>Total Requests:</strong> ${reqCount} submitted applications</div>
          </div>
        </div>
      `;
    } else if (state.role === 'proctor') {
      const assignedCount = user.assignedStudents ? user.assignedStudents.length : 0;
      const pendingCount = state.requests.filter(r => user.assignedStudents && user.assignedStudents.includes(r.roll) && ['Submitted', 'Under Proctor Review'].includes(r.status)).length;
      extraDetails = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin: 14px 0; font-size:0.86rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><strong>Mentorship Care:</strong> ${assignedCount} assigned students</div>
            <div><strong>Pending Reviews:</strong> ${pendingCount} applications</div>
            <div><strong>Department:</strong> ${user.dept}</div>
            <div><strong>Role Scope:</strong> Recommender (Non-Finalizing)</div>
          </div>
        </div>
      `;
    } else {
      extraDetails = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin: 14px 0; font-size:0.86rem;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><strong>Governance Level:</strong> Level 3 Final Authority</div>
            <div><strong>Active Threshold:</strong> Minimum ${state.threshold}%</div>
            <div><strong>Dataset Version:</strong> ${state.importHistory[0] ? state.importHistory[0].version : 'None'}</div>
            <div><strong>Campus:</strong> Engineering & Technology</div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <div class="avatar ${user.avatarClass}" style="width:54px; height:54px; font-size:1.3rem;">${user.avatar}</div>
        <div>
          <h3 style="font-size:1.15rem; margin-bottom:2px;">${user.name}</h3>
          <p style="color:#64748b; font-size:0.85rem;">${user.title} • ID: <code>${user.id}</code></p>
        </div>
      </div>
      ${extraDetails}
      <div style="margin-top:16px;">
        <label style="font-size:0.8rem; font-weight:700; color:#475569; display:block; margin-bottom:6px;">QUICK ROLE PERSPECTIVE SWITCHER</label>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn-demo-pill ${state.role==='student'?'active':''}" id="btnProfileSwitchStudent" style="flex:1; text-align:center; justify-content:center;">🎓 Student</button>
          <button type="button" class="btn-demo-pill ${state.role==='proctor'?'active':''}" id="btnProfileSwitchProctor" style="flex:1; text-align:center; justify-content:center;">👨‍🏫 Proctor</button>
          <button type="button" class="btn-demo-pill ${state.role==='admin'?'active':''}" id="btnProfileSwitchIncharge" style="flex:1; text-align:center; justify-content:center;">🏛 In-Charge</button>
        </div>
      </div>
    `;

    const sBtn = document.getElementById('btnProfileSwitchStudent');
    if (sBtn) {
      sBtn.onclick = () => {
        modal.classList.remove('open');
        state.role = 'student';
        setStorage('role', 'student');
        showToast('Switched to Student perspective.');
        renderCurrentPage();
      };
    }
    const pBtn = document.getElementById('btnProfileSwitchProctor');
    if (pBtn) {
      pBtn.onclick = () => {
        modal.classList.remove('open');
        state.role = 'proctor';
        setStorage('role', 'proctor');
        showToast('Switched to Faculty Proctor perspective.');
        renderCurrentPage();
      };
    }
    const aBtn = document.getElementById('btnProfileSwitchIncharge');
    if (aBtn) {
      aBtn.onclick = () => {
        modal.classList.remove('open');
        state.role = 'admin';
        setStorage('role', 'admin');
        showToast('Switched to Technical Event In-Charge perspective.');
        renderCurrentPage();
      };
    }

    modal.classList.add('open');
  }

  // --- Modal: Institutional Workspace Modal ---
  function openWorkspaceModal() {
    const container = document.getElementById('workspaceModalContent');
    const modal = document.getElementById('workspaceModalBackdrop');
    if (!container || !modal) return;

    const latest = state.importHistory[0] || { version: 'v1.0 (Baseline)', importedAt: '2026-10-10 09:30', totalRows: 14, validRows: 13 };
    const eligibleCount = state.students.filter(s => computeStudentAttendance(s).isEligible).length;

    container.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin: 14px 0;">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
          <div class="workspace-icon" style="width:48px; height:48px; font-size:1.1rem; border-radius:12px;">SA</div>
          <div>
            <h3 style="font-size:1.2rem; margin-bottom:2px;">Siddhartha Academy of Higher Education</h3>
            <p style="color:#64748b; font-size:0.86rem;">Engineering & Technology Campus • Autonomous Accreditation</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; font-size:0.86rem; border-top:1px solid #edf2f7; padding-top:14px;">
          <div><strong>Academic Session:</strong> 2026-2027 (Odd Semester)</div>
          <div><strong>Attendance Policy Threshold:</strong> <span style="color:#4f46e5; font-weight:700;">${state.threshold}%</span></div>
          <div><strong>Student Registry Size:</strong> ${state.students.length} verified enrolled students (${eligibleCount} eligible)</div>
          <div><strong>Event Requests Monitored:</strong> ${state.requests.length} tracked records</div>
          <div><strong>Dataset Baseline:</strong> ${latest.version} (${latest.importedAt})</div>
          <div><strong>Ingestion Source:</strong> <code>${latest.filename}</code> (${latest.validRows} valid rows)</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-top:16px;">
        <button type="button" class="btn-demo-pill" id="btnWsNavOverview" style="justify-content:center; padding:10px;">
          ◫ Overview
        </button>
        <button type="button" class="btn-demo-pill" id="btnWsNavAtt" style="justify-content:center; padding:10px;">
          ◉ Attendance Registry
        </button>
        <button type="button" class="btn-demo-pill" id="btnWsNavRules" style="justify-content:center; padding:10px;">
          ⚙ Eligibility Rules
        </button>
      </div>
    `;

    const btnOv = document.getElementById('btnWsNavOverview');
    if (btnOv) {
      btnOv.onclick = () => {
        modal.classList.remove('open');
        handleNavigation('dashboard');
      };
    }
    const btnAtt = document.getElementById('btnWsNavAtt');
    if (btnAtt) {
      btnAtt.onclick = () => {
        modal.classList.remove('open');
        handleNavigation('attendance');
      };
    }
    const btnRu = document.getElementById('btnWsNavRules');
    if (btnRu) {
      btnRu.onclick = () => {
        modal.classList.remove('open');
        handleNavigation('rules');
      };
    }

    modal.classList.add('open');
  }

  // --- Modal: Submit / Edit Event Request ---
  function openRequestModal(editReqId) {
    const user = DEFAULT_USERS[state.role];
    const form = document.getElementById('requestForm');
    if (!form) return;

    form.reset();
    document.getElementById('editRequestId').value = editReqId || '';

    const st = state.students.find(s => s.roll === user.id) || { conducted: 240, attended: 210, asOf: '2026-10-10' };
    const elig = computeStudentAttendance(st);

    const banner = document.getElementById('formEligibilityBanner');
    if (banner) {
      banner.style.display = 'block';
      banner.className = `form-banner ${elig.isEligible ? 'banner-info' : 'banner-warning'}`;
      banner.innerHTML = `<strong>Your Current Attendance:</strong> ${elig.displayPct} (${elig.status}). ${elig.reason}`;
    }

    if (editReqId) {
      const r = state.requests.find(x => x.id === editReqId);
      if (r) {
        document.getElementById('modalTitle').textContent = `Edit Request (${r.id})`;
        document.getElementById('modalDesc').textContent = 'Update event details and supporting documentation per proctor remarks before resubmission.';
        document.getElementById('reqEventTitle').value = r.event;
        document.getElementById('reqOrganizer').value = r.organizer;
        document.getElementById('reqCategory').value = r.category;
        document.getElementById('reqStartDate').value = r.start;
        document.getElementById('reqEndDate').value = r.end;
        document.getElementById('reqVenue').value = r.venue;
        document.getElementById('reqUrl').value = r.url || '';
        document.getElementById('reqPurpose').value = r.purpose || '';

        if (r.docName) {
          const docSpan = document.getElementById('existingDocName');
          docSpan.style.display = 'block';
          docSpan.textContent = `Attached: ${r.docName}`;
        }
      }
    } else {
      document.getElementById('modalTitle').textContent = 'Submit External Event Request';
      document.getElementById('modalDesc').textContent = 'Fill in event parameters to route your application through proctor recommendation and institutional approval.';
      document.getElementById('existingDocName').style.display = 'none';
    }

    document.getElementById('modalBackdrop').classList.add('open');
  }

  function handleRequestFormSubmit(e) {
    e.preventDefault();
    const user = DEFAULT_USERS[state.role];
    const editId = document.getElementById('editRequestId').value;

    const event = document.getElementById('reqEventTitle').value.trim();
    const organizer = document.getElementById('reqOrganizer').value.trim();
    const category = document.getElementById('reqCategory').value;
    const start = document.getElementById('reqStartDate').value;
    const end = document.getElementById('reqEndDate').value;
    const venue = document.getElementById('reqVenue').value.trim();
    const url = document.getElementById('reqUrl').value.trim();
    const purpose = document.getElementById('reqPurpose').value.trim();
    const fileInput = document.getElementById('reqFile');

    // Validation
    if (!event || !organizer || !category || !start || !end || !venue || !purpose) {
      showToast('Please fill in all mandatory fields.');
      return;
    }

    if (new Date(end) < new Date(start)) {
      showToast('Validation Error: End date cannot precede start date.');
      return;
    }

    const studentRoll = user.id;
    const studentObj = state.students.find(s => s.roll === studentRoll) || { name: user.name, dept: user.dept, yearSection: user.yearSection || '5' };

    let docName = '';
    if (fileInput.files && fileInput.files[0]) {
      docName = fileInput.files[0].name;
    }

    // Overlap check
    const overlaps = checkDateOverlap(studentRoll, start, end, editId);
    if (overlaps.length > 0) {
      if (!confirm(`Notice: This request dates overlap with your existing request (${overlaps[0].id} - ${overlaps[0].event}). Do you wish to continue and submit for review?`)) {
        return;
      }
    }

    if (editId) {
      // Edit returned request
      const r = state.requests.find(x => x.id === editId);
      if (r) {
        r.event = event;
        r.organizer = organizer;
        r.category = category;
        r.start = start;
        r.end = end;
        r.venue = venue;
        r.url = url;
        r.purpose = purpose;
        if (docName) r.docName = docName;
        r.status = 'Under Proctor Review'; // Resubmit routes back to proctor
        r.history = r.history || [];
        r.history.push({
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          user: user.name,
          role: 'Student',
          action: 'Updated and resubmitted request',
          status: 'Under Proctor Review',
          remarks: 'Updated event specifications and supporting files.'
        });

        showToast(`Request ${r.id} successfully updated and resubmitted for Proctor review!`);
      }
    } else {
      // New request submission
      const newRef = `REQ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const newReq = {
        id: newRef,
        roll: studentRoll,
        studentName: studentObj.name,
        dept: studentObj.dept,
        yearSection: studentObj.yearSection,
        proctor: user.proctor || 'Dr. Alan Smith',
        event,
        organizer,
        category,
        venue,
        start,
        end,
        url,
        purpose,
        docName: docName || 'uploaded_proof.pdf',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        proctorRemarks: '',
        inchargeRemarks: '',
        decisionDate: null,
        decisionAuthority: null,
        overrideAuthorized: false,
        overrideReason: '',
        history: [
          {
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            user: user.name,
            role: 'Student',
            action: 'Submitted participation request',
            status: 'Submitted',
            remarks: 'Application created via student portal.'
          }
        ]
      };

      state.requests.unshift(newReq);
      showToast(`Request ${newRef} submitted successfully!`);
    }

    setStorage('requests', state.requests);
    document.getElementById('modalBackdrop').classList.remove('open');
    renderCurrentPage();
  }

  // --- Modal: Proctor Recommendation ---
  function openProctorModal(reqId) {
    const r = state.requests.find(x => x.id === reqId);
    if (!r) return;

    const st = state.students.find(s => s.roll === r.roll);
    const elig = computeStudentAttendance(st);
    const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

    document.getElementById('proctorReqId').value = reqId;
    const content = document.getElementById('proctorModalContent');
    if (content) {
      content.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin: 12px 0; font-size:0.86rem;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><strong>Student:</strong> ${r.studentName} (${r.roll})</div>
            <div><strong>Event:</strong> ${r.event} (${r.category})</div>
            <div><strong>Dates:</strong> ${r.start} to ${r.end}</div>
            <div><strong>Verified Attendance:</strong> ${renderEligibilityBadge(elig)}</div>
          </div>
          ${overlaps.length > 0 ? `<div class="form-banner banner-warning" style="margin-top:10px;">⚠ Student has ${overlaps.length} overlapping request(s) on calendar.</div>` : ''}
          ${!elig.isEligible ? `<div class="form-banner banner-danger" style="margin-top:10px;">⚠ Student fails attendance criteria: ${elig.reason}</div>` : ''}
        </div>
      `;
    }

    document.getElementById('proctorRemarks').value = '';
    document.getElementById('proctorModalBackdrop').classList.add('open');
  }

  function handleProctorSubmit(e) {
    e.preventDefault();
    const user = DEFAULT_USERS[state.role];
    const reqId = document.getElementById('proctorReqId').value;
    const decision = document.getElementById('proctorDecision').value;
    const remarks = document.getElementById('proctorRemarks').value.trim();

    if (!remarks) {
      showToast('Mandatory remarks required for proctor recommendation.');
      return;
    }

    const r = state.requests.find(x => x.id === reqId);
    if (!r) return;

    r.status = decision;
    r.proctorRemarks = remarks;
    r.history = r.history || [];
    r.history.push({
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: user.name,
      role: 'Proctor',
      action: decision,
      status: decision,
      remarks
    });

    setStorage('requests', state.requests);
    document.getElementById('proctorModalBackdrop').classList.remove('open');
    showToast(`Proctor recommendation recorded for ${r.id}!`);
    renderCurrentPage();
  }

  // --- Modal: Event In-Charge Decision (With Override) ---
  function openInchargeModal(reqId) {
    const r = state.requests.find(x => x.id === reqId);
    if (!r) return;

    const st = state.students.find(s => s.roll === r.roll);
    const elig = computeStudentAttendance(st);
    const overlaps = checkDateOverlap(r.roll, r.start, r.end, r.id);

    document.getElementById('inchargeReqId').value = reqId;
    const content = document.getElementById('inchargeModalContent');
    if (content) {
      content.innerHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin: 12px 0; font-size:0.86rem;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><strong>Student:</strong> ${r.studentName} (${r.roll})</div>
            <div><strong>Department:</strong> ${r.dept} (${r.yearSection})</div>
            <div><strong>Event:</strong> ${r.event}</div>
            <div><strong>Dates:</strong> ${r.start} to ${r.end}</div>
            <div><strong>Attendance:</strong> ${renderEligibilityBadge(elig)}</div>
            <div><strong>Proctor Recommendation:</strong> <strong>${r.status}</strong></div>
          </div>
          <div style="margin-top:10px; font-size:0.82rem; background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
            <strong>Proctor Remarks:</strong> "${r.proctorRemarks || 'None recorded'}"
          </div>
        </div>
      `;
    }

    // Toggle override panel if student is attendance-ineligible
    const overrideBox = document.getElementById('overrideBox');
    const chkOverride = document.getElementById('chkAuthorizeOverride');
    const lblJust = document.getElementById('lblOverrideJustification');
    const txtJust = document.getElementById('txtOverrideJustification');

    chkOverride.checked = false;
    txtJust.value = '';
    lblJust.style.display = 'none';

    if (!elig.isEligible) {
      overrideBox.style.display = 'block';
      chkOverride.onchange = () => {
        lblJust.style.display = chkOverride.checked ? 'block' : 'none';
      };
    } else {
      overrideBox.style.display = 'none';
    }

    document.getElementById('inchargeRemarks').value = '';
    document.getElementById('inchargeModalBackdrop').classList.add('open');
  }

  function handleInchargeSubmit(e) {
    e.preventDefault();
    const user = DEFAULT_USERS[state.role];
    const reqId = document.getElementById('inchargeReqId').value;
    const decision = document.getElementById('inchargeDecision').value;
    const remarks = document.getElementById('inchargeRemarks').value.trim();
    const chkOverride = document.getElementById('chkAuthorizeOverride');
    const txtJust = document.getElementById('txtOverrideJustification');

    if (!remarks) {
      showToast('Mandatory decision remarks / reason required.');
      return;
    }

    const r = state.requests.find(x => x.id === reqId);
    if (!r) return;

    const st = state.students.find(s => s.roll === r.roll);
    const elig = computeStudentAttendance(st);

    // If approving an ineligible student, must have authorized override checked!
    if (decision === 'Approved' && !elig.isEligible && !chkOverride.checked) {
      alert('Institutional Policy Violation: This student does not meet the minimum attendance requirement. You must explicitly authorize an Exception Override with justification to approve.');
      return;
    }

    if (decision === 'Approved' && !elig.isEligible && chkOverride.checked && !txtJust.value.trim()) {
      alert('Please provide the Exception Justification reference.');
      return;
    }

    r.status = decision;
    r.inchargeRemarks = remarks;
    r.decisionDate = new Date().toISOString().slice(0, 10);
    r.decisionAuthority = `${user.name} (${user.title})`;

    if (chkOverride.checked && !elig.isEligible) {
      r.overrideAuthorized = true;
      r.overrideReason = txtJust.value.trim();
    }

    r.history = r.history || [];
    r.history.push({
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: user.name,
      role: 'In-Charge',
      action: decision,
      status: decision,
      remarks: remarks + (r.overrideAuthorized ? ` [EXCEPTION OVERRIDE: ${r.overrideReason}]` : '')
    });

    setStorage('requests', state.requests);
    document.getElementById('inchargeModalBackdrop').classList.remove('open');
    showToast(`Decision recorded: ${r.id} is ${decision.toUpperCase()}!`);
    renderCurrentPage();
  }

  // --- View Router & Event Wire-Up ---
  function renderCurrentPage() {
    syncHeaderAndRole();

    switch (state.activePage) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'requests':
        renderRequestsView();
        break;
      case 'attendance':
        renderAttendanceView();
        break;
      case 'reports':
        renderReportsView();
        break;
      case 'rules':
        renderRulesView();
        break;
      case 'audit':
        renderAuditView();
        break;
      default:
        renderDashboardView();
    }
  }

  function handleNavigation(page) {
    state.activePage = page;
    location.hash = page;
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function attachCommonViewListeners() {
    // Navigation links with [data-nav]
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.onclick = () => handleNavigation(el.getAttribute('data-nav'));
    });

    // Filtered request navigation links with [data-nav-req]
    document.querySelectorAll('[data-nav-req]').forEach(el => {
      el.onclick = () => {
        state.requestFilter = el.getAttribute('data-nav-req');
        handleNavigation('requests');
      };
    });

    // Request Details buttons
    document.querySelectorAll('[data-view]').forEach(el => {
      el.onclick = () => openRequestDetailsModal(el.getAttribute('data-view'));
    });

    // Edit returned request buttons
    document.querySelectorAll('[data-edit]').forEach(el => {
      el.onclick = () => openRequestModal(el.getAttribute('data-edit'));
    });

    // Proctor review triggers
    document.querySelectorAll('[data-proctor-review]').forEach(el => {
      el.onclick = () => openProctorModal(el.getAttribute('data-proctor-review'));
    });

    // In-Charge decision triggers
    document.querySelectorAll('[data-incharge-decide]').forEach(el => {
      el.onclick = () => openInchargeModal(el.getAttribute('data-incharge-decide'));
    });

    // Withdraw trigger
    document.querySelectorAll('[data-withdraw]').forEach(el => {
      el.onclick = () => {
        const id = el.getAttribute('data-withdraw');
        if (confirm(`Are you sure you want to withdraw request ${id}? This action cannot be undone.`)) {
          const r = state.requests.find(x => x.id === id);
          if (r) {
            r.status = 'Withdrawn';
            r.history = r.history || [];
            r.history.push({
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              user: DEFAULT_USERS[state.role].name,
              role: 'Student',
              action: 'Withdrawn',
              status: 'Withdrawn',
              remarks: 'Withdrawn by student prior to final review.'
            });
            setStorage('requests', state.requests);
            showToast(`Request ${id} has been withdrawn.`);
            renderCurrentPage();
          }
        }
      };
    });

    // Open New Request button
    const newBtn = document.getElementById('btnOpenNewRequest');
    if (newBtn) {
      newBtn.onclick = () => openRequestModal(null);
    }

    // Quick download templates button on dashboard
    const qTmplBtn = document.getElementById('btnDownloadTemplatesQuick');
    if (qTmplBtn) {
      qTmplBtn.onclick = () => {
        const modal = document.getElementById('templateModalBackdrop');
        if (modal) modal.classList.add('open');
      };
    }
  }

  function attachRequestFilterListeners() {
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.onclick = () => {
        state.requestFilter = btn.getAttribute('data-filter');
        renderRequestsView();
      };
    });

    const searchInput = document.getElementById('filterSearch');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderRequestsView();
      };
    }

    const deptSelect = document.getElementById('filterDept');
    if (deptSelect) {
      deptSelect.onchange = (e) => {
        state.deptFilter = e.target.value;
        renderRequestsView();
      };
    }

    const catSelect = document.getElementById('filterCategory');
    if (catSelect) {
      catSelect.onchange = (e) => {
        state.categoryFilter = e.target.value;
        renderRequestsView();
      };
    }

    const procSelect = document.getElementById('filterProctor');
    if (procSelect) {
      procSelect.onchange = (e) => {
        state.proctorFilter = e.target.value;
        renderRequestsView();
      };
    }

    const expCsv = document.getElementById('btnExportRequestsCsv');
    if (expCsv) expCsv.onclick = () => exportRequests('csv');

    const expXlsx = document.getElementById('btnExportRequestsXlsx');
    if (expXlsx) expXlsx.onclick = () => exportRequests('xlsx');
  }

  // --- Multi-Role Authentication Subsystem (Student, Proctor, In-Charge) ---
  function switchLoginTab(roleKey) {
    const tabMap = [
      { id: 'tabStudent', panelId: 'panelStudent', role: 'student' },
      { id: 'tabProctor', panelId: 'panelProctor', role: 'proctor' },
      { id: 'tabIncharge', panelId: 'panelIncharge', role: 'admin' }
    ];

    tabMap.forEach(item => {
      const tabEl = document.getElementById(item.id);
      const panelEl = document.getElementById(item.panelId);
      const isActive = (item.role === roleKey);
      if (tabEl) {
        tabEl.classList.toggle('active', isActive);
        tabEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
      if (panelEl) {
        panelEl.classList.toggle('active', isActive);
      }
    });
  }

  function updateAuthState() {
    const loginEl = document.getElementById('loginScreen');
    const appEl = document.getElementById('appShell');
    if (!loginEl || !appEl) return;

    if (state.isLoggedIn) {
      loginEl.style.display = 'none';
      appEl.style.display = 'flex';
      renderCurrentPage();
    } else {
      loginEl.style.display = 'flex';
      appEl.style.display = 'none';
      switchLoginTab(state.role || 'student');
    }
  }

  function initAuthAndLogin() {
    // 1. Role Tabs Click Handlers
    const tabStudent = document.getElementById('tabStudent');
    if (tabStudent) {
      tabStudent.onclick = () => switchLoginTab('student');
    }

    const tabProctor = document.getElementById('tabProctor');
    if (tabProctor) {
      tabProctor.onclick = () => switchLoginTab('proctor');
    }

    const tabIncharge = document.getElementById('tabIncharge');
    if (tabIncharge) {
      tabIncharge.onclick = () => switchLoginTab('admin');
    }

    // 2. Demo Auto-Fill Pill Selectors
    document.querySelectorAll('[data-autofill-student]').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('[data-autofill-student]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const roll = btn.getAttribute('data-autofill-student');
        const input = document.getElementById('loginStudentRoll');
        if (input) input.value = roll;
      };
    });

    document.querySelectorAll('[data-autofill-proctor]').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('[data-autofill-proctor]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const id = btn.getAttribute('data-autofill-proctor');
        const input = document.getElementById('loginProctorId');
        if (input) input.value = id;
      };
    });

    document.querySelectorAll('[data-autofill-incharge]').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('[data-autofill-incharge]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const id = btn.getAttribute('data-autofill-incharge');
        const input = document.getElementById('loginInchargeId');
        if (input) input.value = id;
      };
    });

    // 3. Form Submissions
    // Form 1: Student Login
    const formStudent = document.getElementById('formStudentLogin');
    if (formStudent) {
      formStudent.onsubmit = (e) => {
        e.preventDefault();
        const rollInput = document.getElementById('loginStudentRoll');
        const roll = (rollInput ? rollInput.value.trim().toUpperCase() : '') || '25EU02094';

        // Check if student exists in state registry or create demo profile
        let st = state.students.find(s => s.roll.toUpperCase() === roll);
        if (!st) {
          st = {
            roll: roll,
            name: 'Student ' + roll,
            dept: 'Computer Science',
            yearSection: 'IV-AIML',
            conducted: 240,
            attended: 210,
            asOf: '2026-10-10',
            suppliedPct: 87.5,
            proctor: 'Dr. Alan Smith'
          };
          state.students.unshift(st);
          setStorage('students', state.students);
        }

        DEFAULT_USERS.student = {
          id: st.roll,
          name: st.name,
          role: 'student',
          title: `B.Tech ${st.dept} (${st.yearSection})`,
          avatar: st.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST',
          avatarClass: 'student-avatar',
          dept: st.dept,
          yearSection: st.yearSection,
          proctor: st.proctor || 'Dr. Alan Smith'
        };

        state.role = 'student';
        state.isLoggedIn = true;
        setStorage('role', 'student');
        setStorage('isLoggedIn', true);
        setStorage('currentStudentUser', DEFAULT_USERS.student);

        updateAuthState();
        showToast(`Welcome, ${st.name}! Student Accreditation Portal active.`);
      };
    }

    // Form 2: Proctor Login
    const formProctor = document.getElementById('formProctorLogin');
    if (formProctor) {
      formProctor.onsubmit = (e) => {
        e.preventDefault();
        const idInput = document.getElementById('loginProctorId');
        const procId = (idInput ? idInput.value.trim().toUpperCase() : '') || 'P1001';

        if (procId === 'P1002') {
          DEFAULT_USERS.proctor = {
            id: 'P1002',
            name: 'Prof. Rao',
            role: 'proctor',
            title: 'Faculty Proctor (ECE)',
            avatar: 'PR',
            avatarClass: 'proctor-avatar',
            dept: 'Electronics',
            assignedStudents: ['1RV22EC078', '1RV22EC045', '1RV22EC112']
          };
        } else if (procId === 'P1003') {
          DEFAULT_USERS.proctor = {
            id: 'P1003',
            name: 'Dr. Kulkarni',
            role: 'proctor',
            title: 'Faculty Proctor (ME)',
            avatar: 'DK',
            avatarClass: 'proctor-avatar',
            dept: 'Mechanical',
            assignedStudents: ['1RV22ME032', '1RV22ME089']
          };
        } else {
          DEFAULT_USERS.proctor = {
            id: 'P1001',
            name: 'Dr. Alan Smith',
            role: 'proctor',
            title: 'Senior Faculty Proctor (CSE)',
            avatar: 'AS',
            avatarClass: 'proctor-avatar',
            dept: 'Computer Science',
            assignedStudents: ['25EU02094', '1RV22CS142', '1RV22CS155', '1RV22CS108', '1RV22CS190', '1RV22IS024', '1RV22IS091']
          };
        }

        state.role = 'proctor';
        state.isLoggedIn = true;
        setStorage('role', 'proctor');
        setStorage('isLoggedIn', true);

        updateAuthState();
        showToast(`Welcome, ${DEFAULT_USERS.proctor.name}! Faculty Proctor portal active.`);
      };
    }

    // Form 3: In-Charge Login
    const formIncharge = document.getElementById('formInchargeLogin');
    if (formIncharge) {
      formIncharge.onsubmit = (e) => {
        e.preventDefault();
        state.role = 'admin';
        state.isLoggedIn = true;
        setStorage('role', 'admin');
        setStorage('isLoggedIn', true);

        updateAuthState();
        showToast(`Welcome, Arjun Sharma! Technical Event Governance active.`);
      };
    }

    // 4. Logout Buttons
    const btnTopLogout = document.getElementById('btnTopLogout');
    if (btnTopLogout) {
      btnTopLogout.onclick = () => {
        state.isLoggedIn = false;
        setStorage('isLoggedIn', false);
        updateAuthState();
        showToast('Signed out of Siddhartha Academy portal.');
      };
    }

    const btnSidebarLogout = document.getElementById('btnSidebarLogout');
    if (btnSidebarLogout) {
      btnSidebarLogout.onclick = (e) => {
        e.stopPropagation();
        state.isLoggedIn = false;
        setStorage('isLoggedIn', false);
        updateAuthState();
        showToast('Signed out of Siddhartha Academy portal.');
      };
    }
  }

  // --- Initializer ---
  function init() {
    // Navigation Links
    document.querySelectorAll('.main-nav .nav-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        if (page) handleNavigation(page);
      });
    });

    // Role Switcher
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        state.role = e.target.value;
        setStorage('role', state.role);
        showToast(`Switched perspective to: ${DEFAULT_USERS[state.role].title} (${DEFAULT_USERS[state.role].name})`);
        renderCurrentPage();
      });
    }

    // Reset Demo Data
    const btnReset = document.getElementById('btnResetData');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('Reset prototype to baseline sample dataset?')) {
          localStorage.removeItem('cf_students');
          localStorage.removeItem('cf_requests');
          localStorage.removeItem('cf_threshold');
          localStorage.removeItem('cf_importHistory');
          state.students = INITIAL_STUDENTS;
          state.requests = INITIAL_REQUESTS;
          state.threshold = 75;
          state.importHistory = INITIAL_IMPORT_HISTORY;
          showToast('Prototype data reset to baseline.');
          renderCurrentPage();
        }
      };
    }

    // Modal Close Buttons
    const modalCloses = [
      { btn: 'closeModal', modal: 'modalBackdrop' },
      { btn: 'cancelModal', modal: 'modalBackdrop' },
      { btn: 'closeDetailsModal', modal: 'detailsModalBackdrop' },
      { btn: 'btnDismissDetails', modal: 'detailsModalBackdrop' },
      { btn: 'closeProctorModal', modal: 'proctorModalBackdrop' },
      { btn: 'cancelProctorModal', modal: 'proctorModalBackdrop' },
      { btn: 'closeInchargeModal', modal: 'inchargeModalBackdrop' },
      { btn: 'cancelInchargeModal', modal: 'inchargeModalBackdrop' },
      { btn: 'closeImportPreview', modal: 'importPreviewBackdrop' },
      { btn: 'btnCancelImportPreview', modal: 'importPreviewBackdrop' },
      { btn: 'closeTemplateModal', modal: 'templateModalBackdrop' },
      { btn: 'closeProfileModal', modal: 'profileModalBackdrop' },
      { btn: 'btnDismissProfile', modal: 'profileModalBackdrop' },
      { btn: 'closeWsModal', modal: 'workspaceModalBackdrop' },
      { btn: 'btnDismissWs', modal: 'workspaceModalBackdrop' }
    ];

    modalCloses.forEach(m => {
      const el = document.getElementById(m.btn);
      if (el) {
        el.onclick = () => {
          const backdrop = document.getElementById(m.modal);
          if (backdrop) backdrop.classList.remove('open');
        };
      }
    });

    // Dismiss modals when clicking on background backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('open');
      });
    });

    // Dismiss modals with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      }
    });

    // Profile & Workspace Modal Openers
    const profileCard = document.getElementById('userProfileCard');
    if (profileCard) profileCard.onclick = openProfileModal;

    const topAvatarEl = document.getElementById('topAvatar');
    if (topAvatarEl) topAvatarEl.onclick = openProfileModal;

    const wsTrigger = document.getElementById('workspaceTrigger');
    if (wsTrigger) wsTrigger.onclick = openWorkspaceModal;

    const profileLogout = document.getElementById('btnProfileLogout');
    if (profileLogout) {
      profileLogout.onclick = () => {
        const modal = document.getElementById('profileModalBackdrop');
        if (modal) modal.classList.remove('open');
        state.isLoggedIn = false;
        setStorage('isLoggedIn', false);
        updateAuthState();
        showToast('Signed out of Siddhartha Academy portal.');
      };
    }

    // Form Submissions
    const reqForm = document.getElementById('requestForm');
    if (reqForm) reqForm.onsubmit = handleRequestFormSubmit;

    const proctorForm = document.getElementById('proctorForm');
    if (proctorForm) proctorForm.onsubmit = handleProctorSubmit;

    const inchargeForm = document.getElementById('inchargeForm');
    if (inchargeForm) inchargeForm.onsubmit = handleInchargeSubmit;

    const commitBtn = document.getElementById('btnCommitImport');
    if (commitBtn) commitBtn.onclick = commitStagedImport;

    // Template Modal Buttons
    const btnTmplCsv = document.getElementById('btnDownloadTmplCsv');
    if (btnTmplCsv) btnTmplCsv.onclick = downloadTemplateCsv;

    const btnTmplXlsx = document.getElementById('btnDownloadTmplXlsx');
    if (btnTmplXlsx) btnTmplXlsx.onclick = downloadTemplateXlsx;

    const sidebarTmplBtn = document.getElementById('sidebarTemplateBtn');
    if (sidebarTmplBtn) {
      sidebarTmplBtn.onclick = () => {
        const modal = document.getElementById('templateModalBackdrop');
        if (modal) modal.classList.add('open');
      };
    }

    // Mobile Navigation Drawer Toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
      menuToggle.onclick = () => sidebar.classList.toggle('open');
    }

    // Read initial hash route and listen for URL changes
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'requests', 'attendance', 'reports', 'rules', 'audit'].includes(hash)) {
      state.activePage = hash;
    }

    window.addEventListener('hashchange', () => {
      const page = location.hash.replace('#', '') || 'dashboard';
      if (['dashboard', 'requests', 'attendance', 'reports', 'rules', 'audit'].includes(page) && state.activePage !== page) {
        state.activePage = page;
        if (state.isLoggedIn) renderCurrentPage();
      }
    });

    // Auth & Multi-Role Login setup
    initAuthAndLogin();
    updateAuthState();
  }

  // Self-start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
