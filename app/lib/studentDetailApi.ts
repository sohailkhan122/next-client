// lib/studentDetailApi.ts
import axiosInstance from './axiosInstance';

export interface StudentDetailPayload {
  phone: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  skills: string[];
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: Number;
  linkedIn?: string;
}

export const apiUpsertStudentDetail = async (
  data: StudentDetailPayload
) => {
  const res = await axiosInstance.post("/student-detail", data);
  return res.data;
};

export const apiGetMyStudentDetail = async () => {
  const res = await axiosInstance.get("/student-detail/me");
  return res.data;
};

export const apiGetAllStudentDetails = async () => {
  const res = await axiosInstance.get("/student-detail");
  return res.data;
};

export const apiGetStudentDetailByUserId = async (userId: string) => {
  const res = await axiosInstance.get(`/student-detail/${userId}`);
  return res.data;
};