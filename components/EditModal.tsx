import React, { useState, useEffect, useCallback } from 'react';
import { type TimetableEntry, YearOfStudy, DayOfWeek } from '../types';
import Button from './shared/Button';
import Input from './shared/Input';
import Select from './shared/Select';

interface EditModalProps {
  entry: TimetableEntry;
  onUpdate: (updatedEntry: TimetableEntry) => Promise<void>;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ entry, onUpdate, onClose }) => {
  const [formData, setFormData] = useState<TimetableEntry>(entry);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(entry);
  }, [entry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error(error);
      alert((error as Error).message || 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 modal-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <h2 id="edit-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Timetable Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input id="program_of_study" name="program_of_study" label="Program of Study" value={formData.program_of_study} onChange={handleInputChange} required />
               <Select id="year_of_study" name="year_of_study" label="Year of Study" value={formData.year_of_study} onChange={handleInputChange}>
                 {Object.values(YearOfStudy).map(year => <option key={year} value={year}>{year}</option>)}
               </Select>
               <Input id="course_code" name="course_code" label="Course Code" value={formData.course_code} onChange={handleInputChange} required />
               <Input id="course_name" name="course_name" label="Course Name" value={formData.course_name} onChange={handleInputChange} required />
               <Input id="venue" name="venue" label="Venue" value={formData.venue} onChange={handleInputChange} required />
               <Select id="day" name="day" label="Day of the Week" value={formData.day} onChange={handleInputChange}>
                 {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
               </Select>
               <Input id="time" name="time" label="Time" type="time" value={formData.time} onChange={handleInputChange} required />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
