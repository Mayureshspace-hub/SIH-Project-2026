/**
 * Procurement Centre Authentication Service
 * Secure credential-based authentication for Procurement Centre operators.
 * Keeps operator credentials separate from Farmer Google Auth while sharing
 * the same session architecture.
 */

export interface OperatorCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface OperatorAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: 'OPERATOR';
  };
  operator: {
    id: string;
    userId: string;
    centreId: string;
    badgeNo: string;
    active: boolean;
  };
  centreName?: string;
}

const OPERATOR_TOKEN_KEY = 'kisan_operator_token';
const OPERATOR_SESSION_KEY = 'kisan_operator_session';

export const procurementAuth = {
  /**
   * Authenticate Procurement Centre operator using credentials against backend API
   */
  async login(credentials: OperatorCredentials): Promise<OperatorAuthResponse> {
    const { usernameOrEmail, password } = credentials;
    if (!usernameOrEmail || !password) {
      throw new Error('Please enter both Email/Username and Password');
    }

    // Call backend API /api/auth/login with role: 'OPERATOR'
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: usernameOrEmail.trim(),
        password: password.trim(),
        role: 'OPERATOR',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid Procurement Centre credentials');
    }

    if (data.user?.role !== 'OPERATOR') {
      throw new Error('Access denied. This portal is restricted to Procurement Centre accounts.');
    }

    // Store in browser storage for session continuity
    localStorage.setItem(OPERATOR_TOKEN_KEY, data.token);
    localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(data));
    localStorage.setItem('kisan_role', 'OPERATOR');
    localStorage.setItem('kisansetu_token', data.token);

    return data;
  },

  /**
   * Get currently active procurement centre operator session
   */
  getCurrentOperator(): OperatorAuthResponse | null {
    try {
      const stored = localStorage.getItem(OPERATOR_SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Sign out operator and clear credentials
   */
  logout() {
    localStorage.removeItem(OPERATOR_TOKEN_KEY);
    localStorage.removeItem(OPERATOR_SESSION_KEY);
    if (localStorage.getItem('kisan_role') === 'OPERATOR') {
      localStorage.removeItem('kisan_role');
      localStorage.removeItem('kisansetu_token');
    }
  },

  /**
   * Check if an active Procurement Centre session exists
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(OPERATOR_TOKEN_KEY);
  },
};
