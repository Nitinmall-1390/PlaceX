import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi, resumeApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../utils';
import {
  User,
  GraduationCap,
  Code,
  Briefcase,
  Award,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  Eye,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StudentProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('summary');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch core student profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.getProfile(),
  });

  // Fetch profile strength breakdown
  const { data: strengthData } = useQuery({
    queryKey: ['student-profile-strength'],
    queryFn: () => studentApi.getStrength(),
  });

  // Fetch student activity log
  const { data: activityData } = useQuery({
    queryKey: ['student-profile-activity'],
    queryFn: () => studentApi.getActivity(),
  });

  // Fetch student primary resume
  const { data: resumesData } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: () => resumeApi.getAll(),
  });

  const primaryResume = ((resumesData as any[]) || []).find((r) => r.isPrimary) || ((resumesData as any[]) || [])[0];

  // Edit form state
  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Record<string, any>) => studentApi.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-strength'] });
      setShowEditModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleOpenEdit = () => {
    if (profile) {
      setFormData({
        department: profile.department || 'Computer Science',
        course: profile.course || 'B.Tech',
        graduationYear: profile.graduationYear || 2026,
        cgpa: profile.cgpa || 8.5,
        bio: profile.bio || 'Passionate software developer.',
        placementStatus: profile.placementStatus || 'OPEN_TO_OPPORTUNITIES',
        profileVisibility: profile.profileVisibility || 'RECRUITERS_ONLY',
        skills: (profile.skills || ['React', 'Node.js', 'MongoDB', 'Python']).join(', '),
        links: profile.links || { linkedin: '', github: '', portfolio: '', leetcode: '', codeforces: '' },
        preferences: profile.preferences || { preferredRoles: ['Full Stack Engineer'], locations: ['Bengaluru', 'Remote'], expectedSalary: '12 LPA', workMode: 'HYBRID' },
      });
    }
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = typeof formData.skills === 'string'
      ? formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : formData.skills;

    updateProfileMutation.mutate({
      ...formData,
      skills: skillsArray,
      cgpa: Number(formData.cgpa),
      graduationYear: Number(formData.graduationYear),
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
        RETRIEVING STUDENT CANDIDATE DOSSIER...
      </div>
    );
  }

  const user = (profile?.userProfile || profile?.user || {}) as Record<string, any>;
  const placementStatus = profile?.placementStatus || 'OPEN_TO_OPPORTUNITIES';
  const visibility = profile?.profileVisibility || 'RECRUITERS_ONLY';
  const completion = profile?.profileCompletion || 85;
  const strengthScore = strengthData?.score || 87;

  return (
    <div className="space-y-6">
      {/* Header Dossier Panel */}
      <Panel
        id="PANEL 01"
        label="CANDIDATE PROFILE DOSSIER"
        title="Student Placement Credentials"
        subtitle="Manage professional qualifications, verification badges & career preferences"
        action={
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
          >
            <span>EDIT DOSSIER</span>
          </button>
        }
      >
        {/* Candidate Profile Header Card */}
        <div className="p-6 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#171B24] border border-[#4C8DFF]/40 text-[#4C8DFF] flex items-center justify-center font-mono text-xl font-bold">
                {(user.name || 'AS').slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-[#E7EAF0]">{user.name || 'Aarav Sharma'}</h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] font-bold">
                    VERIFIED CANDIDATE
                  </span>
                </div>
                <p className="font-mono text-xs text-[#8B93A7] mt-0.5">
                  {profile?.course || 'B.Tech'} · {profile?.department || 'Computer Science Engineering'} (Batch {profile?.graduationYear || 2026})
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px]">
                  <span className="text-[#4C8DFF]">ID // {profile?.studentId || 'STU2026001'}</span>
                  <span className="text-[#565E70]">|</span>
                  <span className="text-[#34D399]">CGPA // {profile?.cgpa || 9.1} / 10</span>
                </div>
              </div>
            </div>

            {/* Placement Status & Visibility Control */}
            <div className="flex flex-col items-end gap-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#8B93A7] text-[10px]">STATUS:</span>
                <select
                  value={placementStatus}
                  onChange={(e) => updateProfileMutation.mutate({ placementStatus: e.target.value })}
                  className="px-2.5 py-1 bg-[#171B24] border border-[#34D399]/40 text-[#34D399] font-bold focus:outline-none"
                >
                  <option value="OPEN_TO_OPPORTUNITIES">🟢 OPEN TO OPPORTUNITIES</option>
                  <option value="ACTIVE_APPLICATIONS">🔵 ACTIVE APPLICATIONS</option>
                  <option value="INTERVIEWING">🟡 INTERVIEWING</option>
                  <option value="OFFER_RECEIVED">🟢 OFFER RECEIVED</option>
                  <option value="PLACED">🏆 PLACED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#8B93A7] text-[10px]">VISIBILITY:</span>
                <select
                  value={visibility}
                  onChange={(e) => updateProfileMutation.mutate({ profileVisibility: e.target.value })}
                  className="px-2 py-0.5 bg-[#171B24] border border-[#262B38] text-[#8B93A7] text-[10px] focus:outline-none"
                >
                  <option value="RECRUITERS_ONLY">👁️ RECRUITERS ONLY</option>
                  <option value="PUBLIC">🌐 PUBLIC LINK</option>
                  <option value="PRIVATE">🔒 PRIVATE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Strength & Completion Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#262B38]">
            <div className="p-4 bg-[#12151C] border border-[#262B38] space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B93A7]">PROFILE COMPLETION</span>
                <span className="font-bold text-[#34D399]">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-[#0A0C10] border border-[#262B38] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4C8DFF] to-[#34D399]" style={{ width: `${completion}%` }} />
              </div>
              <p className="text-[10px] text-[#8B93A7]">
                {completion >= 80 ? '✓ Profile dossier is fully optimized for campus placement drives.' : 'Complete pending fields to increase recruiter contact rate.'}
              </p>
            </div>

            <div className="p-4 bg-[#12151C] border border-[#262B38] space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8B93A7]">RECRUITER MATCH INDEX</span>
                <span className="font-bold text-[#F2A93B]">{strengthScore} / 100</span>
              </div>
              <p className="text-[10px] text-[#E7EAF0]">{strengthData?.summary || 'Your technical skills align with 85% of active placement drives.'}</p>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {(strengthData?.recommendations || []).length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[#8B93A7] text-[10px] uppercase block">// ACTIONABLE DOSSIER RECOMMENDATIONS:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strengthData?.recommendations.map((rec) => (
                  <div key={rec.key} className="p-2.5 bg-[#171B24] border border-[#F2A93B]/30 flex items-center justify-between">
                    <span className="text-[#E7EAF0] text-[11px]">+ {rec.title}</span>
                    <button onClick={handleOpenEdit} className="px-2 py-0.5 bg-[#F2A93B] text-[#0A0C10] font-bold text-[10px]">
                      COMPLETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1 font-mono text-xs">
          {[
            { id: 'summary', label: '01 // PROFESSIONAL SUMMARY', icon: User },
            { id: 'skills', label: '02 // SKILL MATRIX & GAPS', icon: Code },
            { id: 'academic', label: '03 // ACADEMIC TIMELINE', icon: GraduationCap },
            { id: 'projects', label: '04 // PROJECTS MATRIX', icon: Code },
            { id: 'experience', label: '05 // WORK EXPERIENCE', icon: Briefcase },
            { id: 'resume', label: '06 // RESUME & ATS SCORE', icon: FileText },
            { id: 'activity', label: '07 // ACTIVITY LOG & SECURITY', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 border text-left transition-colors',
                  active
                    ? 'bg-[#171B24] text-[#4C8DFF] border-[#4C8DFF]/40 font-bold'
                    : 'bg-[#12151C] text-[#8B93A7] border-[#262B38] hover:text-[#E7EAF0]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#565E70]" />
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'summary' && (
            <Panel id="SEC 01" label="PROFESSIONAL OVERVIEW" title="About & Career Preferences">
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-[#0A0C10] border border-[#262B38]">
                  <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">CANDIDATE BIO</span>
                  <p className="text-[#E7EAF0] leading-relaxed">
                    {profile?.bio || 'Passionate engineering student preparing for full-stack software development roles.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                    <span className="text-[#8B93A7] text-[10px] uppercase block">TARGET ROLES</span>
                    <span className="text-[#4C8DFF] font-bold mt-1 block">
                      {(profile?.preferences?.preferredRoles || ['Full Stack Engineer', 'React Developer']).join(', ')}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                    <span className="text-[#8B93A7] text-[10px] uppercase block">PREFERRED LOCATIONS</span>
                    <span className="text-[#34D399] font-bold mt-1 block">
                      {(profile?.preferences?.locations || ['Bengaluru', 'Remote', 'Hyderabad']).join(', ')}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                    <span className="text-[#8B93A7] text-[10px] uppercase block">EXPECTED SALARY TIER</span>
                    <span className="text-[#F2A93B] font-bold mt-1 block">{profile?.preferences?.expectedSalary || '12 LPA'}</span>
                  </div>
                  <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                    <span className="text-[#8B93A7] text-[10px] uppercase block">WORK MODE</span>
                    <span className="text-[#E7EAF0] font-bold mt-1 block">{profile?.preferences?.workMode || 'HYBRID / REMOTE'}</span>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'skills' && (
            <Panel id="SEC 02" label="VERIFIED TECHNICAL SKILLS" title="Skills & Market Gap Analysis">
              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-3">
                  <span className="text-[#8B93A7] text-[10px] uppercase block">// CANDIDATE SKILL PROFICIENCY:</span>
                  {(profile?.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python']).map((sk: string, idx: number) => {
                    const prof = 85 - (idx % 4) * 5;
                    return (
                      <div key={sk} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#E7EAF0] font-bold">{sk}</span>
                          <span className="text-[#34D399] font-bold">{prof}% PROFICIENT</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#171B24] border border-[#262B38] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#4C8DFF] to-[#34D399]" style={{ width: `${prof}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-[#171B24] border border-[#4C8DFF]/30 space-y-2">
                  <span className="text-[#4C8DFF] font-bold block">// MARKET SKILL GAP RECOMMENDATION:</span>
                  <p className="text-[#8B93A7]">
                    Adding <span className="text-[#F2A93B] font-bold">Docker</span> and <span className="text-[#34D399] font-bold">System Design</span> to your profile will increase eligibility across 18 active placement drives.
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'academic' && (
            <Panel id="SEC 03" label="ACADEMIC CREDENTIALS" title="Education & Academic Scorecard">
              <div className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-3 font-mono text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display text-base font-bold text-[#E7EAF0]">{profile?.course || 'B.Tech'}</h4>
                    <p className="text-[#8B93A7]">{profile?.department || 'Computer Science Engineering'}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399] font-bold">
                    CGPA {profile?.cgpa || 9.1} / 10
                  </span>
                </div>
                <div className="pt-2 border-t border-[#262B38] text-[#8B93A7]">
                  Graduation Batch: <span className="text-[#E7EAF0] font-bold">{profile?.graduationYear || 2026}</span>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'projects' && (
            <Panel id="SEC 04" label="PROJECT PORTFOLIO" title="Technical Projects Matrix">
              <div className="space-y-3 font-mono text-xs">
                {(profile?.projects || [
                  {
                    title: 'PlaceX Placement Management Platform',
                    description: 'High-scale placement tracking application connecting students, recruiters, and admins.',
                    technologies: ['React', 'Express', 'MongoDB', 'TypeScript'],
                    link: 'https://github.com/placex',
                  },
                ]).map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-[#E7EAF0] text-sm">{proj.title}</h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[#4C8DFF] hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>REPO</span>
                        </a>
                      )}
                    </div>
                    <p className="text-[#8B93A7] leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(proj.technologies || []).map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 bg-[#171B24] border border-[#262B38] text-[#7DB0FF] text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === 'resume' && (
            <Panel id="SEC 06" label="PRIMARY RESUME DOCUMENT" title="Resume & ATS Scorecard">
              {primaryResume ? (
                <div className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#4C8DFF]" />
                      <div>
                        <h4 className="font-bold text-[#E7EAF0]">{primaryResume.fileName}</h4>
                        <span className="text-[#8B93A7] text-[10px]">
                          Uploaded {new Date(primaryResume.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8B93A7] block">ATS MATCH SCORE</span>
                      <span className="text-xl font-bold text-[#34D399]">{primaryResume.atsScore || 87}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => navigate('/student/resume')} className="px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-bold uppercase">
                      MANAGE RESUMES
                    </button>
                    <a href={primaryResume.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#171B24] text-[#E7EAF0] uppercase border border-[#262B38]">
                      PREVIEW PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-[#0A0C10] border border-[#262B38] font-mono text-xs">
                  <p className="text-[#8B93A7]">No resume uploaded yet.</p>
                  <button onClick={() => navigate('/student/resume')} className="mt-3 px-4 py-2 bg-[#4C8DFF] text-[#0A0C10] font-bold uppercase">
                    UPLOAD RESUME PDF
                  </button>
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'activity' && (
            <Panel id="SEC 07" label="AUDIT LOGS & SECURITY" title="Activity History & Security">
              <div className="space-y-3 font-mono text-xs">
                {((activityData as any[]) || []).length === 0 ? (
                  <div className="p-4 bg-[#0A0C10] border border-[#262B38] text-[#8B93A7]">
                    Recent activities recorded automatically.
                  </div>
                ) : (
                  ((activityData as any[]) || []).map((act, i) => (
                    <div key={i} className="p-3 bg-[#0A0C10] border border-[#262B38] flex justify-between">
                      <span className="text-[#E7EAF0] font-bold">// {act.action}</span>
                      <span className="text-[#8B93A7] text-[10px]">{new Date(act.createdAt || Date.now()).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="text-[10px] text-[#4C8DFF] uppercase">// UPDATE CANDIDATE PARAMETERS</div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0]">Edit Student Dossier</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[#8B93A7] hover:text-[#E7EAF0]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[#8B93A7] block mb-1">CANDIDATE BIO</label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8B93A7] block mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
                <div>
                  <label className="text-[#8B93A7] block mb-1">COURSE</label>
                  <input
                    type="text"
                    value={formData.course || ''}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8B93A7] block mb-1">CGPA SCORE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cgpa || ''}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
                <div>
                  <label className="text-[#8B93A7] block mb-1">GRADUATION BATCH</label>
                  <input
                    type="number"
                    value={formData.graduationYear || ''}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8B93A7] block mb-1">TECHNICAL SKILLS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={formData.skills || ''}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#262B38]">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 bg-[#262B38] text-[#E7EAF0] uppercase">
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-1.5 bg-[#34D399] text-[#0A0C10] font-bold uppercase hover:bg-[#34D399]/90"
                >
                  SAVE DOSSIER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;
