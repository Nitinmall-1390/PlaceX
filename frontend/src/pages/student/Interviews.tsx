import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RangeTabs } from '../../components/ui/RangeTabs';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  BrainCircuit,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StudentInterviews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: rawInterviews, isLoading } = useQuery({
    queryKey: ['student-interviews'],
    queryFn: () => interviewApi.getMyInterviews(),
  });

  const interviews = (rawInterviews || []) as Array<Record<string, any>>;

  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'SCHEDULED' || new Date(i.scheduledAt).getTime() >= Date.now()
  );
  const pastInterviews = interviews.filter(
    (i) => i.status !== 'SCHEDULED' && new Date(i.scheduledAt).getTime() < Date.now()
  );

  const displayedInterviews = activeTab === 'upcoming' ? upcomingInterviews : pastInterviews;

  return (
    <div className="space-y-6">
      <Panel
        id="PANEL 01"
        label="INTERVIEW OPERATIONS"
        title="Candidate Interview Schedule"
        subtitle="Manage upcoming technical rounds, coding assessments & past feedback"
        action={
          <RangeTabs
            options={[
              { id: 'upcoming', label: `UPCOMING (${upcomingInterviews.length})` },
              { id: 'past', label: `PAST (${pastInterviews.length})` },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        }
      >
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            LOADING INTERVIEW MATRIX DATA...
          </div>
        ) : displayedInterviews.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0C10] border border-[#262B38]">
            <Calendar className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-[#E7EAF0] mb-1">
              NO {activeTab.toUpperCase()} INTERVIEWS SCHEDULED
            </h3>
            <p className="font-mono text-xs text-[#8B93A7]">
              {activeTab === 'upcoming'
                ? 'Your interview pipeline is clear. Keep submitting job applications to unlock interview rounds.'
                : 'No historical interview logs recorded.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedInterviews.map((interview) => {
              const company = interview.company || {};
              const job = interview.job || {};
              const dateObj = new Date(interview.scheduledAt || Date.now());

              return (
                <div
                  key={interview._id}
                  className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners hover:bg-[#171B24] transition-colors space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-[#4C8DFF] uppercase tracking-wider">
                        {interview.type || 'TECHNICAL'} ROUND
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#E7EAF0]">
                        {job.title || 'Software Engineering Role'}
                      </h3>
                      <p className="font-mono text-xs text-[#8B93A7]">{company.name || 'Partner Company'}</p>
                    </div>
                    <StatusBadge status={interview.status || 'SCHEDULED'} pulse={interview.status === 'SCHEDULED'} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs p-3 bg-[#12151C] border border-[#262B38]">
                    <div className="flex items-center gap-2 text-[#E7EAF0]">
                      <Calendar className="h-3.5 w-3.5 text-[#4C8DFF]" />
                      <span>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#E7EAF0]">
                      <Clock className="h-3.5 w-3.5 text-[#F2A93B]" />
                      <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8B93A7]">
                      <MapPin className="h-3.5 w-3.5 text-[#34D399]" />
                      <span>{interview.location || 'Virtual Platform'}</span>
                    </div>
                  </div>

                  {interview.meetingLink && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>JOIN VIRTUAL MEETING ROOM</span>
                      </a>

                      <button
                        onClick={() => navigate('/student/ai')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#171B24] border border-[#4C8DFF]/40 text-[#4C8DFF] font-mono text-xs font-bold uppercase hover:bg-[#262B38] transition-colors"
                      >
                        <BrainCircuit className="h-3.5 w-3.5" />
                        <span>PREPARE WITH AI ADVISOR</span>
                      </button>
                    </div>
                  )}

                  {interview.feedback && (
                    <div className="p-3 bg-[#171B24] border border-[#34D399]/30 text-xs font-mono">
                      <span className="text-[#34D399] font-bold block mb-1">// INTERVIEWER FEEDBACK:</span>
                      <p className="text-[#E7EAF0]">{interview.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default StudentInterviews;
