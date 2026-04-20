// API Service Layer for Hotel Management System

const API_BASE = '/api';

// Token storage (in-memory for security)
let authToken: string | null = null;

// Set auth token
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Get auth token
export const getAuthToken = () => authToken;

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - unauthorized
    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('UNAUTHORIZED');
    }

    // Handle 403 - forbidden
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }

    // Handle 404
    if (response.status === 404) {
      throw new Error('NOT_FOUND');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail;
      // Handle FastAPI validation errors (array of objects)
      if (Array.isArray(detail)) {
        const messages = detail.map((e: any) => e.msg || e.message).filter(Boolean);
        throw new Error(messages.join(', ') || 'SERVER_ERROR');
      }
      // Handle string detail
      if (typeof detail === 'string') {
        throw new Error(detail);
      }
      throw new Error('SERVER_ERROR');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
}

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: 'customer' | 'staff' | 'admin';
  created_at: string;
}

export interface StaffCreate {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface StaffMember {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  size: string | null;
  occupancy: string | null;
  amenities: string[];
  status: 'available' | 'unavailable';
  featured: boolean;
  room_type: 'luxury' | 'suite' | 'business' | 'standard';
}

export interface BookingUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: 'customer' | 'staff' | 'admin';
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
  package_name: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_at: string;
  room?: Room;
  user?: BookingUser;
}

export interface Notification {
  id: number;
  type: 'booking_created' | 'booking_cancelled' | 'checked_in' | 'checked_out';
  message: string;
  booking_id: number | null;
  user_id: number;
  read: boolean;
  created_at: string;
}

export interface CheckInOutResponse {
  id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  checked_in_at: string | null;
  checked_out_at: string | null;
  message: string;
}

export interface AvailabilityResponse {
  rooms: Room[];
  check_in: string;
  check_out: string;
}

export interface DashboardStats {
  total_bookings: number;
  active_bookings: number;
  pending_bookings: number;
  total_users: number;
  total_rooms: number;
  total_revenue: number;
}

// Admin types for multilingual room management
export interface RoomTranslationData {
  language: string;
  name: string;
  description: string;
}

export interface AmenityTranslationData {
  language: string;
  name: string;
}

export interface AmenityAdminData {
  id: number;
  translations: AmenityTranslationData[];
}

export interface RoomAdminData {
  id: number;
  price: number;
  image_url: string | null;
  size: string | null;
  occupancy: string | null;
  status: 'available' | 'unavailable';
  featured: boolean;
  room_type: 'luxury' | 'suite' | 'business' | 'standard';
  translations: RoomTranslationData[];
  amenities: AmenityAdminData[];
}

export interface RoomCreatePayload {
  price: number;
  image_url?: string;
  size?: string;
  occupancy?: string;
  status: 'available' | 'unavailable';
  featured: boolean;
  room_type: 'luxury' | 'suite' | 'business' | 'standard';
  translations: RoomTranslationData[];
  amenities: { translations: AmenityTranslationData[] }[];
}

export interface RoomUpdatePayload {
  price?: number;
  image_url?: string;
  size?: string;
  occupancy?: string;
  status?: 'available' | 'unavailable';
  featured?: boolean;
  room_type?: 'luxury' | 'suite' | 'business' | 'standard';
  translations?: RoomTranslationData[];
  amenities?: { translations: AmenityTranslationData[] }[];
}

// Users API
export const usersAPI = {
  updateProfile: (data: { name: string; phone: string }) =>
    fetchAPI<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    fetchAPI<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchAPI<User>('/auth/me'),
};

// Rooms API
export const roomsAPI = {
  list: (params?: { status?: string; featured?: boolean; lang?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.featured !== undefined) searchParams.append('featured', String(params.featured));
    if (params?.lang) searchParams.append('lang', params.lang);
    const query = searchParams.toString();
    return fetchAPI<Room[]>(`/rooms/${query ? `?${query}` : ''}`);
  },

  getById: (id: number, lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Room>(`/rooms/${id}${query}`);
  },

  getByIdAdmin: (id: number) => fetchAPI<RoomAdminData>(`/rooms/${id}/admin`),

  create: (data: RoomCreatePayload) =>
    fetchAPI<RoomAdminData>('/rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: RoomUpdatePayload) =>
    fetchAPI<RoomAdminData>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchAPI<void>(`/rooms/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsAPI = {
  my: (lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Booking[]>(`/bookings/my${query}`);
  },

  create: (data: { room_id: number; check_in: string; check_out: string; package_name?: string }, lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Booking>(`/bookings/${query}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: (id: number, lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Booking>(`/bookings/${id}${query}`);
  },

  cancel: (id: number) =>
    fetchAPI<void>(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  checkIn: (id: number) =>
    fetchAPI<CheckInOutResponse>(`/bookings/${id}/check-in`, {
      method: 'POST',
    }),

  checkOut: (id: number) =>
    fetchAPI<CheckInOutResponse>(`/bookings/${id}/check-out`, {
      method: 'POST',
    }),
};

// Availability API
export const availabilityAPI = {
  check: (checkIn: string, checkOut: string, lang?: string) => {
    const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
    if (lang) params.append('lang', lang);
    return fetchAPI<AvailabilityResponse>(`/rooms/availability?${params.toString()}`);
  },
};

// Notifications API
export const notificationsAPI = {
  list: () => fetchAPI<Notification[]>('/notifications/'),

  markRead: (id: number) =>
    fetchAPI<Notification>(`/notifications/${id}/read`, {
      method: 'POST',
    }),

  markAllRead: () =>
    fetchAPI<{ message: string }>('/notifications/read-all', {
      method: 'POST',
    }),
};

// Admin API
export const adminAPI = {
  stats: () => fetchAPI<DashboardStats>('/admin/stats'),

  bookings: (lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Booking[]>(`/admin/bookings${query}`);
  },

  updateBooking: (id: number, data: { status: string }, lang?: string) => {
    const query = lang ? `?lang=${lang}` : '';
    return fetchAPI<Booking>(`/admin/bookings/${id}${query}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  users: () => fetchAPI<User[]>('/admin/users'),

  // Staff management (admin only)
  listStaff: () => fetchAPI<StaffMember[]>('/admin/staff'),
  createStaff: (data: StaffCreate) => fetchAPI<StaffMember>('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteStaff: (id: number) => fetchAPI<void>(`/admin/staff/${id}`, {
    method: 'DELETE',
  }),
};

// Error message helper
export const getErrorMessage = (error: Error): string => {
  switch (error.message) {
    case 'UNAUTHORIZED':
      return '登入已過期，請重新登入';
    case 'FORBIDDEN':
      return '沒有權限存取此資源';
    case 'NOT_FOUND':
      return '找不到請求的資源';
    case 'NETWORK_ERROR':
      return '無法連線至伺服器，請檢查網路連線';
    case 'SERVER_ERROR':
      return '伺服器錯誤，請稍後再試';
    default:
      return error.message || '發生未知錯誤';
  }
};