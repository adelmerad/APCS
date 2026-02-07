import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  // KPI Data
  const kpis = [
    {
      label: 'Total Bookings Today',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'text-apcs-blue',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Available Slots',
      value: '156',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'text-status-warning',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Terminal Saturation',
      value: '73%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-status-success',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Trucks in Port',
      value: '42',
      change: '+3',
      trend: 'up',
      icon: Truck,
      color: 'text-digital-cyan',
      bgColor: 'bg-cyan-50',
    },
  ];

  // Hourly Slot Usage Data
  const hourlyData = [
    { hour: '8h', bookings: 12 },
    { hour: '9h', bookings: 18 },
    { hour: '10h', bookings: 25 },
    { hour: '11h', bookings: 32 },
    { hour: '12h', bookings: 28 },
    { hour: '13h', bookings: 22 },
    { hour: '14h', bookings: 35 },
    { hour: '15h', bookings: 30 },
    { hour: '16h', bookings: 26 },
    { hour: '17h', bookings: 15 },
  ];

  // Terminal Capacity Data
  const terminalData = [
    { name: 'Terminal A', capacity: 85 },
    { name: 'Terminal B', capacity: 72 },
    { name: 'Terminal C', capacity: 65 },
    { name: 'Terminal D', capacity: 90 },
  ];

  // Booking Status Distribution
  const statusData = [
    { name: 'Confirmed', value: 156, color: '#16A34A' },
    { name: 'Pending', value: 42, color: '#F59E0B' },
    { name: 'Consumed', value: 28, color: '#2563EB' },
    { name: 'Rejected', value: 8, color: '#DC2626' },
  ];

  // Recent Alerts
  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Terminal D approaching capacity (90%)',
      time: '5 min ago',
    },
    {
      id: 2,
      type: 'info',
      message: 'Booking #B-2024-125 confirmed',
      time: '12 min ago',
    },
    {
      id: 3,
      type: 'error',
      message: 'Truck TRK-456 delayed by 30 minutes',
      time: '18 min ago',
    },
    {
      id: 4,
      type: 'success',
      message: 'New carrier registered: LogiTrans DZ',
      time: '25 min ago',
    },
  ];

  const getAlertColor = (type) => {
    const colors = {
      success: 'border-l-status-success bg-green-50',
      warning: 'border-l-status-warning bg-orange-50',
      error: 'border-l-status-error bg-red-50',
      info: 'border-l-status-info bg-blue-50',
    };
    return colors[type] || colors.info;
  };

  const getAlertIcon = (type) => {
    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertTriangle,
      info: Activity,
    };
    return icons[type] || Activity;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-deep-ocean">Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time operational overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                  <p className="text-3xl font-bold text-deep-ocean">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon
                      size={16}
                      className={kpi.trend === 'up' ? 'text-status-success' : 'text-status-error'}
                    />
                    <span
                      className={`text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-status-success' : 'text-status-error'
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">vs yesterday</span>
                  </div>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={kpi.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Slot Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-deep-ocean mb-4">Hourly Slot Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#1E5AA8"
                strokeWidth={3}
                dot={{ fill: '#00B4D8', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Terminal Capacity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-deep-ocean mb-4">
            Terminal Capacity Utilization
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={terminalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="capacity" fill="#1E5AA8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-deep-ocean mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Live Alerts */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-deep-ocean mb-4">Live Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={20} className="mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* API Integration Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="font-semibold text-deep-ocean mb-3 flex items-center gap-2">
          <Activity size={18} />
          API Integration - Dashboard
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded">GET</span>
            <code className="text-gray-700">/api/admin/schedule</code>
            <span className="text-gray-500">- Load schedule data</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded">GET</span>
            <code className="text-gray-700">/api/admin/data/capacity/:date</code>
            <span className="text-gray-500">- Terminal capacity</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded">GET</span>
            <code className="text-gray-700">/api/admin/data/containers/:date</code>
            <span className="text-gray-500">- Container analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded">GET</span>
            <code className="text-gray-700">/api/admin/data/logs/:date</code>
            <span className="text-gray-500">- System logs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
