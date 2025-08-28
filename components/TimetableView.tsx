import React, { useState, useMemo } from 'react';
import { type TimetableEntry, YearOfStudy, DayOfWeek } from '../types';
import Card from './shared/Card';
import Select from './shared/Select';

interface TimetableViewProps {
  entries: TimetableEntry[];
  loading: boolean;
  error: string | null;
}

const TimetableView: React.FC<TimetableViewProps> = ({ entries, loading, error }) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const { uniquePrograms, uniqueYears } = useMemo(() => {
    const programs = new Set(entries.map(e => e.program_of_study));
    const years = new Set(entries.map(e => e.year_of_study));
    return {
      uniquePrograms: Array.from(programs).sort(),
      uniqueYears: Array.from(years).sort((a,b) => Object.values(YearOfStudy).indexOf(a) - Object.values(YearOfStudy).indexOf(b))
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!selectedProgram || !selectedYear) return [];
    return entries.filter(
      (entry) => entry.program_of_study === selectedProgram && entry.year_of_study === selectedYear
    );
  }, [entries, selectedProgram, selectedYear]);

  const groupedByDay = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      (acc[entry.day] = acc[entry.day] || []).push(entry);
      // Sort entries by time
      acc[entry.day].sort((a, b) => a.time.localeCompare(b.time));
      return acc;
    }, {} as Record<DayOfWeek, TimetableEntry[]>);
  }, [filteredEntries]);

  const orderedDays = Object.values(DayOfWeek);
  
  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-12"><p className="text-slate-500 dark:text-slate-400">Loading timetable...</p></div>;
    }
    
    if (error) {
       return <div className="text-center py-12"><p className="text-red-500 dark:text-red-400">{error}</p></div>;
    }
    
    if (!selectedProgram || !selectedYear) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Please select a program and year to view the timetable.</p>
        </div>
      );
    }
    
    if (filteredEntries.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No timetable entries found for the selected criteria.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {orderedDays.map(day => (
          groupedByDay[day] && groupedByDay[day].length > 0 && (
            <div key={day}>
              <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2 mb-4">{day}</h3>
              <div className="space-y-4">
                {groupedByDay[day].map(entry => (
                  <div key={entry.id} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{entry.course_name} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({entry.course_code})</span></p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Venue: {entry.venue}</p>
                    </div>
                    <div className="font-mono text-sm sm:text-base bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full">
                      {entry.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">View Timetable</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Select
            id="filterProgram"
            label="Filter by Program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            disabled={loading || !!error}
          >
            <option value="">Select a Program</option>
            {uniquePrograms.map(program => <option key={program} value={program}>{program}</option>)}
          </Select>
          <Select
            id="filterYear"
            label="Filter by Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={loading || !!error}
          >
            <option value="">Select a Year</option>
            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
          </Select>
        </div>

        <div>
          {renderContent()}
        </div>
      </div>
    </Card>
  );
};

export default TimetableView;