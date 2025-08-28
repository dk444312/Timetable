import React, { useState } from 'react';
import { type TimetableEntry, YearOfStudy, DayOfWeek } from '../types';
import Button from './shared/Button';
import Card from './shared/Card';
import Input from './shared/Input';
import Select from './shared/Select';

interface TimetableFormProps {
  addEntry: (entry: Omit<TimetableEntry, 'id' | 'created_at'>) => Promise<void>;
}

const TimetableForm: React.FC<TimetableFormProps> = ({ addEntry }) => {
  const [programOfStudy, setProgramOfStudy] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<YearOfStudy>(YearOfStudy.FIRST);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [venue, setVenue] = useState('');
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programOfStudy || !courseCode || !courseName || !venue || !time) {
      alert('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addEntry({
        program_of_study: programOfStudy.trim(),
        year_of_study: yearOfStudy,
        course_code: courseCode.trim().toUpperCase(),
        course_name: courseName.trim(),
        venue: venue.trim(),
        day,
        time: time.trim(),
      });
      // Reset form
      setProgramOfStudy('');
      setYearOfStudy(YearOfStudy.FIRST);
      setCourseCode('');
      setCourseName('');
      setVenue('');
      setDay(DayOfWeek.MONDAY);
      setTime('');
    } catch (error) {
        console.error(error);
        alert((error as Error).message || 'An unexpected error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add a New Timetable Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="program"
              label="Program of Study"
              value={programOfStudy}
              onChange={(e) => setProgramOfStudy(e.target.value)}
              placeholder="e.g., Computer Science"
              required
            />
            <Select
              id="year"
              label="Year of Study"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value as YearOfStudy)}
            >
              {Object.values(YearOfStudy).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
            <Input
              id="courseCode"
              label="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., CS101"
              required
            />
            <Input
              id="courseName"
              label="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Introduction to Programming"
              required
            />
             <Input
              id="venue"
              label="Venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Main Auditorium"
              required
            />
            <Select
              id="day"
              label="Day of the Week"
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
            >
              {Object.values(DayOfWeek).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
             <Input
              id="time"
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 10:00"
              required
            />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding Entry...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default TimetableForm;