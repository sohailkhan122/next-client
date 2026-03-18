// lib/studentDetailApi.ts
import axiosInstance from './axiosInstance';

export interface StudentProject {
  title: string;
  description: string;
  technologies?: string[];
  projectUrl?: string;
}

export interface StudentDetail {
  _id?: string;
  userId?: string | Record<string, unknown>;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDetailPayload {
  requiredJob?: string;
  requiredExperience?: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  experience?: string;
  skills: string[];
  projects?: StudentProject[];
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  linkedIn?: string;
}

export const apiUpsertStudentDetail = async (
  data: StudentDetailPayload
): Promise<StudentDetail> => {
  const res = await axiosInstance.post("/student-detail", data);
  return res.data;
};

export const apiGetMyStudentDetail = async (): Promise<StudentDetail> => {
  const res = await axiosInstance.get("/student-detail/me");
  return res.data;
};

export const apiGetAllStudentDetails = async (): Promise<StudentDetail[]> => {
  const res = await axiosInstance.get("/student-detail");
  return res.data;
};

export const apiGetStudentDetailByUserId = async (userId: string): Promise<StudentDetail> => {
  const res = await axiosInstance.get(`/student-detail/${userId}`);
  return res.data;
};