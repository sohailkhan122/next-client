// lib/companyDetailApi.ts
import axiosInstance from './axiosInstance';

export interface CompanyDetailPayload {
   companyName: string;
    industry: string;
    size: string;
    foundedYear: string;
    website?: string;
    location: string;
    description: string;
    contactPhone: string;
    contactEmail: string;
    linkedin?: string;
}

export const apiUpsertCompanyDetail = async (
  data: CompanyDetailPayload
) => {
  const res = await axiosInstance.post("/company-detail", data);
  return res.data;
};

export const apiGetMyCompanyDetail = async () => {
  const res = await axiosInstance.get("/company-detail/me");
  return res.data;
};

export const apiGetAllCompanyDetails = async () => {
  const res = await axiosInstance.get("/company-detail");
  return res.data;
};

export const apiGetCompanyDetailByUserId = async (userId: string) => {
  const res = await axiosInstance.get(`/company-detail/${userId}`);
  return res.data;
};