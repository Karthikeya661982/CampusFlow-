import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, User, PlusCircle, CheckCircle, XCircle, 
  Clock, AlertCircle, Settings, FileUp, BarChart2, LogOut, 
  ChevronRight, Calendar, MapPin, Building, Link as LinkIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// --- Mock Data ---
const MOCK_USERS = {
  STUDENT: {
    id: '25EU02094',
    name: 'Madupu Karthikeya',
    role: 'STUDENT',
    major: 'B.Tech CSE - AIML',
    semester: 'IV',
    attendance: 87.5,
    lastUpdated: '2026-10-10'
  },
  PROCTOR: {
    id: 'P1001',
    name: 'Dr. Alan Smith',
    role: 'PROCTOR',
    department: 'CSE'
  },
  INCHARGE: {
    id: 'I2001',
    name: 'Prof. Sarah Johnson',
    role: 'INCHARGE',
    department: 'Engineering'
  }
};

const INITIAL_REQUESTS = [
  {
    id: 'REQ-001',
    studentId: '25EU02094',
    studentName: 'Madupu Karthikeya',
    eventName: 'AI Summit 2026',
    organizer: 'TechCorp',
    venue: 'Hyderabad',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    category: 'Conference',
    url: 'https://aisummit.example.com',
    status: 'PENDING_PROCTOR', // PENDING_PROCTOR, PENDING_INCHARGE, APPROVED, REJECTED, RETURNED
    history: [
      { date: '2026-10-11', action: 'Submitted', by: 'Madupu Karthikeya', remarks: 'Initial submission' }
    ]
  },
  {
    id: 'REQ-002',
    studentId: '25EU02094',
    studentName: 'Madupu Karthikeya',
    eventName: 'Hackathon X',
    organizer: 'DevClub',
    venue: 'Bangalore',
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    category: 'Hackathon',
    url: '',
    status: 'APPROVED',
    history: [
      { date: '2026-09-20', action: 'Submitted', by: 'Madupu Karthikeya', remarks: '' },
      { date: '2026-09-22', action: 'Recommended', by: 'Dr. Alan Smith', remarks: 'Good attendance, recommended.' },
      { date: '2026-09-25', action: 'Approved', by: 'Prof. Sarah Johnson', remarks: 'Approved for participation.' }
    ]
  }
];

const EVENT_CATEGORIES = ['Conference', 'Hackathon', 'Workshop', 'Paper Presentation', 'Other'];

const STATUS_COLORS = {
  PENDING_PROCTOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDING_INCHARGE: 'bg-blue-100 text-blue-800 border-blue-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200'
};

