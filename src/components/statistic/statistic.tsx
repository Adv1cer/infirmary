import React, { useEffect, useState } from 'react';
import TotalPatientCard from './components/total_patient';

interface StatisticData {
  totalPatients: number;
  totalPrescriptions: number;
  totalMedicines: number;
  activeTickets: number;
  monthlyPatients: number[];
  prescriptionsByMonth: number[];
  medicineStock: { name: string; count: number; color: string }[];
  patientTypes: { name: string; percentage: number; color: string }[];
}

// Mock data - replace with actual API calls
const mockData: StatisticData = {
  totalPatients: 2123,
  totalPrescriptions: 3143,
  totalMedicines: 1423,
  activeTickets: 89,
  monthlyPatients: [45, 52, 48, 61, 55, 67, 59, 72, 65, 58, 61, 69],
  prescriptionsByMonth: [120, 135, 142, 158, 163, 171, 169, 185, 178, 172, 180, 195],
  medicineStock: [
    { name: 'Paracetamol', count: 450, color: '#3b82f6' },
    { name: 'Amoxicillin', count: 320, color: '#ef4444' },
    { name: 'Ibuprofen', count: 280, color: '#f59e0b' },
    { name: 'Others', count: 150, color: '#6b7280' }
  ],
  patientTypes: [
    { name: 'General', percentage: 45, color: '#3b82f6' },
    { name: 'Emergency', percentage: 25, color: '#ef4444' },
    { name: 'Chronic', percentage: 20, color: '#f59e0b' },
    { name: 'Pediatric', percentage: 10, color: '#10b981' }
  ]
};

// Metric Card Component
function MetricCard({ title, value, color, trend }: { 
  title: string; 
  value: string; 
  color: string; 
  trend: number[] 
}) {
  const maxValue = Math.max(...trend);
  const minValue = Math.min(...trend);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="mb-4">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
      <div className="h-12 flex items-end space-x-1">
        {trend.map((point, index) => {
          const height = ((point - minValue) / (maxValue - minValue)) * 100;
          return (
            <div
              key={index}
              className={`flex-1 ${color.replace('text-', 'bg-')} rounded-sm opacity-70`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Line Chart Component
function LineChart({ data, title }: { data: number[]; title: string }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / (maxValue - minValue)) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-48 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - minValue) / (maxValue - minValue)) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Bar Chart Component
function BarChart({ data, title }: { data: { name: string; count: number; color: string }[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-48 flex items-end space-x-2">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: item.color 
                }}
              />
              <div className="mt-2 text-xs text-gray-600 text-center">
                {item.name}
              </div>
              <div className="text-xs font-medium text-gray-800">
                {item.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Circular Progress Component
function CircularProgress({ percentage, title }: { percentage: number; title: string }) {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#ef4444"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <button className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600">
          LIVE UPDATE
        </button>
      </div>
    </div>
  );
}

// Info List Component
function InfoList() {
  const infoItems = [
    { label: 'Total Patients Today', value: '45', color: '#3b82f6' },
    { label: 'Pending Prescriptions', value: '12', color: '#f59e0b' },
    { label: 'Available Medicines', value: '156', color: '#10b981' },
    { label: 'Emergency Cases', value: '3', color: '#ef4444' },
    { label: 'Completed Visits', value: '38', color: '#8b5cf6' },
    { label: 'Medicine Alerts', value: '7', color: '#f97316' },
    { label: 'Staff on Duty', value: '15', color: '#06b6d4' },
    { label: 'Waiting Patients', value: '8', color: '#84cc16' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Stats</h3>
      <div className="space-y-3">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="font-medium text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatisticPage() {
  const [data, setData] = useState<StatisticData>(mockData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch actual data here
    // setLoading(true);
    // fetchStatisticsData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-blue-600">Loading statistics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Statistics</h1>
          <p className="text-gray-600">Overview of infirmary operations and analytics</p>
        </div>        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TotalPatientCard />
          <MetricCard 
            title="Prescriptions" 
            value={data.totalPrescriptions.toLocaleString()}
            color="text-blue-500"
            trend={data.prescriptionsByMonth}
          />
          <MetricCard 
            title="Medicines" 
            value={data.totalMedicines.toLocaleString()}
            color="text-yellow-500"
            trend={[...data.monthlyPatients].reverse()}
          />
          <MetricCard 
            title="Active Tickets" 
            value={data.activeTickets.toString()}
            color="text-purple-500"
            trend={data.monthlyPatients.slice(0, 8)}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LineChart 
            data={data.monthlyPatients} 
            title="Monthly Patient Visits"
          />
          <BarChart 
            data={data.medicineStock} 
            title="Medicine Stock Levels"
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CircularProgress 
            percentage={50} 
            title="Bed Occupancy"
          />
          <div className="lg:col-span-2">
            <InfoList />
          </div>
        </div>
      </div>
    </div>
  );
}
