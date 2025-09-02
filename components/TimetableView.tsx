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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const downloadPDF = async () => {
    if (!selectedProgram || !selectedYear || filteredEntries.length === 0) return;

    setIsDownloading(true);

    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setIsDownloading(false);
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Timetable - ${selectedProgram} ${selectedYear}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4f46e5; margin-bottom: 20px; }
            h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 25px; }
            .header { margin-bottom: 30px; }
            .course { margin: 10px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; background: #f9fafb; }
            .course-name { font-weight: bold; font-size: 16px; }
            .course-details { color: #6b7280; font-size: 14px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Class Timetable</h1>
            <p><strong>Program:</strong> ${selectedProgram}</p>
            <p><strong>Year of Study:</strong> ${selectedYear}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${orderedDays.map(day => {
            const dayEntries = groupedByDay[day];
            if (!dayEntries || dayEntries.length === 0) return '';
            
            return `
              <h2>${day}</h2>
              ${dayEntries.map(entry => `
                <div class="course">
                  <div class="course-name">${entry.course_name} (${entry.course_code})</div>
                  <div class="course-details">Time: ${entry.time} | Venue: ${entry.venue}</div>
                </div>
              `).join('')}
            `;
          }).join('')}
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Set a timeout to close loading state
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };
  
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">View Timetable</h2>
          
          {selectedProgram && selectedYear && filteredEntries.length > 0 && (
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          )}
        </div>
        
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
