/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://scoopdope.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/instructor/', '/admin/', '/auth/', '/profile', '/login', '/register'] },
    ],
  },
  exclude: ['/instructor/*', '/admin/*', '/auth/*', '/server-sitemap.xml'],
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'daily',
      priority: path === '/' ? 1 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      // Fetch all published courses
      const response = await fetch(`${apiUrl}/courses?limit=1000`);
      const { data: courses } = await response.json();

      // Add each course to sitemap
      if (courses && Array.isArray(courses)) {
        for (const course of courses) {
          result.push({
            loc: `/courses/${course.id}`,
            changefreq: 'daily',
            priority: 0.8,
            lastmod: course.updatedAt || new Date().toISOString(),
          });

          // Also try to fetch and add lessons if available
          try {
            const modulesRes = await fetch(`${apiUrl}/courses/${course.id}/modules`);
            const { data: modules } = await modulesRes.json();

            if (modules && Array.isArray(modules)) {
              for (const module of modules) {
                const lessonsRes = await fetch(`${apiUrl}/modules/${module.id}/lessons`);
                const { data: lessons } = await lessonsRes.json();

                if (lessons && Array.isArray(lessons)) {
                  for (const lesson of lessons) {
                    result.push({
                      loc: `/courses/${course.id}/lesson/${lesson.id}`,
                      changefreq: 'weekly',
                      priority: 0.7,
                      lastmod: lesson.updatedAt || new Date().toISOString(),
                    });
                  }
                }
              }
            }
          } catch (e) {
            // Ignore if modules/lessons fetch fails
          }
        }
      }
    } catch (e) {
      // Ignore if courses fetch fails
    }

    return result;
  },
};
