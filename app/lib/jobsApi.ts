import axiosInstance from './axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship';
export type ApplicantStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected';

export interface Applicant {
  userId: string | Record<string, unknown>;
  appliedAt: string;
  status: ApplicantStatus;
}

export interface Job {
  _id: string;
  companyId: string | Record<string, unknown>;
  title: string;
  location: string;
  type: JobType;
  salary: string;
  description: string;
  category: string;
  experience: string;
  deadline: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  applicants: Applicant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  location: string;
  type: JobType;
  salary: string;
  description: string;
  category: string;
  experience: string;
  deadline: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

// ─── Company — manage own jobs ────────────────────────────────────────────────

/** Create a new job posting (COMPANY) */
export const apiCreateJob = async (data: CreateJobPayload): Promise<Job> => {
  const res = await axiosInstance.post('/jobs', data);
  return res.data;
};

/** Update an existing job posting (COMPANY) */
export const apiUpdateJob = async (
  jobId: string,
  data: UpdateJobPayload,
): Promise<Job> => {
  const res = await axiosInstance.patch(`/jobs/${jobId}`, data);
  return res.data;
};

/** Delete a job posting (COMPANY) */
export const apiDeleteJob = async (jobId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete(`/jobs/${jobId}`);
  return res.data;
};

/** Get all jobs posted by the authenticated company (COMPANY) */
export const apiGetMyJobs = async (): Promise<Job[]> => {
  const res = await axiosInstance.get('/jobs/mine');
  return res.data;
};

/** Get all applicants for a specific job (COMPANY) */
export const apiGetJobApplicants = async (jobId: string): Promise<Applicant[]> => {
  const res = await axiosInstance.get(`/jobs/${jobId}/applicants`);
  return res.data;
};

/** Update an applicant's status (COMPANY) */
export const apiUpdateApplicantStatus = async (
  jobId: string,
  applicantUserId: string,
  status: ApplicantStatus,
): Promise<{ message: string }> => {
  const res = await axiosInstance.patch(
    `/jobs/${jobId}/applicants/${applicantUserId}/status`,
    { status },
  );
  return res.data;
};

// ─── Student — apply to jobs ──────────────────────────────────────────────────

/** Apply to a job (STUDENT) */
export const apiApplyToJob = async (jobId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.post(`/jobs/${jobId}/apply`);
  return res.data;
};

// ─── Shared — read job data ───────────────────────────────────────────────────

/** Get a single job by ID (any authenticated user) */
export const apiGetJobById = async (jobId: string): Promise<Job> => {
  const res = await axiosInstance.get(`/jobs/${jobId}`);
  return res.data;
};

// ─── Admin ────────────────────────────────────────────────────────────────────

/** Get all jobs for the student job board (any authenticated user) */
export const apiGetAllJobs = async (): Promise<Job[]> => {
  const res = await axiosInstance.get('/jobs/all');
  return res.data;
};

/** Get all jobs in the system (ADMIN) */
export const apiAdminGetAllJobs = async (): Promise<Job[]> => {
  const res = await axiosInstance.get('/jobs');
  return res.data;
};
