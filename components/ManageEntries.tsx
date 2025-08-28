import React, { useState, useMemo } from 'react';
import { type TimetableEntry, YearOfStudy, DayOfWeek } from '../types';
import Card from './shared/Card';
import Select from './shared/Select';
import Button from './shared/Button';

interface ManageEntriesProps {
  entries: TimetableEntry[];
  loading: boolean;
  error: string | null;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

const ManageEntries: React.FC<ManageEntriesProps> = ({ entries, loading, error, onEdit, onDelete }) => {
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

  const renderContent = () => {
    if (loading) return <div className="text-center py-12"><p className="text-slate-500 dark:text-slate-400">Loading entries...</p></div>;
    if (error) return <div className="text-center py-12"><p className="text-red-500 dark:text-red-400">{error}</p></div>;
    if (!selectedProgram || !selectedYear) return <div className="text-center py-12"><p className="text-slate-500 dark:text-slate-400">Please select a program and year to manage entries.</p></div>;
    if (filteredEntries.length === 0) return <div className="text-center py-12"><p className="text-slate-500 dark:text-slate-400">No entries found for the selected criteria.</p></div>;
    
    return (
      <ul className="space-y-3">
        {filteredEntries.map(entry => (
          <li key={entry.id} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-slate-100">{entry.course_name} ({entry.course_code})</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{entry.day} at {entry.time}, Venue: {entry.venue}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="secondary" onClick={() => onEdit(entry)}>Edit</Button>
              <Button variant="danger" onClick={() => onDelete(entry.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Manage Timetable Entries</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Select id="filterProgram" label="Filter by Program" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} disabled={loading || !!error}>
            <option value="">Select a Program</option>
            {uniquePrograms.map(program => <option key={program} value={program}>{program}</option>)}
          </Select>
          <Select id="filterYear" label="Filter by Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={loading || !!error}>
            <option value="">Select a Year</option>
            {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
          </Select>
        </div>
        <div>{renderContent()}</div>
      </div>
    </Card>
  );
};

export default ManageEntries;