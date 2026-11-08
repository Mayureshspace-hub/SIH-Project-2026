export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { email, password, role } = body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (
    role === 'OPERATOR' &&
    (cleanEmail === 'operator@parseoni.demo' || cleanEmail === 'operator') &&
    password === 'Operator@123'
  ) {
    return res.status(200).json({
      token: 'kisan_operator_token_parseoni',
      user: {
        id: 'usr_op_parseoni',
        name: 'Vikas Deshpande (Chief Registrar)',
        email: 'operator@parseoni.demo',
        mobile: '+91 98501 23456',
        role: 'OPERATOR',
      },
      operator: {
        id: 'op_parseoni',
        userId: 'usr_op_parseoni',
        centreId: 'ctr_parseoni',
        badgeNo: 'APMC-NGP-084',
        active: true,
      },
      centreName: 'Parseoni APMC Sub-Centre',
    });
  }

  return res.status(401).json({ error: 'Email or password is incorrect' });
}
