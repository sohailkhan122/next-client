'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Skeleton, message } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  LinkedinOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { apiGetMe, type AuthUser } from '../lib/authApi';
import { apiGetMyStudentDetail, apiGetStudentDetailByUserId } from '../lib/studentDetailApi';
import ResumePdfDocument from './ResumePdfDocument';
import { CardSkeleton } from '../components/skeletons';


// ─── Types ────────────────────────────────────────────────────────────────────
interface StudentProject {
  title?: string;
  description?: string;
  technology?: string;
  technologies?: string[];
  url?: string;
  projectUrl?: string;
}

interface StudentDetail {
  requiredJob?: string;
  requiredExperience?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  experience?: string;
  skills?: string[];
  projects?: StudentProject[];
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  linkedIn?: string;
  location?: string;
}

interface NormalizedProject {
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
}

// ─── Skill badge colours (cycles through palette) ────────────────────────────
const SKILL_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function ResumePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeRef = useRef<HTMLDivElement>(null);

  // When a company clicks "View Resume" from the applicants page, these are set
  const viewUserId = searchParams.get('userId');
  const viewName = searchParams.get('name');
  const viewEmail = searchParams.get('email');
  const isViewingOther = !!viewUserId;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (isViewingOther) {
        // Company viewing a student's resume — no auth redirect needed
        try {
          const sd = await apiGetStudentDetailByUserId(viewUserId!);
          setDetail(sd);
        } catch {
          setDetail(null);
        } finally {
          setLoading(false);
        }
        return;
      }
      try {
        const me = await apiGetMe();
        setUser(me);
        try {
          const sd = await apiGetMyStudentDetail();
          setDetail(sd);
        } catch {
          setDetail(null);
        }
      } catch {
        // Not authenticated – stay on page but show empty template
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isViewingOther, viewUserId]);

  // ─── PDF download (direct file download, no print dialog) ────────────────
  const handleDownloadPDF = async () => {
    if (!detail || isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const roleLabel = !isViewingOther && user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : '';

      const doc = (
        <ResumePdfDocument
          displayName={displayName}
          displayEmail={displayEmail}
          detail={detail}
          isViewingOther={isViewingOther}
          roleLabel={roleLabel}
          normalizedProjects={normalizedProjects}
        />
      );

      const blob = await pdf(doc).toBlob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (displayName || 'resume').trim().replace(/\s+/g, '-').toLowerCase();
      link.href = fileUrl;
      link.download = `${safeName}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      message.error('Unable to generate the PDF right now. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  // When viewing another user's resume, use the name/email passed as query params
  const displayName = isViewingOther ? (viewName ?? 'Student') : (user?.name ?? '');
  const displayEmail = isViewingOther ? (viewEmail ?? '') : (user?.email ?? '');

  const initials = displayName
    ? displayName
      .split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'YN';

  const currentYear = new Date().getFullYear();
  const gradYear = detail?.graduationYear ? Number(detail.graduationYear) : null;
  const isGraduated = gradYear !== null && gradYear <= currentYear;
  const normalizedProjects: NormalizedProject[] = Array.isArray(detail?.projects)
    ? detail.projects
      .map((project) => ({
        title: project?.title?.trim() ?? '',
        description: project?.description?.trim() ?? '',
        technologies: Array.isArray(project?.technologies)
          ? project.technologies
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean)
          : typeof project?.technology === 'string'
            ? project.technology
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
            : [],
        projectUrl: project?.projectUrl?.trim() ?? project?.url?.trim() ?? '',
      }))
      .filter((project) => project.title || project.description)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-2 py-4 sm:px-4 sm:py-8">
        <div className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 sm:px-6">
          <Skeleton.Button active className="!h-8 !w-24" />
          <Skeleton.Input active className="!h-5 !w-28" />
          <div className="flex gap-2">
            <Skeleton.Button active className="!h-9 !w-28" />
            <Skeleton.Button active className="!h-9 !w-28" />
          </div>
        </div>
        <div className="resume-page mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg sm:rounded-2xl sm:shadow-2xl">
          <div className="h-44 bg-slate-200/80 animate-pulse" />
          <div className="space-y-6 px-4 py-5 sm:px-10 sm:py-8">
            <CardSkeleton count={1} showHeader={false} showActions={false} />
            <CardSkeleton count={1} showHeader={false} showActions={false} />
            <CardSkeleton count={1} showHeader={false} showActions={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Print styles injected as a style tag ──────────────────────────── */}
      <style>{`
        @page {
          margin: 12mm;
        }

        @media print {
          .no-print { display: none !important; }
          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-page { box-shadow: none !important; }
          .resume-print-header,
          .resume-print-header * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-print-header {
            background: linear-gradient(135deg, #4338ca 0%, #4f46e5 55%, #7c3aed 100%) !important;
          }
        }
      `}</style>

      {/* ── Toolbar (hidden on print) ──────────────────────────────────────── */}
      <div className="no-print sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur border-b border-slate-200 px-3 py-3 sm:px-6 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium text-sm"
        >
          <ArrowLeftOutlined />
          Back
        </button>
        <span className="order-3 w-full text-center text-xs font-semibold text-slate-700 tracking-wide sm:order-2 sm:w-auto sm:text-sm">Resume Preview</span>
        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:gap-3">
          {!isViewingOther && (
            <button
              onClick={() => router.push('/resume/create')}
              className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs sm:px-5 sm:text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <EditOutlined />
              {detail ? 'Edit Resume' : 'Create Resume'}
            </button>
          )}
          {detail && (
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 transition-all text-white text-xs sm:text-sm font-semibold px-3 py-2 sm:px-5 rounded-full shadow"
            >
              <DownloadOutlined />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>

      {/* ── Page wrapper ──────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-slate-100 py-4 px-2 sm:py-8 sm:px-4 print:bg-white print:py-0 print:px-0">
        {/* ── Resume document ─────────────────────────────────────────────── */}
        <div
          ref={resumeRef}
          className="resume-page mx-auto w-full max-w-3xl bg-white shadow-lg sm:shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* ════════ HEADER ════════════════════════════════════════════════ */}
          <div
            className="resume-print-header bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-600 px-4 py-6 sm:px-10 sm:py-10 text-white"
            style={{
              background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 55%, #7c3aed 100%)',
            }}
          >
            <div className="flex items-start sm:items-center gap-4 sm:gap-7">
              {/* Avatar */}
              <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 ring-4 ring-white/40 flex items-center justify-center text-xl sm:text-3xl font-extrabold text-white select-none">
                {initials}
              </div>

              {/* Name + role */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight break-words">
                  {displayName
                    ? displayName.charAt(0).toUpperCase() + displayName.slice(1)
                    : "Your Name"}
                </h1>
                {detail?.fieldOfStudy && detail?.degree && (
                  <p className="mt-1 text-indigo-200 font-semibold text-sm sm:text-base break-words">
                    {detail.degree} · {detail.fieldOfStudy}
                  </p>
                )}
                {detail?.requiredJob && (
                  <p className="mt-1 text-indigo-100 text-xs sm:text-sm font-semibold break-words">
                    {detail.requiredJob}
                  </p>
                )}
                {detail?.requiredExperience && (
                  <p className="mt-1 text-indigo-100 text-xs sm:text-sm font-semibold break-words">
                    Experience: {detail.requiredExperience}
                  </p>
                )}
                {/* {detail?.bio && (
                  <p className="mt-2 text-indigo-100 text-sm leading-relaxed max-w-lg">
                    {detail.bio}
                  </p>
                )} */}
              </div>
            </div>

            {/* Contact strip */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-indigo-100 text-[11px] sm:text-xs font-medium">
              {displayEmail && (
                <span className="flex items-start gap-1.5 break-all">
                  <MailOutlined />
                  {displayEmail}
                </span>
              )}
              {detail?.phone && (
                <span className="flex items-center gap-1.5">
                  <PhoneOutlined />
                  {detail.phone}
                </span>
              )}
              {detail?.linkedIn && (
                <span className="flex items-center gap-1.5">
                  <LinkedinOutlined />
                  {detail.linkedIn}
                </span>
              )}
              {detail?.location && (
                <span className="flex items-center gap-1.5">
                  <EnvironmentOutlined />
                  {detail.location}
                </span>
              )}
            </div>
          </div>

          {/* ════════ BODY ══════════════════════════════════════════════════ */}
          <div className="px-4 py-5 sm:px-10 sm:py-8 space-y-6 sm:space-y-8">
            {/* ── Professional Summary ─────────────────────────────────────── */}
            {detail?.bio && (
              <section>
                <SectionTitle>Objective</SectionTitle>
                <p className="mt-2 sm:mt-3 text-slate-600 text-sm leading-relaxed">
                  {detail.bio}
                </p>
              </section>
            )}

            {/* ── Education ───────────────────────────────────────────────── */}
            {(detail?.institution || detail?.degree) && (
              <section>
                <SectionTitle>Education</SectionTitle>
                <div className="mt-2 sm:mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="font-bold text-slate-800 text-sm sm:text-base">
                        {detail.degree ?? '—'}
                        {detail.fieldOfStudy ? ` in ${detail.fieldOfStudy}` : ''}
                      </p>
                      <p className="text-indigo-600 font-semibold text-sm mt-0.5 break-words">
                        {detail.institution ?? '—'}
                      </p>
                    </div>
                    {detail.graduationYear && (
                      <span className="shrink-0 flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-0.5">
                        <CalendarOutlined />
                        {isGraduated ? `Graduated ${detail.graduationYear}` : `Expected ${detail.graduationYear}`}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Personal Information ─────────────────────────────────────── */}
            <section>
              <SectionTitle>Personal Information</SectionTitle>
              <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail?.gender && (
                  <InfoRow label="Gender" value={detail.gender} />
                )}
                {detail?.dateOfBirth && (
                  <InfoRow label="Date of Birth" value={detail.dateOfBirth} />
                )}
                {!isViewingOther && user?.role && (
                  <InfoRow label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                )}
              </div>
            </section>

            {/* ── Experience ──────────────────────────────────────────────── */}
            {detail?.experience && (
              <section>
                <SectionTitle>Experience</SectionTitle>
                <p className="mt-2 sm:mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {detail.experience}
                </p>
              </section>
            )}

            {/* ── Skills ──────────────────────────────────────────────────── */}
            {detail?.skills && detail.skills.length > 0 && (
              <section>
                <SectionTitle>Skills</SectionTitle>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                  {detail.skills.map((skill, i) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ── Projects ────────────────────────────────────────────────── */}
            {normalizedProjects.length > 0 && (
              <section>
                <SectionTitle>Projects</SectionTitle>
                <div className="mt-2 sm:mt-3 space-y-3">
                  {normalizedProjects.map((project, index) => (
                    <div key={`${project.title || 'project'}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                      {project.title && (
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-bold text-slate-800">{project.title}</div>
                          {project.projectUrl && (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium"
                            >
                              <LinkOutlined />
                              View
                            </a>
                          )}
                        </div>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.description && (
                        <p className="text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-line">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Empty state hint ─────────────────────────────────────────── */}
            {!detail && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center no-print">
                <p className="text-slate-400 text-sm font-medium">
                  You have not added resume details yet.
                </p>
                <button
                  onClick={() => router.push('/resume/create')}
                  className="mt-3 text-indigo-600 hover:underline text-sm font-semibold"
                >
                  Create Resume →
                </button>
              </div>
            )}
          </div>

          {/* ════════ FOOTER ════════════════════════════════════════════════ */}
          <div className="border-t border-slate-100 px-4 py-3 sm:px-10 sm:py-4 flex flex-col gap-1.5 sm:flex-row sm:justify-between sm:items-center bg-slate-50">
            <span className="text-[11px] sm:text-xs text-slate-400">Generated · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Confidential</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 px-2 py-4 sm:px-4 sm:py-8">
          <div className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 sm:px-6">
            <Skeleton.Button active className="!h-8 !w-24" />
            <Skeleton.Input active className="!h-5 !w-28" />
            <div className="flex gap-2">
              <Skeleton.Button active className="!h-9 !w-28" />
              <Skeleton.Button active className="!h-9 !w-28" />
            </div>
          </div>
          <div className="resume-page mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg sm:rounded-2xl sm:shadow-2xl">
            <div className="h-44 bg-slate-200/80 animate-pulse" />
            <div className="space-y-6 px-4 py-5 sm:px-10 sm:py-8">
              <CardSkeleton count={1} showHeader={false} showActions={false} />
              <CardSkeleton count={1} showHeader={false} showActions={false} />
            </div>
          </div>
        </div>
      }
    >
      <ResumePageContent />
    </Suspense>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider sm:tracking-widest text-indigo-600">
        {children}
      </h2>
      <div className="flex-1 h-px bg-indigo-100" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 border border-slate-100">
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 break-words">{value}</p>
    </div>
  );
}
