import { Users as UsersIcon, Plus, Shield } from 'lucide-react';

const Users = () => {
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@apcs.dz', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Operator User', email: 'operator@apcs.dz', role: 'Operator', status: 'Active' },
    { id: 3, name: 'Carrier User', email: 'carrier@apcs.dz', role: 'Carrier', status: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-ocean">Users & Roles</h1>
          <p className="text-gray-500 mt-1">Manage user access and permissions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Role</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="table-cell font-semibold">{user.name}</td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">
                  <span className="flex items-center gap-2">
                    <Shield size={16} />
                    {user.role}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${user.status === 'Active' ? 'bg-green-100 text-status-success' : 'bg-gray-100 text-gray-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="table-cell">
                  <button className="btn-secondary py-1 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Integration Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="font-semibold text-deep-ocean mb-3 flex items-center gap-2">
          <Shield size={18} />
          API Integration - Users & Roles
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/admin/users</code>
            <span className="text-gray-500">- List users (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-orange-100 text-status-warning px-2 py-0.5 rounded text-xs font-semibold">POST</span>
            <code className="text-gray-700">/api/admin/users</code>
            <span className="text-gray-500">- Create user (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/admin/users/:id</code>
            <span className="text-gray-500">- Update user (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/admin/users/:id/role</code>
            <span className="text-gray-500">- Assign role (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/admin/users/:id/status</code>
            <span className="text-gray-500">- Enable/disable (Admin)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-red-100 text-status-error px-2 py-0.5 rounded text-xs font-semibold">DELETE</span>
            <code className="text-gray-700">/api/admin/users/:id</code>
            <span className="text-gray-500">- Delete user (Admin)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
