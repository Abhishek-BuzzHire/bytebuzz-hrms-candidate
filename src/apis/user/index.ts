import axios from "axios";
import { API_BASE_URL } from "./api-config";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const ACCOUNT_PATH = '/account';
const CANDIDATE_PATH = '/api/candidate';

export const accountApi = {
   /* async signup(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/signup/`, data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to signup");
        }
    },*/
    async signup(data: any) {
    // ✅ try-catch hatao — original error aayega
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
    }
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
    async deleteSkill(id: any) {
        return (await api.delete(`${CANDIDATE_PATH}/skills/${id}/`)).data;
    },
    async searchSkills(query: string) {
        return (await api.get(`${CANDIDATE_PATH}/skills/search/`, { params: { q: query } })).data;
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
    }
};

export const jobsApi = {
    // ✅ Filter params add kiye
    async getJobs(params?: { location?: string; experience?: number }) {
        return (await api.get(`${CANDIDATE_PATH}/jobs/`, { params })).data;
    },
    async getJobDetail(pk: number) {
        return (await api.get(`${CANDIDATE_PATH}/jobs/${pk}/`)).data;
    },
    async saveJob(pk: number) {
        return (await api.post(`${CANDIDATE_PATH}/jobs/${pk}/save/`)).data;
    },
    async applyJob(pk: number, data?: any) {
        return (await api.post(`${CANDIDATE_PATH}/jobs/${pk}/apply/`, data)).data;
    },
    async getSavedJobs() {
        return (await api.get(`${CANDIDATE_PATH}/saved-jobs/`)).data;
    },
    async getApplications() {
        return (await api.get(`${CANDIDATE_PATH}/applications/`)).data;
    },
    async getApplicationDetail(pk: number) {
        return (await api.get(`${CANDIDATE_PATH}/applications/${pk}/`)).data;
    }
};