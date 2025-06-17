import React, { useEffect, useState } from 'react';
import { TotalPatientData, PatientStatisticsUtil, PatientRecord, FilterPeriod } from '@/components/statistic/utils/patientStatistics';

export default function TotalPatientCard() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [data, setData] = useState<TotalPatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/statistic/total_patient');
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        
        const result = await response.json();
        setRecords(result.records);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // Update data when records or filter period changes
  useEffect(() => {
    if (records.length > 0) {
      const filteredData = PatientStatisticsUtil.getStatisticsForPeriod(records, filterPeriod);
      setData(filteredData);
    }
  }, [records, filterPeriod]);

  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-red-600">
          <h3 className="text-sm font-medium mb-2">Error Loading Patient Data</h3>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-gray-500">
          <h3 className="text-sm font-medium">No Data Available</h3>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.monthlyPatients);
  const minValue = Math.min(...data.monthlyPatients);

  return (    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Total Patients
        </h3>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      
      {/* Patient Count */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-red-500">
          {data.totalPatients.toLocaleString()}
        </div>
      </div>
      
      {/* Mini Trend Chart */}
      <div className="h-12 flex items-end space-x-1">
        {data.monthlyPatients.map((point, index) => {
          const height = ((point - minValue) / (maxValue - minValue)) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-red-500 rounded-sm opacity-70 transition-all duration-300 hover:opacity-100"
              style={{ height: `${Math.max(height, 10)}%` }}
              title={`Month ${index + 1}: ${point} patients`}
            />
          );
        })}
      </div>
        {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {filterPeriod === 'today' ? 'Today' : 
             filterPeriod === 'month' ? 'This Month' :
             filterPeriod === 'year' ? 'This Year' : 'All Time'}
          </span>
          <span className="text-green-600 font-medium">
            {data.monthlyPatients.length > 1 && data.monthlyPatients[0] > 0 ? (
              `+${((data.monthlyPatients[data.monthlyPatients.length - 1] - data.monthlyPatients[0]) / data.monthlyPatients[0] * 100).toFixed(1)}%`
            ) : (
              'N/A'
            )}
          </span>
        </div>
        {filterPeriod !== 'all' && (
          <div className="mt-2 text-xs text-gray-400">
            Trend chart shows last 12 months
          </div>
        )}
      </div>
    </div>
  );
}
