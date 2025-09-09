export interface College {
  id: number;
  name: string;
  domain: string;
  is_active: boolean;
  window_start: string;
  window_end: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
  date_joined: string;
  college?: College;
}

export interface TokenData {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AccessCheckResponse {
  can_access: boolean;
  reason?: string;
  message: string;
  college_name?: string;
  college_domain?: string;
  window_start?: string;
  window_end?: string;
  time_remaining_seconds?: number;
}

export interface CollegeStatusResponse {
  has_college: boolean;
  message?: string;
  college?: {
    id: number;
    name: string;
    domain: string;
    is_active: boolean;
    window_start: string;
    window_end: string;
    currently_in_window: boolean;
    can_access: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  tokenData: TokenData | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  errorData?: unknown; // For structured error responses
}
