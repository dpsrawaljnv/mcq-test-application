/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/student/:path*',
        destination: 'http://localhost:8000/student/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:8000/admin/:path*',
      },
      {
        source: '/api/teacher/:path*',
        destination: 'http://localhost:8000/teacher/:path*',
      },
    ]
  },
}

module.exports = nextConfig
