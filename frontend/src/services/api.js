import axios from "axios";
import i18n from "../i18n";

const envBaseUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const isProdBuild = Boolean(import.meta.env.PROD);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const runtimeHost =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "127.0.0.1";
const defaultDevBaseUrl = "http://127.0.0.1:8000";
const devBaseUrlCandidates = [];
let resolvedBaseUrl = isProdBuild ? envBaseUrl : "";
let resolvingBaseUrlPromise = null;

function addCandidate(value) {
  const normalized = (value || "").trim().replace(/\/+$/, "");
  if (!normalized || devBaseUrlCandidates.includes(normalized)) {
    return;
  }
  devBaseUrlCandidates.push(normalized);
}

addCandidate(envBaseUrl);

if (runtimeHost && !LOCAL_HOSTS.has(runtimeHost.toLowerCase())) {
  addCandidate(`http://${runtimeHost}:8000`);
}

addCandidate(defaultDevBaseUrl);
addCandidate("http://localhost:8000");

if (runtimeHost && LOCAL_HOSTS.has(runtimeHost.toLowerCase())) {
  addCandidate(`http://${runtimeHost}:8000`);
}

if (isProdBuild && !envBaseUrl) {
  throw new Error("VITE_API_URL is required for production builds.");
}

async function isBaseUrlReachable(baseUrl) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function resolveBaseUrl() {
  if (resolvedBaseUrl) {
    return resolvedBaseUrl;
  }

  if (isProdBuild) {
    resolvedBaseUrl = envBaseUrl;
    return resolvedBaseUrl;
  }

  if (!resolvingBaseUrlPromise) {
    resolvingBaseUrlPromise = (async () => {
      for (const candidate of devBaseUrlCandidates) {
        if (await isBaseUrlReachable(candidate)) {
          resolvedBaseUrl = candidate;
          return candidate;
        }
      }

      resolvedBaseUrl = devBaseUrlCandidates[0] || defaultDevBaseUrl;
      return resolvedBaseUrl;
    })();
  }

  try {
    return await resolvingBaseUrlPromise;
  } finally {
    resolvingBaseUrlPromise = null;
  }
}

const DEVICE_ID_KEY = "device_id";

function getDeviceId() {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const next =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return "unknown-device";
  }
}

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

let refreshPromise = null;

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
    config.baseURL = config.baseURL || (await resolveBaseUrl());
    config.headers["X-Language"] = lang;
    config.headers["X-Device-ID"] = getDeviceId();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error.response || error.message);

    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      (!error.response && !!error.request);

    if (isNetworkError && !isProdBuild && !originalRequest._baseUrlRetry) {
      originalRequest._baseUrlRetry = true;
      resolvedBaseUrl = "";
      originalRequest.baseURL = await resolveBaseUrl();
      return api(originalRequest);
    }

    const shouldTryRefresh =
      status === 401 &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/refresh");

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        const baseUrl = await resolveBaseUrl();
        refreshPromise = axios.post(`${baseUrl}/auth/refresh`, {
          refresh_token: refreshToken,
        });
      }

      const refreshResponse = await refreshPromise;
      refreshPromise = null;

      const newToken = refreshResponse.data?.access_token;
      if (!newToken) {
        return Promise.reject(error);
      }

      localStorage.setItem("token", newToken);
      if (refreshResponse.data?.role) {
        localStorage.setItem("role", refreshResponse.data.role);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChanged"));
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);

export const getStations = async () => {
  const res = await api.get("/stations/");
  return res.data;
};

export const getNearbyStations = async (lat, lon) => {
  const res = await api.get("/stations/nearby", {
    params: { lat, lon },
  });
  return res.data;
};

export default api;
