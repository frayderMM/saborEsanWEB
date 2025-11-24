/// <reference types="vite/client" />
// API Configuration and service
// Use /api proxy en desarrollo, URL completa en producción
const BASE_URL = import.meta.env.MODE === 'development' ? '/api' : 'https://api.saboresan.lat';

export const apiClient = {
  baseURL: BASE_URL,
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Try to parse JSON error body, otherwise use text
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = await response.text().catch(() => null);
        }
        const errMsg = (errorBody && (errorBody.message || JSON.stringify(errorBody))) || `API Error: ${response.status}`;
        const fullMsg = `API Error ${response.status}: ${errMsg}`;
        console.error('API response error body:', errorBody);
        throw new Error(fullMsg);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(username: string, password: string) {
    const url = `${BASE_URL}/auth/register`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = await response.text().catch(() => null);
        }

        // Manejar errores específicos
        if (response.status === 400) {
          throw new Error('El usuario ya existe');
        }
        if (response.status === 422) {
          const errMsg = errorBody?.detail || 'Errores de validación en los datos';
          throw new Error(errMsg);
        }
        const errMsg = errorBody?.message || errorBody?.detail || `Error ${response.status}`;
        throw new Error(errMsg);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor');
      }
      throw error;
    }
  },

  // Profile/Usuario endpoints
  async createProfile(profileData: {
    user_id: number;
    nombre: string;
    apellido: string;
    email: string;
    foto_perfil: string | null;
    genero: "masculino" | "femenino" | "otro";
    fecha_nacimiento: string;
    telefono: string;
    estado: "activo" | "inactivo";
  }) {
    const url = `${BASE_URL}/usuario/`;
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = await response.text().catch(() => null);
        }

        // Manejar errores específicos
        if (response.status === 400) {
          throw new Error('El email ya está registrado');
        }
        if (response.status === 422) {
          const errMsg = errorBody?.detail || 'Error en los campos del perfil';
          throw new Error(errMsg);
        }
        if (response.status === 500) {
          throw new Error('Error interno del servidor');
        }
        const errMsg = errorBody?.message || errorBody?.detail || `Error ${response.status}`;
        throw new Error(errMsg);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor');
      }
      throw error;
    }
  },

  async getProfile(userId: number) {
    return this.request(`/usuario/${userId}`, {
      method: 'GET',
    });
  },

  async updateProfile(userId: number, profileData: {
    nombre?: string;
    apellido?: string;
    email?: string;
    foto_perfil?: string;
    genero?: "M" | "F" | "O";
    fecha_nacimiento?: string;
    telefono?: string;
    estado?: string;
  }) {
    return this.request(`/usuario/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async deleteProfile(userId: number) {
    return this.request(`/usuario/${userId}`, {
      method: 'DELETE',
    });
  },

  // Food Classifier endpoints
  async predictFood(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${BASE_URL}/predict`;
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Predict Food Error:', error);
      throw error;
    }
  },

  async predictFoodFromUrl(url: string) {
    return this.request('/predict_url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // Upload endpoints
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${BASE_URL}/upload/profile-image`;
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Upload Profile Image Error:', error);
      throw error;
    }
  },

  // MealHistory endpoints
  async createMeal(mealData: {
    usuario_id: number;
    meal_name: string;
    method: string;
    confidence?: number;
    calories?: number;
    proteins?: number;
    fats?: number;
    carbs?: number;
    image_url?: string;
  }) {
    return this.request('/meal-history/', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  async uploadMeal(formData: FormData) {
    const url = `${BASE_URL}/meal-history/upload`;
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorBody: any = null;
        try { errorBody = await response.json(); } catch (e) { errorBody = await response.text().catch(() => null); }
        const errMsg = (errorBody && (errorBody.message || JSON.stringify(errorBody))) || `API Error: ${response.status}`;
        throw new Error(errMsg);
      }

      return response.json();
    } catch (error) {
      console.error('Upload Meal Error:', error);
      throw error;
    }
  },

  async getMealHistory(usuarioId: number) {
    return this.request(`/meal-history/${usuarioId}`, { method: 'GET' });
  },

  async getLatestMeal(usuarioId: number) {
    return this.request(`/meal-history/latest-by-user/${usuarioId}`, { method: 'GET' });
  },

  // Dashboard / Statistics endpoints
  async getAverageNutrients(usuarioId: number) {
    return this.request(`/dashboard/average-nutrients/${usuarioId}`, { method: 'GET' });
  },

  async getMealCount(usuarioId: number) {
    return this.request(`/dashboard/meal-count/${usuarioId}`, { method: 'GET' });
  },

  async getTopMeals(usuarioId: number) {
    return this.request(`/dashboard/top-meals/${usuarioId}`, { method: 'GET' });
  },

  async getNutrientRatio(usuarioId: number) {
    return this.request(`/dashboard/nutrient-ratio/${usuarioId}`, { method: 'GET' });
  },

  async getWeeklyCalories(usuarioId: number) {
    return this.request(`/dashboard/weekly-calories/${usuarioId}`, { method: 'GET' });
  },

  async getGlobalStats() {
    return this.request(`/dashboard/global-stats`, { method: 'GET' });
  },

  // Add more endpoints as needed
};

// Helper to store token
export const setAuthToken = (token: string) => {
  localStorage.setItem('access_token', token);
};

// Helper to remove token
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

// Helper to get token
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export default apiClient;
