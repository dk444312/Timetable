import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimetableForm from './components/TimetableForm';
import TimetableView from './components/TimetableView';
import ManageEntries from './components/ManageEntries';
import EditModal from './components/EditModal';
import { supabase } from './lib/supabase';
import { type TimetableEntry } from './types';

type View = 'view' | 'create' | 'manage';

const App: React.FC = () => {
  const [view, setView] = useState<View>('view');
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!supabase) {
        setError("Supabase is not configured. Please check your environment variables.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching timetable entries:', error);
        setError('Failed to load timetable data. Please try again later.');
      } else {
        setTimetableEntries(data as TimetableEntry[] || []);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id' | 'created_at'>) => {
     if (!supabase) {
        throw new Error("Supabase is not configured.");
     }
    
    const { data, error } = await supabase
      .from('timetable_entries')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error adding timetable entry:', error);
      throw new Error(error.message || 'Failed to add new entry. Please try again.');
    }

    if (data) {
      setTimetableEntries(prevEntries => [...prevEntries, data as TimetableEntry]);
    }
    
    setView('view');
  };
  
  const handleUpdateEntry = async (updatedEntry: TimetableEntry) => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { id, ...updateData } = updatedEntry;

    const { data, error } = await supabase
      .from('timetable_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating entry:', error);
      throw new Error(error.message || 'Failed to update entry.');
    }

    if (data) {
      setTimetableEntries(prev => prev.map(e => (e.id === id ? data as TimetableEntry : e)));
    }
    setEditingEntry(null); // Close modal on success
  };
  
  const handleDeleteEntry = async (id: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      const { error } = await supabase
        .from('timetable_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
        return;
      }

      setTimetableEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 ${
        active
          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
        <Header />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                <TabButton active={view === 'view'} onClick={() => setView('view')}>
                  View Timetable
                </TabButton>
                <TabButton active={view === 'create'} onClick={() => setView('create')}>
                  Create Entry
                </TabButton>
                 <TabButton active={view === 'manage'} onClick={() => setView('manage')}>
                  Manage Entries
                </TabButton>
              </nav>
            </div>

            <div className="mt-8">
              {view === 'create' && <TimetableForm addEntry={addTimetableEntry} />}
              {view === 'view' && <TimetableView entries={timetableEntries} loading={loading} error={error} />}
              {view === 'manage' && (
                <ManageEntries
                  entries={timetableEntries}
                  loading={loading}
                  error={error}
                  onEdit={setEditingEntry}
                  onDelete={handleDeleteEntry}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      {editingEntry && (
        <EditModal 
          entry={editingEntry}
          onUpdate={handleUpdateEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
};

export default App;