import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '../../utils';
import { Save, X, Plus, Trash2 } from 'lucide-react';

function CompanyDriveForm() {
  const [rounds, setRounds] = useState<string[]>([]);
  const [newRound, setNewRound] = useState('');

  const addRound = () => {
    if (newRound.trim() && !rounds.includes(newRound.trim())) {
      setRounds([...rounds, newRound.trim()]);
    }
    setNewRound('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create Placement Drive</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-muted transition-colors">Save Draft</button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Create Drive</button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Drive Title</label>
          <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Drive Date</label>
            <input type="date" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Mode</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Venue / Meeting Link</label>
          <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
        </div>
      </div>
    </div>
  );
}

export default CompanyDriveForm;
