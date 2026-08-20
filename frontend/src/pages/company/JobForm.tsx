import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '../../utils';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface JobFormProps {
  isEdit?: boolean;
}

function CompanyJobForm({ isEdit = false }: JobFormProps) {
  const [activeSection, setActiveSection] = useState('basic');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [responsibilities, setResponsibilities] = useState<string>('');

  const formSections = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'description', label: 'Job Description' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'settings', label: 'Application Settings' },
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? 'Edit Job' : 'Create New Job'}
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-muted transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            {isEdit ? 'Update & Publish' : 'Publish Job'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Form navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {formSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left rounded-md transition-colors',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form content */}
        <div className="lg:col-span-3">
          <div className="bg-card border rounded-xl p-6">
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Job Title</label>
                    <input
                      type="text"
                      placeholder="Senior Software Engineer"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <input
                      type="text"
                      placeholder="Bangalore, Remote..."
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Employment Type</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP_PPO">Internship with PPO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Number of Openings</label>
                    <input
                      type="number"
                      placeholder="1"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'description' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Job Description</label>
                    <textarea
                      placeholder="Describe the role and responsibilities..."
                      rows={6}
                      className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Responsibilities</label>
                    <textarea
                      placeholder="List the key responsibilities..."
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'requirements' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Required Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/5 text-primary rounded"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-error"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Type and press Enter to add..."
                        className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Preferred Skills</label>
                    <input
                      type="text"
                      placeholder="e.g. Docker, AWS, Kubernetes"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'eligibility' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="e.g. 7.5"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Eligible Courses</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech, B.E"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Eligible Departments</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science, IT"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Max Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Eligible Graduation Years</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025, 2026"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'compensation' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Min Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Max Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1200000"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Currency</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Negotiable</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                      {isEdit ? (
                        <>
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="CLOSED">Closed</option>
                        </>
                      ) : (
                        <>
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Publish</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyJobForm;
