import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tpoApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../utils';
import {
  Search,
  Filter,
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ExternalLink,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';

function TpoStudents() {
  const [department, setDepartment] = useState('ALL');
  const [placementStatus, setPlacementStatus] = useState('ALL');
  const [minCGPA, setMinCGPA] = useState('7.0');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['tpo-students', department, placementStatus, minCGPA, searchQuery],
    queryFn: () =>
      tpoApi.getStudents({
        department: department === 'ALL' ? undefined : department,
        placementStatus: placementStatus === 'ALL' ? undefined : placementStatus,
        minCGPA,
        search: searchQuery,
      }),
  });

  const studentsList = ((studentsData?.students as any[]) || []);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="INSTITUTION CANDIDATE ROSTER"
        title="Student Roster & Eligibility Engine"
        subtitle="Filter students by CGPA, department, graduation batch & evaluate placement eligibility rules"
      >
        {/* Filter Controls */}
        <div className="p-4 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[#8B93A7] block mb-1 uppercase">DEPARTMENT:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] focus:border-[#F2A93B]"
              >
                <option value="ALL">ALL DEPARTMENTS</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="text-[#8B93A7] block mb-1 uppercase">PLACEMENT STATUS:</label>
              <select
                value={placementStatus}
                onChange={(e) => setPlacementStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] focus:border-[#F2A93B]"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="OPEN_TO_OPPORTUNITIES">OPEN TO OPPORTUNITIES</option>
                <option value="INTERVIEWING">INTERVIEWING</option>
                <option value="OFFER_RECEIVED">OFFER RECEIVED</option>
                <option value="PLACED">PLACED</option>
              </select>
            </div>

            <div>
              <label className="text-[#8B93A7] block mb-1 uppercase">MINIMUM CGPA (CUTOFF):</label>
              <select
                value={minCGPA}
                onChange={(e) => setMinCGPA(e.target.value)}
                className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] focus:border-[#F2A93B]"
              >
                <option value="6.0">≥ 6.0 CGPA</option>
                <option value="7.0">≥ 7.0 CGPA</option>
                <option value="7.5">≥ 7.5 CGPA (Standard Cutoff)</option>
                <option value="8.0">≥ 8.0 CGPA (Tier 1 Cutoff)</option>
                <option value="8.5">≥ 8.5 CGPA (High Honor)</option>
              </select>
            </div>

            <div>
              <label className="text-[#8B93A7] block mb-1 uppercase">SEARCH CANDIDATE:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B93A7]" />
                <input
                  type="text"
                  placeholder="Name or Student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] focus:border-[#F2A93B]"
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Student Roster Table Panel */}
      <Panel id="PANEL 02" label="VERIFIED CANDIDATE MATRIX" title="Student Roster & Eligibility Results">
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            RETRIEVING INSTITUTION STUDENT RECORDS...
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#8B93A7] text-[10px] px-2 uppercase">
              <span>TOTAL CANDIDATES RETURNED: {studentsList.length}</span>
              <span>DYNAMIC CUTOFF CRITERIA: {minCGPA} CGPA</span>
            </div>

            {studentsList.map((student) => (
              <div
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                className="p-4 bg-[#0A0C10] border border-[#262B38] hover:bg-[#171B24] transition-colors cursor-pointer space-y-3 px-bracket-corners"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#171B24] border border-[#F2A93B]/30 text-[#F2A93B] flex items-center justify-center font-bold">
                      {(student.user?.name || 'ST').slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#E7EAF0] text-sm">{student.user?.name || 'Aarav Sharma'}</h4>
                        <span className="text-[10px] text-[#8B93A7]">ID // {student.studentId}</span>
                      </div>
                      <p className="text-[#8B93A7] text-[11px]">
                        {student.course} · {student.department} (Batch {student.graduationYear})
                      </p>
                    </div>
                  </div>

                  {/* CGPA & Eligibility Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[#8B93A7] text-[10px] block">ACADEMIC CGPA</span>
                      <span className="font-bold text-[#E7EAF0] text-sm">{student.cgpa || 8.5} / 10</span>
                    </div>

                    <div className="text-right">
                      {student.isEligible ? (
                        <span className="px-2.5 py-1 bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399] font-bold text-[10px]">
                          ✓ ELIGIBLE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A] font-bold text-[10px]">
                          ✗ NOT ELIGIBLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Eligibility Failure Reasons (if ineligible) */}
                {!student.isEligible && (student.eligibilityReasons || []).length > 0 && (
                  <div className="p-2 bg-[#F0555A]/5 border border-[#F0555A]/20 text-[#F0555A] text-[10px]">
                    <span className="font-bold">// ELIGIBILITY FAILURE REASON: </span>
                    {student.eligibilityReasons.join(' | ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="text-[10px] text-[#F2A93B] uppercase">// CANDIDATE DOSSIER</div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0]">{selectedStudent.user?.name}</h3>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-[#8B93A7] hover:text-[#E7EAF0]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#0A0C10] border border-[#262B38] flex justify-between">
                <span className="text-[#8B93A7]">DEPARTMENT:</span>
                <span className="text-[#E7EAF0] font-bold">{selectedStudent.department}</span>
              </div>
              <div className="p-3 bg-[#0A0C10] border border-[#262B38] flex justify-between">
                <span className="text-[#8B93A7]">ACADEMIC CGPA:</span>
                <span className="text-[#34D399] font-bold">{selectedStudent.cgpa} / 10</span>
              </div>
              <div className="p-3 bg-[#0A0C10] border border-[#262B38] flex justify-between">
                <span className="text-[#8B93A7]">PLACEMENT STATUS:</span>
                <span className="text-[#F2A93B] font-bold">{selectedStudent.placementStatus || 'OPEN TO OPPORTUNITIES'}</span>
              </div>
              <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">VERIFIED SKILLS:</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedStudent.skills || ['React', 'Node.js', 'MongoDB']).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-[#171B24] border border-[#262B38] text-[#7DB0FF] text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#262B38] flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-1.5 bg-[#F2A93B] text-[#0A0C10] font-bold uppercase">
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TpoStudents;
