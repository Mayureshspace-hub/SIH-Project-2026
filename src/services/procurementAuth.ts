/**
 * Procurement Centre Authentication Service
 * Secure credential-based authentication for Procurement Centre operators.
 * Keeps operator credentials separate from Farmer Google Auth while sharing
 * the same session architecture.
 *
 * Fully resilient for Vercel, static hosts, and fullstack deployments:
 * prevents "Unexpected token 'T'" / HTML parse crashes when backend API
 * is unavailable on serverless static hosting.
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

// Predefined authorised centre operators for Vercel / Static deployments
const PREDEFINED_OPERATORS: Record<
  string,
  {
    name: string;
    email: string;
    centreId: string;
    centreName: string;
    badgeNo: string;
    mobile: string;
  }
> = {
  'operator@parseoni.demo': {
    name: 'Vikas Deshpande (Chief Registrar)',
    email: 'operator@parseoni.demo',
    centreId: 'ctr_parseoni',
    centreName: 'Parseoni APMC Sub-Centre',
    badgeNo: 'APMC-NGP-084',
    mobile: '+91 98501 23456',
  },
  operator: {
    name: 'Vikas Deshpande (Chief Registrar)',
    email: 'operator@parseoni.demo',
    centreId: 'ctr_parseoni',
    centreName: 'Parseoni APMC Sub-Centre',
    badgeNo: 'APMC-NGP-084',
    mobile: '+91 98501 23456',
  },
  'operator@ramtek.demo': {
    name: 'Sanjay Thakre',
    email: 'operator@ramtek.demo',
    centreId: 'centre-ramtek',
    centreName: 'Ramtek Grain Mandi',
    badgeNo: 'APMC-NGP-052',
    mobile: '+91 98502 34567',
  },
  'operator@nagpur.demo': {
    name: 'Mahesh Kulkarni',
    email: 'operator@nagpur.demo',
    centreId: 'centre-nagpur',
    centreName: 'Nagpur Central APMC Market',
    badgeNo: 'APMC-NGP-001',
    mobile: '+91 98503 45678',
  },
};

export const procurementAuth = {
  /**
   * Authenticate Procurement Centre operator using credentials against backend API
   * with automatic fallback for Vercel / serverless deployments.
   */
  async login(credentials: OperatorCredentials): Promise<OperatorAuthResponse> {
    const { usernameOrEmail, password } = credentials;
    if (!usernameOrEmail || !password) {
      throw new Error('Please enter both Email/Username and Password');
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = password.trim();

    let authData: OperatorAuthResponse | null = null;

    // 1. Attempt to call backend API /api/auth/login if running in fullstack mode
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanInput,
          password: cleanPassword,
          role: 'OPERATOR',
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      // Only parse as JSON if the server actually returned JSON (avoids "Unexpected token 'T'" from Vercel 404s)
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (res.ok && json.token && json.user) {
          authData = json;
        } else if (!res.ok && json.error) {
          throw new Error(json.error);
        }
      }
    } catch (err: any) {
      // If server explicitly returned an error message in JSON, respect it
      if (
        err?.message &&
        !err.message.includes('Unexpected token') &&
        !err.message.includes('Failed to fetch') &&
        !err.message.includes('JSON')
      ) {
        throw err;
      }
      // Otherwise backend is unavailable (e.g. hosted on Vercel as client-side SPA)
    }

    // 2. Resilient fallback for Vercel & client-hosted deployments
    if (!authData) {
      const matched = PREDEFINED_OPERATORS[cleanInput];
      if (matched && cleanPassword === 'Operator@123') {
        authData = {
          token: `op_token_${matched.centreId}_${Date.now()}`,
          user: {
            id: `usr_${matched.centreId}`,
            name: matched.name,
            email: matched.email,
            mobile: matched.mobile,
            role: 'OPERATOR',
          },
          operator: {
            id: `op_${matched.centreId}`,
            userId: `usr_${matched.centreId}`,
            centreId: matched.centreId,
            badgeNo: matched.badgeNo,
            active: true,
          },
          centreName: matched.centreName,
        };
      } else {
        throw new Error('Email or password is incorrect');
      }
    }

    if (authData.user?.role !== 'OPERATOR') {
      throw new Error('Access denied. This portal is restricted to Procurement Centre accounts.');
    }

    // Store in browser storage for session continuity
    localStorage.setItem(OPERATOR_TOKEN_KEY, authData.token);
    localStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(authData));
    localStorage.setItem('kisan_role', 'OPERATOR');
    localStorage.setItem('Kisan Marg_token', authData.token);
    localStorage.setItem('kisansetu_token', authData.token);

    return authData;
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
      localStorage.removeItem('Kisan Marg_token');
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
