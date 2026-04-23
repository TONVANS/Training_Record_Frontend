import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

/**
 * Master Architect's Note:
 * 1. ใช้ Environment Variable ให้ครบถ้วน
 * 2. แยกการจัดการระหว่าง Client-side และ Server-side
 * 3. ปรับปรุงการดึง Token ให้ปลอดภัยและแม่นยำขึ้น
 */

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // ฝั่ง Client: วิ่งไปที่ Nginx Proxy หรือ API URL ที่ตั้งไว้ใน .env
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // ฝั่ง Server (SSR/Docker): ต้องวิ่งหาชื่อ Service ใน Docker network 
  // หรือใช้ Internal URL ที่เข้าถึงได้โดยตรง
  return process.env.INTERNAL_API_URL || process.env.BACKEND_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // ป้องกัน Request ค้างนานเกินไป
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("auth-storage");
        if (raw) {
          const parsed = JSON.parse(raw);
          // รองรับทั้งแบบมี .state (Zustand) หรือแบบ JSON ปกติ
          const state = parsed?.state || parsed;
          const token = state?.token;
          const tokenExpiry = state?.tokenExpiry;

          // ตรวจสอบ Token Expired เบื้องต้นที่ฝั่ง Client
          if (tokenExpiry && Date.now() > tokenExpiry) {
            localStorage.removeItem("auth-storage");
            return Promise.reject(new Error("Session expired, please login again."));
          }

          if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      } catch (err) {
        console.error("Axios Auth Interceptor Error:", err);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor (Handling 500 and 401 errors)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // จัดการ Error กลางที่นี่ เช่นถ้าได้ 401 ให้ Logout อัตโนมัติ
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
        // แก้ไขให้ redirect ไปยัง path ที่มี basePath (/app1) เพื่อป้องกัน 404
        window.location.href = "/app1/login";
      }
    }
    
    // ปรับโครงสร้าง Error ให้ Frontend ใช้งานง่ายขึ้น
    const message = (error.response?.data as any)?.message || "ເກີດຂໍ້ຜິດພາດພາຍໃນລະບົບ (Internal Server Error)";
    return Promise.reject({ ...error, message });
  }
);

export default api;