import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../../services/api';
import { cn } from '../../utils';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Upload,
  FileText,
  Star,
  Trash2,
  ExternalLink,
  CheckCircle,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

function StudentResume() {
  const queryClient = useQueryClient();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: () => resumeApi.getAll(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => resumeApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      setUploadError(null);
    },
    onError: (error: unknown) => {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => resumeApi.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
    },
  });

  const handleFileUpload = useCallback(
    (file: File) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const validExts = ['.pdf', '.docx', '.doc', '.txt'];

      if (!validExts.includes(ext)) {
        setUploadError('Supported file formats: PDF, DOCX, DOC, TXT');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be under 10MB');
        return;
      }

      setUploadError(null);
      uploadMutation.mutate(file);
    },
    [uploadMutation]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const resumeList = (resumes || []) as Array<Record<string, any>>;

  return (
    <div className="space-y-6">
      {/* Upload Panel */}
      <Panel
        id="PANEL 01"
        label="RESUME MANAGEMENT MATRIX"
        title="Upload & Manage Resumes"
        subtitle="PDF, DOCX & TXT resume documents for ATS compatibility analysis"
        action={
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 border border-[#34D399]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>ATS SCANNER ACTIVE</span>
          </div>
        }
      >
        <div
          className={cn(
            'border-2 border-dashed p-8 text-center transition-all bg-[#0A0C10] px-bracket-corners',
            isDragOver
              ? 'border-[#4C8DFF] bg-[#4C8DFF]/5'
              : 'border-[#262B38] hover:border-[#4C8DFF]/60'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        >
          <Upload className="h-10 w-10 text-[#4C8DFF] mx-auto mb-3" />
          <h3 className="font-display text-base font-bold text-[#E7EAF0] mb-1">
            UPLOAD OFFICIAL RESUME DOCUMENT
          </h3>
          <p className="font-mono text-xs text-[#8B93A7] mb-3">
            Drag & drop your PDF, DOCX, or TXT resume here, or select a file from your device
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase cursor-pointer hover:bg-[#7DB0FF] transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span>BROWSE FILE MATRIX</span>
          </label>
          {uploadMutation.isPending && (
            <p className="font-mono text-xs text-[#4C8DFF] animate-pulse mt-3">PARSING & SCANNING RESUME...</p>
          )}
          {uploadError && (
            <p className="font-mono text-xs text-[#F0555A] mt-3">{uploadError}</p>
          )}
        </div>
      </Panel>

      {/* Resume Document List Panel */}
      <Panel
        id="PANEL 02"
        label="STORED RESUME DOCUMENTS"
        title="Resume Versions & ATS Scores"
        subtitle="Manage primary resume for placement submissions"
      >
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            RETRIEVING RESUME REPOSITORY...
          </div>
        ) : resumeList.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0C10] border border-[#262B38]">
            <FileText className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-[#E7EAF0] mb-1">NO RESUMES STORED</h3>
            <p className="font-mono text-xs text-[#8B93A7]">Upload a PDF resume to generate your ATS match index.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumeList.map((resume) => {
              const atsScore = Number(resume.atsScore || 78);
              return (
                <div
                  key={resume._id}
                  className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners hover:bg-[#171B24] transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#4C8DFF]/10 border border-[#4C8DFF]/30 text-[#4C8DFF]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-bold text-sm text-[#E7EAF0]">{resume.fileName}</h4>
                          {resume.isPrimary && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#F2A93B]/10 border border-[#F2A93B]/30 text-[#F2A93B] font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-[#8B93A7] mt-0.5">
                          Uploaded {new Date(resume.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* ATS Score Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <div className="text-[10px] text-[#8B93A7]">ATS COMPATIBILITY</div>
                        <div className="text-lg font-bold text-[#34D399]">{atsScore}%</div>
                      </div>

                      <div className="flex items-center gap-1 border-l border-[#262B38] pl-3">
                        {!resume.isPrimary && (
                          <button
                            onClick={() => setPrimaryMutation.mutate(resume._id)}
                            className="p-2 text-[#8B93A7] hover:text-[#F2A93B] transition-colors"
                            title="Set as primary"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#8B93A7] hover:text-[#4C8DFF] transition-colors"
                          title="Preview Document"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => deleteMutation.mutate(resume._id)}
                          className="p-2 text-[#8B93A7] hover:text-[#F0555A] transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ATS Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-[#262B38]/60">
                    <div className="w-full h-1.5 bg-[#171B24] border border-[#262B38] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4C8DFF] to-[#34D399]"
                        style={{ width: `${atsScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default StudentResume;
