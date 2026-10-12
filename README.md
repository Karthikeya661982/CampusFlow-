# CampusFlow — Siddhartha Academy of Higher Education

**Technical Event Participation Approval & Attendance Monitoring Portal**

CampusFlow is a full-featured, responsive web application designed for engineering institutions to manage student participation in external technical competitions, hackathons, conferences, and workshops with verifiable attendance integrity, proctorial mentoring, and authorized level-3 governance.

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Start the local server
node server.js
```

Then open your browser to **`http://localhost:3000`**.

---

## 👥 Multi-Role Portals & Demo Credentials

CampusFlow includes a dedicated multi-tab login system:

| Role | Demo ID / Roll | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `25EU02094` or `1RV22CS142` | `student123` | View verified attendance, submit participation applications, edit returned drafts, withdraw requests. |
| **👨‍🏫 Faculty Proctor** | `P1001` (Dr. Alan Smith) | `proctor123` | Review assigned mentees, verify attendance freshness, evaluate overlap flags, recommend approval/rejection or return for correction. |
| **🏛 Event In-Charge** | `A2001` (Arjun Sharma) | `admin123` | Master governance, configure institutional threshold (75%), import .xlsx/.csv attendance datasets, authorize exception overrides, make final decisions. |

---

## 🌟 Key Features

1. **Strict 75% Attendance Enforcement & Calculation**:
   - Attendance percentage is strictly computed as `Classes Attended / Classes Conducted × 100`.
   - Missing or unconducted classes display as *"Unavailable"* rather than 0%.
   - Ineligible students (< 75%) are prevented from standard approval unless explicitly granted an **Authorized Exception Override**.

2. **Non-Destructive Dataset Ingestion**:
   - Accepts `.xlsx` and `.csv` files.
   - Live validation preview table validates required columns, duplicate rows, missing entries, and attended > conducted errors.
   - Cancelled or invalid imports leave the existing dataset untouched.

3. **Traceable Multi-Role Approval Workflow**:
   - Full status cycle: `Submitted` $\rightarrow$ `Under Proctor Review` $\rightarrow$ `Recommended for Approval` / `Returned for Correction` $\rightarrow$ `Approved` / `Rejected` / `Withdrawn`.
   - Complete audit trail of actors, timestamps, statuses, and mandatory decision remarks.

4. **Institutional Reports & Exports**:
   - Downloadable `.csv` and multi-sheet `.xlsx` reports (`AttendanceRegistry`, `EventApprovals`, `AuditTrail`, `DatasetVersions`).
