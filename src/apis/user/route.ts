import axios from "axios";
import { API_BASE_URL } from "./api-config";
import Cookies from "js-cookie";
export type Skill={ id: number; name: string }

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
const CANDIDATE_PATH = '/api/candidates';

// ✅ Helper — real backend error nikalta hai
const getError = (error: any, fallback: string) => {
    const data = error?.response?.data;
    if (data) throw new Error(JSON.stringify(data));
    throw new Error(error?.message || fallback);
};

export const accountApi = {
    async signup(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/signup/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to signup");
        }
    },
    async login(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/login/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to login");
        }
    },
    async verifyEmail(token: string) {
        try {
            const res = await api.get(`${ACCOUNT_PATH}/verify-email/`, { params: { token } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to verify email");
        }
    },
    async resendVerification(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/resend-verification/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to resend verification");
        }
    },
    async forgotPassword(data: { email: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/forgot-password/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to send forgot password OTP");
        }
    },
    async verifyOTP(data: { email: string, otp: string }) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/verify-otp/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to verify OTP");
        }
    },
    async resetPassword(data: any) {
        try {
            const res = await api.post(`${ACCOUNT_PATH}/reset-password/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to reset password");
        }
    }
};

export const candidateApi = {
    // ── Profile ───────────────────────────────
    async getProfile() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/profile/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch candidate profile");
        }
    },
    async updateProfile(data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/profile/`, data);
            return res.data;
        } catch (error: any) {
            // ✅ Real backend error console mein dikhega ab
            getError(error, "Failed to update candidate profile");
        }
    },

    // ── Education ───────────────────────────────
    async getEducations() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/education/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch education details");
        }
    },
    async createEducation(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/education/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to create education record");
        }
    },
    async updateEducation(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/education/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update education record");
        }
    },
    async deleteEducation(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/education/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete education record");
        }
    },

    // ── Experience ───────────────────────────────
    async getExperiences() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/experience/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch experience details");
        }
    },
    async createExperience(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/experience/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to create experience record");
        }
    },
    async updateExperience(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/experience/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update experience record");
        }
    },
    async deleteExperience(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/experience/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete experience record");
        }
    },

    // ── Skills ───────────────────────────────────
    async searchSkills(query: string): Promise<Skill[]> {
        const res = await api.get(`/api/skills/?q=${encodeURIComponent(query)}`);
        return res.data.map((s: { skill_id: number; skill_name: string }) => ({
            id: s.skill_id,
            name: s.skill_name,
        }));
    },
    async getSkills() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/skills/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch skills");
        }
    },
    async addSkill(data: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/skills/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to add skill");
        }
    },
    async updateSkill(id: number | string, data: any) {
        try {
            const res = await api.put(`${CANDIDATE_PATH}/skills/${id}/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to update skill");
        }
    },
    async deleteSkill(id: number | string) {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/skills/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete skill");
        }
    },


    //new skill edition
     async skillsMenu(id: number | string) {
        try {
            const res = await api.get(`api/jobs/jobs/skills/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete skill");
        }
    },
    async skills(id: number | string) {
        try {
            const res = await api.post(`api/jobs/jobs/skills/${id}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete skill");
        }
    },

    // ── Resume ───────────────────────────────────
    async getResumes() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/resume/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch resumes");
        }
    },
    async uploadResume(data: FormData) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/resume/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to upload resume");
        }
    },
    async setResumeActive(id: number | string) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/resume/${id}/set-active/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to set resume as active");
        }
    },
    async deleteResume() {
        try {
            const res = await api.delete(`${CANDIDATE_PATH}/resume/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to delete resume");
        }
    },

    // ── Company ──────────────────────────────────
    async searchCompanies(query: string) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/companies/search/`, { params: { q: query } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to search companies");
        }
    },

    // ── Location ─────────────────────────────────
    async searchLocations(query: string) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/locations/search/`, { params: { q: query } });
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to search locations");
        }
    },
};

export const jobsApi = {
    async getJobs() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/jobs/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch jobs");
        }
    },
    async getJobDetail(pk: number) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/jobs/${pk}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch job detail");
        }
    },
    async saveJob(pk: number) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/jobs/${pk}/save/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to save job");
        }
    },
    async applyJob(pk: number, data?: any) {
        try {
            const res = await api.post(`${CANDIDATE_PATH}/jobs/${pk}/apply/`, data);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to apply for job");
        }
    },
    async getSavedJobs() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/saved-jobs/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch saved jobs");
        }
    },
    async getApplications() {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/applications/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch applications");
        }
    },
    async getApplicationDetail(pk: number) {
        try {
            const res = await api.get(`${CANDIDATE_PATH}/applications/${pk}/`);
            return res.data;
        } catch (error: any) {
            getError(error, "Failed to fetch application detail");
        }
    },
};