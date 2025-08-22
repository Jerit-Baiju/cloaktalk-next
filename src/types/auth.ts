export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
  date_joined: string;
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
}
