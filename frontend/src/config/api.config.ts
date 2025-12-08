/**
 * API Configuration
 *
 * Uses environment variable REACT_APP_API_URL if set,
 * otherwise defaults to '/api' which works for both:
 * - Local development with proxy (package.json proxy)
 * - Docker deployment (nginx proxy)
 */
export const API_BASE = process.env.REACT_APP_API_URL || '/api';
