import { FileText, Download, Filter } from 'lucide-react';

const Logs = () => {
  const logs = [
    { id: 1, action: 'Booking Created', user: 'Admin', details: 'B-2024-001', timestamp: '2024-02-06 14:30' },
    { id: 2, action: 'Slot Modified', user: 'Operator', details: 'Terminal A capacity increased', timestamp: '2024-02-06 14:25' },
    { id: 3, action: 'Booking Validated', user: 'Operator', details: 'B-2024-002', timestamp: '2024-02-06 14:20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-ocean">Traceability & Logs</h1>
          <p className="text-gray-500 mt-1">Audit trail and activity logs</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          Export Logs
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="date" className="input-field" />
          <select className="input-field">
            <option>All Actions</option>
            <option>Booking Created</option>
            <option>Slot Modified</option>
          </select>
          <select className="input-field">
            <option>All Users</option>
            <option>Admin</option>
            <option>Operator</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="table-header">Timestamp</th>
              <th className="table-header">Action</th>
              <th className="table-header">User</th>
              <th className="table-header">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="table-cell font-mono text-sm">{log.timestamp}</td>
                <td className="table-cell font-semibold">{log.action}</td>
                <td className="table-cell">{log.user}</td>
                <td className="table-cell">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Integration Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="font-semibold text-deep-ocean mb-3 flex items-center gap-2">
          <FileText size={18} />
          API Integration - Logs & Traceability
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/admin/data/logs</code>
            <span className="text-gray-500">- View all logs (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/admin/data/logs/:date</code>
            <span className="text-gray-500">- View logs by date (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/admin/data/logs/:start-date/:end-date</code>
            <span className="text-gray-500">- View date range (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/report/:date</code>
            <span className="text-gray-500">- Get reports (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-orange-100 text-status-warning px-2 py-0.5 rounded text-xs font-semibold">POST</span>
            <code className="text-gray-700">/api/report/solve</code>
            <span className="text-gray-500">- Solve incident (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/report/pending</code>
            <span className="text-gray-500">- Get pending reports (Admin)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
