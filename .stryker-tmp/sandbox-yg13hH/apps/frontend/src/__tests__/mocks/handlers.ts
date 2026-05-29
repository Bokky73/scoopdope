import { http, HttpResponse } from 'msw';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ALL_COURSES = [
  { id: '1', title: 'Intro to Stellar Blockchain', level: 'beginner', durationHours: 4, isPublished: true },
  { id: '2', title: 'Soroban Smart Contracts', level: 'intermediate', durationHours: 8, isPublished: true },
  { id: '3', title: 'DeFi on Stellar', level: 'advanced', durationHours: 12, isPublished: true },
];

export const handlers = [
  http.get(`${BASE}/courses`, (req) => {
    const search = req.url.searchParams.get('search')?.toLowerCase() ?? '';
    const level = req.url.searchParams.get('level')?.toLowerCase() ?? '';
    const page = Number(req.url.searchParams.get('page') ?? '1');
    const limit = Number(req.url.searchParams.get('limit') ?? '5');

    let filtered = ALL_COURSES;

    if (search) {
      filtered = filtered.filter((course) => course.title.toLowerCase().includes(search));
    }

    if (level) {
      filtered = filtered.filter((course) => course.level === level);
    }

    const total = filtered.length;
    const offset = (Math.max(page, 1) - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    return HttpResponse.json({
      data: paged,
      total,
      page: Math.max(page, 1),
      limit,
    });
  }),

  http.get(`${BASE}/users/me`, () =>
    HttpResponse.json({
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'student',
      avatarUrl: '',
      bio: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      stellarPublicKey: 'GABC...',
    }),
    })
  ),

  http.get(`${BASE}/credentials/:userId`, () =>
    HttpResponse.json([
      {
        id: 'cred-1',
        courseId: 'course-1',
        courseName: 'Intro to Stellar Blockchain',
        issuedAt: '2024-06-01T00:00:00.000Z',
        txHash: 'abc123txhash',
      },
    ])
  ),

  http.get(`${BASE}/users/user-1/token-balance`, () =>
    HttpResponse.json({ balance: 850 }),
  ),

  http.get(`${BASE}/users/user-1/progress`, () =>
    HttpResponse.json([
      { id: 'progress-1', userId: 'user-1', courseId: '1', progressPct: 45 },
      { id: 'progress-2', userId: 'user-1', courseId: '2', progressPct: 100 },
    ]),
  ),

  http.get(`${BASE}/credentials/user-1`, () =>
    HttpResponse.json([
      { id: 'cred-123', userId: 'user-1', courseId: '2', issuedAt: '2026-03-28T15:00:00.000Z', course: { id: '2', title: 'Soroban Smart Contracts' } },
    ]),
  ),

  http.get(`${BASE}/courses/1`, () =>
    HttpResponse.json({ id: '1', title: 'Intro to Stellar Blockchain' }),
  ),

  http.get(`${BASE}/courses/2`, () =>
    HttpResponse.json({ id: '2', title: 'Soroban Smart Contracts' }),
  ),
];
