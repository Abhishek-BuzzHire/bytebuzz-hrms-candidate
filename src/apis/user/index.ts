import axios from "axios";
import { API_BASE_URL } from "./api-config";
import Cookies from "js-cookie";
import { Skill } from "./route";
import { get } from "http";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Request interceptor — har request mein token lagao
api.interceptors.request.use((config) => {
    const token = Cookies.get("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Response interceptor — 401 pe refresh token try karo
let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                Cookies.remove("access");
                Cookies.remove("refresh");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            isRefreshing = true;

            try {
                const refresh = Cookies.get("refresh");
                if (!refresh) throw new Error("No refresh token");

                // ✅ Refresh token se naya access token lo
                const res = await axios.post(`${API_BASE_URL}/account/token/refresh/`, { refresh });
                const newAccess = res.data.access;

                Cookies.set("access", newAccess, {
                    expires: 7,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Lax",
                });

                // Original request retry karo naye token se
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                isRefreshing = false;
                return api(originalRequest);
            } catch {
                // Refresh bhi fail — logout karo
                isRefreshing = false;
                Cookies.remove("access");
                Cookies.remove("refresh");
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

const ACCOUNT_PATH = '/account';
const CANDIDATE_PATH = '/api/candidate';


export const accountApi = {
    async signup(data: any) {
        const res = await api.post(`${ACCOUNT_PATH}/signup/`, data);
        return res.data;
    },
    async login(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/login/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to login");
        }
    },
    async verifyEmail(token: string) {
        try {
            const res = await api.get(`${ACCOUNT_PATH}/verify-email/`, { params: { token } });
            return res.data;
        } catch (error) {
            throw new Error("Failed to verify email");
        }
    },
    async resendVerification(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/resend-verification/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to resend verification");
        }
    },
    async forgotPassword(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/forgot-password/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to send forgot password OTP");
        }
    },
    async verifyOTP(data: { email: string, otp: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/verify-otp/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to verify OTP");
        }
    },
    async resetPassword(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/reset-password/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to reset password");
        }
    },
    async changePassword(data: { current_password: string; new_password: string; confirm_password: string }) {
        const res = await api.post(`${ACCOUNT_PATH}/change-password/`, {
            old_password: data.current_password,
            new_password: data.new_password,
            confirm_new_password: data.confirm_password,
        });
        return res.data;
    },
};

export const fetchLogin = accountApi.login;
export const fetchSignup = accountApi.signup;
export const fetchForgotPassword = accountApi.forgotPassword;
export const fetchVerifyOTP = accountApi.verifyOTP;
export const fetchResetPassword = accountApi.resetPassword;

export type SignupPayload = {
    email: string;
    password: string;
    confirm_password: string;
};

export const candidateApi = {
    async getProfile() {
        return (await api.get(`${CANDIDATE_PATH}/profile/`)).data;
    },
    async updateProfile(data: any) {
        return (await api.put(`${CANDIDATE_PATH}/profile/`, data)).data;
    },
    async getBasicInfo() {
        return (await api.get(`${CANDIDATE_PATH}/profile/basic/`)).data;
    },
    async getEducations() {
        return (await api.get(`${CANDIDATE_PATH}/education/`)).data;
    },
    async createEducation(data: any) {
        return (await api.post(`${CANDIDATE_PATH}/education/`, data)).data;
    },
    async updateEducation(id: any, data: any) {
        return (await api.put(`${CANDIDATE_PATH}/education/${id}/`, data)).data;
    },
    async deleteEducation(id: any) {
        return (await api.delete(`${CANDIDATE_PATH}/education/${id}/`)).data;
    },
    async getExperiences() {
        return (await api.get(`${CANDIDATE_PATH}/experience/`)).data;
    },
    async createExperience(data: any) {
        return (await api.post(`${CANDIDATE_PATH}/experience/`, data)).data;
    },
    async updateExperience(id: any, data: any) {
        return (await api.put(`${CANDIDATE_PATH}/experience/${id}/`, data)).data;
    },
    async deleteExperience(id: any) {
        return (await api.delete(`${CANDIDATE_PATH}/experience/${id}/`)).data;
    },
    async getSkills() {
        return (await api.get(`${CANDIDATE_PATH}/skills/`)).data;
    },
    async addSkill(data: any) {
        return (await api.post(`${CANDIDATE_PATH}/skills/`, data)).data;
    },
    async updateSkill(id: any, data: any) {
        return (await api.put(`${CANDIDATE_PATH}/skills/${id}/`, data)).data;
    },
    async deleteSkill(id: any) {
        return (await api.delete(`${CANDIDATE_PATH}/skills/${id}/`)).data;
    },
    async searchSkills(query: string): Promise<Skill[]> {
        const res = await api.get(`/api/skills/?q=${encodeURIComponent(query)}`);
        return res.data.map((s: { skill_id: number; skill_name: string }) => ({
            id: s.skill_id,
            name: s.skill_name,
        }));
    },
    async getResumes() {
        return (await api.get(`${CANDIDATE_PATH}/resume/`)).data;
    },
    async uploadResume(data: FormData) {
        return (await api.post(`${CANDIDATE_PATH}/resume/`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        })).data;
    },
    async setResumeActive(id: any) {
        return (await api.post(`${CANDIDATE_PATH}/resume/${id}/set-active/`)).data;
    },
    async deleteResume() {
        return (await api.delete(`${CANDIDATE_PATH}/resume/`)).data;
    },
    async searchCompanies(query: string) {
        return (await api.get(`${CANDIDATE_PATH}/companies/search/`, { params: { q: query } })).data;
    },
    async searchLocations(query: string) {
        return (await api.get(`${CANDIDATE_PATH}/locations/search/`, { params: { q: query } })).data;
    },
    async getCountries(query: string = '') {
        return (await api.get(`api/countries`, { params: { q: query } })).data;
    },
    async getStates(query: string = '') {
        return (await api.get(`api/states/search`, { params: { q: query } })).data;
    },
    async getCities(query: string = '') {
        return (await api.get(`api/city-search`, { params: { q: query } })).data;
    }
};

export const jobsApi = {
    async getJobs(params?: { location?: string; experience?: number; min_experience?: number }) {
        return (await api.get(`${CANDIDATE_PATH}/jobs/`, { params })).data;
    },
    async getJobDetail(pk: number) {
        return (await api.get(`${CANDIDATE_PATH}/jobs/${pk}/`)).data;
    },
    async saveJob(pk: number) {
        return (await api.post(`api/candidate/jobs/${pk}/save/`)).data;
    },
    async applyJob(pk: number, data?: any) {
        return (await api.post(`${CANDIDATE_PATH}/jobs/${pk}/apply/`, data)).data;
    },
    async getSavedJobs() {
        return (await api.get(`api/candidate/saved-jobs/`)).data;
    },
    async getApplications() {
        return (await api.get(`${CANDIDATE_PATH}/applications/`)).data;
    },
    async getApplicationDetail(pk: number) {
        return (await api.get(`${CANDIDATE_PATH}/applications/${pk}/`)).data;
    }
    
};