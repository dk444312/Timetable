import React, { useState, useMemo, useRef } from 'react';
import { Download } from 'lucide-react';
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
  const timetableRef = useRef<HTMLDivElement>(null);

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
    if (!selectedProgram || !selectedYear || filteredEntries.length === 0) {
      alert('Please select a program and year with available timetable entries before downloading.');
      return;
    }

    setIsDownloading(true);

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow popups and try again.');
      }

      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timetable - ${selectedProgram} ${selectedYear}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #4f46e5;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .day-section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .day-title {
              color: #4f46e5;
              font-size: 18px;
              font-weight: bold;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .course-entry {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              margin-bottom: 10px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              background-color: #f8fafc;
            }
            .course-info {
              flex: 1;
            }
            .course-name {
              font-weight: bold;
              margin-bottom: 4px;
              font-size: 14px;
            }
            .course-code {
              color: #666;
              font-size: 12px;
              font-weight: normal;
            }
            .course-venue {
              color: #666;
              font-size: 12px;
              margin-top: 2px;
            }
            .course-time {
              font-family: monospace;
              background-color: #e0e7ff;
              color: #3730a3;
              padding: 6px 10px;
              border-radius: 20px;
              font-size: 12px;
              white-space: nowrap;
            }
            .no-entries {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
            }
            @media print {
              body { margin: 15px; }
              .day-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Class Timetable</h1>
            <p><strong>Program:</strong> ${selectedProgram}</p>
            <p><strong>Year of Study:</strong> ${selectedYear}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          ${orderedDays.map(day => {
            const dayEntries = groupedByDay[day];
            if (!dayEntries || dayEntries.length === 0) return '';
            
            return `
              <div class="day-section">
                <div class="day-title">${day}</div>
                ${dayEntries.map(entry => `
                  <div class="course-entry">
                    <div class="course-info">
                      <div class="course-name">
                        ${entry.course_name}
                        <span class="course-code">(${entry.course_code})</span>
                      </div>
                      <div class="course-venue">Venue: ${entry.venue}</div>
                    </div>
                    <div class="course-time">${entry.time}</div>
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
          
          ${filteredEntries.length === 0 ? '<div class="no-entries">No timetable entries found.</div>' : ''}
        </body>
        </html>
      `;

      // Write content and trigger print
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
          setIsDownloading(false);
        }, 500);
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
      <div className="space-y-8" ref={timetableRef}>
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
              <Download size={18} />
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
