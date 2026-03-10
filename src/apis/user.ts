import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}account/`,
});

// Attach access token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* =========================
TYPES
========================= */

export interface SignupPayload {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_new_password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

/* =========================
SIGNUP
========================= */

export const fetchSignup = async (payload: SignupPayload) => {
  const res = await api.post("signup/", payload);
  return res.data;
};

/* =========================
LOGIN
========================= */

export const fetchLogin = async (payload: LoginPayload) => {
  const res = await api.post("login/", payload);
  return res.data;
};

/* =========================
LOGOUT
========================= */

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

/* =========================
FORGOT PASSWORD
========================= */

export const fetchForgotPassword = async (payload: ForgotPasswordPayload) => {
  const res = await api.post("forgot-password/", payload);
  return res.data;
};

/* =========================
RESET PASSWORD
========================= */

export const fetchResetPassword = async (payload: ResetPasswordPayload) => {
  console.log("Reset payload:", payload); // ✅ debug log
  const res = await api.post("reset-password/", {  // ✅ fixed endpoint + payload
    email: payload.email,
    otp: payload.otp,
    new_password: payload.new_password,
    confirm_new_password: payload.confirm_new_password,
  });
  return res.data;
};

/* =========================
VERIFY OTP
========================= */

export const fetchVerifyOtp = async (payload: VerifyOtpPayload) => {
  const res = await api.post("verify-otp/", payload);
  return res.data;
};

export default api;