const STATUS_LABELS = {
  PENDING_PROCTOR: 'Pending Proctor Review',
  PENDING_INCHARGE: 'Pending In-Charge Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned for Clarification'
};

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const StudentDashboard = ({ user, requests }) => {
  const activeRequests = requests.filter(r => r.studentId === user.id);
  const approvedCount = activeRequests.filter(r => r.status === 'APPROVED').length;
  const pendingCount = activeRequests.filter(r => r.status.includes('PENDING')).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Welcome, {user.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Academic Profile</h3>
          <p className="text-lg font-semibold text-slate-800">{user.major}</p>
          <p className="text-sm text-slate-500">ID: {user.id} | Sem: {user.semester}</p>
        </Card>
        <Card className="p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Current Attendance</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${user.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {user.attendance}%
            </span>
            <span className="text-xs text-slate-400">Last updated: {user.lastUpdated}</span>
          </div>
        </Card>
        <Card className="p-6 flex justify-around items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Pending</div>
          </div>
          <div className="w-px h-12 bg-slate-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Approved</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Recent Requests</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {activeRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No requests found. Create one to get started.</div>
          ) : (
            activeRequests.map(req => (
              <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                      {req.eventName}
                      <StatusBadge status={req.status} />
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Building size={14}/> {req.organizer}</span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> {req.startDate} to {req.endDate}</span>
                      <span className="flex items-center gap-1"><MapPin size={14}/> {req.venue}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="!py-1.5 !px-3 !text-xs">View Details</Button>
                    {(req.status === 'PENDING_PROCTOR' || req.status === 'RETURNED') && (
                      <Button variant="danger" className="!py-1.5 !px-3 !text-xs">Withdraw</Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const StudentNewRequest = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    eventName: '', organizer: '', venue: '', startDate: '', endDate: '', category: 'Conference', url: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: `REQ-${Math.floor(Math.random() * 1000)}`,
      studentId: user.id,
      studentName: user.name,
      status: 'PENDING_PROCTOR',
      history: [{ date: new Date().toISOString().split('T')[0], action: 'Submitted', by: user.name, remarks: 'Initial submission' }]
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800">New Event Participation Request</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Name *</label>
            <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Category</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organizer/Host *</label>
            <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue (City/Online) *</label>
            <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
            <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
            <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Event URL (Optional)</label>
            <input type="url" placeholder="https://" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Invitation/Brochure (Mock Upload)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <FileUp className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 justify-center">
                  <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input type="file" className="sr-only" />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PDF, PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">Submit Request</Button>
        </div>
      </form>
    </Card>
  );
};

const RequestReviewList = ({ requests, filterStatus, title, onAction, user }) => {
  const filtered = requests.filter(r => r.status === filterStatus);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarks, setRemarks] = useState('');

  const handleAction = (status, actionName) => {
    onAction(selectedReq.id, status, actionName, remarks);
    setSelectedReq(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">{title} ({filtered.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No pending requests to review.</div>
          ) : (
            filtered.map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50">
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-800">{req.studentName}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{req.studentId}</span>
                  </div>
                  <h4 className="text-md font-medium text-slate-700">{req.eventName}</h4>
                  <div className="text-sm text-slate-500 mt-1">
                    {req.startDate} to {req.endDate} | {req.category}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setSelectedReq(req)}>Review</Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-slate-800">Review Request: {selectedReq.id}</h3>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Student Snapshot */}
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                <div>
                  <div className="font-semibold text-blue-900">{selectedReq.studentName} ({selectedReq.studentId})</div>
                  <div className="text-sm text-blue-700">Attendance: <span className="font-bold text-green-700">87.5%</span> (Eligible)</div>
                </div>
                <StatusBadge status={selectedReq.status} />
              </div>

              {/* Event Details */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Event Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 block">Name:</span> <span className="font-medium text-slate-800">{selectedReq.eventName}</span></div>
                  <div><span className="text-slate-500 block">Organizer:</span> <span className="font-medium text-slate-800">{selectedReq.organizer}</span></div>
                  <div><span className="text-slate-500 block">Dates:</span> <span className="font-medium text-slate-800">{selectedReq.startDate} to {selectedReq.endDate}</span></div>
                  <div><span className="text-slate-500 block">Venue:</span> <span className="font-medium text-slate-800">{selectedReq.venue}</span></div>
                </div>
              </div>

              {/* Action Area */}
              <div className="border-t border-slate-200 pt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Remarks / Feedback (Required for Rejection/Return)</label>
                <textarea 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4 min-h-[100px]"
                  placeholder="Enter your remarks here..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
                <div className="flex flex-wrap gap-3 justify-end">
                  {user.role === 'PROCTOR' ? (
                    <>
                      <Button variant="secondary" onClick={() => handleAction('RETURNED', 'Returned for Clarification')}>Return to Student</Button>
                      <Button variant="danger" onClick={() => handleAction('REJECTED', 'Rejected')}>Reject</Button>
                      <Button variant="success" onClick={() => handleAction('PENDING_INCHARGE', 'Recommended')}>Recommend Approval</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => handleAction('RETURNED', 'Returned for Clarification')}>Return to Student</Button>
                      <Button variant="danger" onClick={() => handleAction('REJECTED', 'Rejected')}>Reject Request</Button>
                      <Button variant="success" onClick={() => handleAction('APPROVED', 'Approved')}>Approve Request</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const InChargeDashboard = ({ requests }) => {
  const total = requests.length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const pending = requests.filter(r => r.status === 'PENDING_INCHARGE').length;
  const rejected = requests.filter(r => r.status === 'REJECTED').length;

  const data = [
    { name: 'Approved', value: approved, color: '#16a34a' },
    { name: 'Pending', value: pending, color: '#3b82f6' },
    { name: 'Rejected', value: rejected, color: '#ef4444' }
  ];

  const catData = EVENT_CATEGORIES.map(cat => ({
    name: cat,
    count: requests.filter(r => r.category === cat).length
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Event Approval Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="text-sm text-slate-500 font-medium">Total Requests</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{total}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-blue-400">
          <div className="text-sm text-slate-500 font-medium">Action Required</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{pending}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="text-sm text-slate-500 font-medium">Approved</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{approved}</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="text-sm text-slate-500 font-medium">Rejected</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{rejected}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Requests by Category</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><CheckCircle size={20}/></div>
                <div className="text-left">
                  <div className="font-medium text-slate-800">Review Pending Requests</div>
                  <div className="text-sm text-slate-500">{pending} requests waiting for approval</div>
                </div>
              </div>
              <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><FileUp size={20}/></div>
                <div className="text-left">
                  <div className="font-medium text-slate-800">Import Attendance Data</div>
                  <div className="text-sm text-slate-500">Update from CSV/XLSX</div>
                </div>
              </div>
              <ChevronRight className="text-slate-400 group-hover:text-blue-500" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.STUDENT);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRoleSwitch = (roleKey) => {
    setCurrentUser(MOCK_USERS[roleKey]);
    setActiveTab('dashboard');
  };

  const handleAddRequest = (newRequest) => {
    setRequests([newRequest, ...requests]);
    setActiveTab('dashboard');
  };

  const handleReviewAction = (reqId, newStatus, actionName, remarks) => {
    setRequests(requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: newStatus,
          history: [...req.history, {
            date: new Date().toISOString().split('T')[0],
            action: actionName,
            by: currentUser.name,
            remarks: remarks || 'No remarks provided.'
          }]
        };
      }
      return req;
    }));
  };

  // Sidebar config based on role
  const getNavItems = () => {
    switch(currentUser.role) {
      case 'STUDENT': return [
        { id: 'dashboard', label: 'My Dashboard', icon: <Home size={20}/> },
        { id: 'new', label: 'New Request', icon: <PlusCircle size={20}/> }
      ];
      case 'PROCTOR': return [
        { id: 'dashboard', label: 'Dashboard', icon: <Home size={20}/> },
        { id: 'review', label: 'Review Queue', icon: <FileText size={20}/> }
      ];
      case 'INCHARGE': return [
        { id: 'dashboard', label: 'Overview', icon: <BarChart2 size={20}/> },
        { id: 'review', label: 'Final Approvals', icon: <CheckCircle size={20}/> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={20}/> }
      ];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><Building size={24} className="text-white"/></div>
          <span className="text-xl font-bold tracking-wide">CampusFlow</span>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          {getNavItems().map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-800">
          <div className="text-xs text-slate-500 uppercase font-semibold mb-3 tracking-wider">Test Environment</div>
          <div className="flex flex-col gap-2">
            {Object.keys(MOCK_USERS).map(role => (
              <button key={role} onClick={() => handleRoleSwitch(role)}
                className={`text-sm py-2 px-3 rounded text-left transition-colors ${
                  currentUser.role === role ? 'bg-slate-800 text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'
                }`}>
                Switch to {role.charAt(0) + role.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.role} {currentUser.department ? `- ${currentUser.department}` : ''}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* View Router */}
            {currentUser.role === 'STUDENT' && activeTab === 'dashboard' && <StudentDashboard user={currentUser} requests={requests} />}
            {currentUser.role === 'STUDENT' && activeTab === 'new' && <StudentNewRequest user={currentUser} onSubmit={handleAddRequest} onCancel={() => setActiveTab('dashboard')} />}
            
            {currentUser.role === 'PROCTOR' && activeTab === 'dashboard' && (
              <div className="text-center py-20 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <h2 className="text-xl font-medium text-slate-700">Proctor Dashboard</h2>
                <p className="mt-2">Navigate to the Review Queue to process pending student requests.</p>
              </div>
            )}
            {currentUser.role === 'PROCTOR' && activeTab === 'review' && (
              <RequestReviewList requests={requests} filterStatus="PENDING_PROCTOR" title="Pending Initial Review" onAction={handleReviewAction} user={currentUser} />
            )}

            {currentUser.role === 'INCHARGE' && activeTab === 'dashboard' && <InChargeDashboard requests={requests} />}
            {currentUser.role === 'INCHARGE' && activeTab === 'review' && (
               <RequestReviewList requests={requests} filterStatus="PENDING_INCHARGE" title="Pending Final Approval" onAction={handleReviewAction} user={currentUser} />
            )}
            {currentUser.role === 'INCHARGE' && activeTab === 'settings' && (
               <Card className="p-8 text-center max-w-lg mx-auto mt-10">
                 <Settings size={48} className="mx-auto mb-4 text-slate-300" />
                 <h2 className="text-xl font-semibold mb-2">System Settings & Data Import</h2>
                 <p className="text-slate-500 mb-6">Import the latest attendance records or adjust eligibility rules here.</p>
                 <Button className="w-full justify-center">Simulate Import</Button>
               </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}