import { Truck, Plus, Edit, Trash2 } from 'lucide-react';

const FleetManagement = () => {
  const trucks = [
    { id: 1, plate: 'TRK-123', driver: 'Ahmed Benali', status: 'Active', lastUsed: '2024-02-06' },
    { id: 2, plate: 'TRK-456', driver: 'Karim Mohand', status: 'Active', lastUsed: '2024-02-05' },
    { id: 3, plate: 'TRK-789', driver: 'Yacine Saidi', status: 'Inactive', lastUsed: '2024-02-01' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-ocean">Fleet Management</h1>
          <p className="text-gray-500 mt-1">Manage your trucks and drivers</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Truck
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="table-header">Plate Number</th>
              <th className="table-header">Driver</th>
              <th className="table-header">Status</th>
              <th className="table-header">Last Used</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((truck) => (
              <tr key={truck.id} className="hover:bg-gray-50">
                <td className="table-cell font-semibold">{truck.plate}</td>
                <td className="table-cell">{truck.driver}</td>
                <td className="table-cell">
                  <span className={`status-badge ${truck.status === 'Active' ? 'bg-green-100 text-status-success' : 'bg-gray-100 text-gray-600'}`}>
                    {truck.status}
                  </span>
                </td>
                <td className="table-cell">{truck.lastUsed}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded"><Edit size={16} /></button>
                    <button className="p-2 hover:bg-red-50 rounded"><Trash2 size={16} className="text-status-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Integration Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="font-semibold text-deep-ocean mb-3 flex items-center gap-2">
          <Truck size={18} />
          API Integration - Fleet Management
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/user/fleet</code>
            <span className="text-gray-500">- List fleet (Admin/Carrier)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-orange-100 text-status-warning px-2 py-0.5 rounded text-xs font-semibold">POST</span>
            <code className="text-gray-700">/api/user/fleet</code>
            <span className="text-gray-500">- Add truck (Carrier)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/user/fleet/:id</code>
            <span className="text-gray-500">- Update truck (Carrier)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-red-100 text-status-error px-2 py-0.5 rounded text-xs font-semibold">DELETE</span>
            <code className="text-gray-700">/api/user/fleet/:id</code>
            <span className="text-gray-500">- Delete truck (Carrier)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagement;
