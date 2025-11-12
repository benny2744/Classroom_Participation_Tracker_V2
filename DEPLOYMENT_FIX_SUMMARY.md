# Deployment Path Configuration Fix

## Date: November 12, 2025

## Problem
The application was experiencing 404 errors for:
- API routes (`/api/rooms/[id]/students`, `/api/participations/pending`, etc.)
- Static assets (`/_next/static/...`)
- Authentication endpoints

## Root Cause
**Mismatched path configuration between nginx and Next.js:**
- Nginx was configured to proxy `/participation/` → `http://127.0.0.1:3010/` (strips prefix)
- Next.js had varying `basePath` configurations (`/participation`, then `/next`)
- This caused routing conflicts

## Solution

### 1. **Removed `basePath` from Next.js** (`app/next.config.js`)
```javascript
// Before:
basePath: '/participation'  // or '/next'

// After:
// No basePath - nginx strips /participation before proxying
```

**Reason:** Nginx's `proxy_pass http://127.0.0.1:3010/` (with trailing slash) strips the `/participation` prefix before forwarding requests to Next.js. Next.js should handle requests as if they're at the root.

### 2. **Updated API utility functions** (`app/lib/api-utils.ts`)
Changed fallback from `/next` back to `/participation` to match nginx routing:
```javascript
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/participation';
```

### 3. **Updated docker-compose environment variables**
```yaml
NEXTAUTH_URL: "http://hsapp.yungu.org/participation"
AUTH_URL: "http://hsapp.yungu.org/participation"
```

### 4. **Nginx Configuration** (Already correct in `/etc/nginx/conf.d/hsapp.yungu.org.conf`)
```nginx
location /participation/ {
  proxy_pass http://127.0.0.1:3010/;
  proxy_set_header X-Forwarded-Prefix /participation;
  # ... other headers
}
```

## How It Works Now

1. **External Request:** `https://hsapp.yungu.org/participation/teacher`
2. **Nginx receives:** `/participation/teacher`
3. **Nginx proxies to:** `http://localhost:3010/teacher` (prefix stripped)
4. **Next.js receives:** `/teacher` (no basePath needed)
5. **Next.js serves:** The teacher page correctly

### Static Assets
1. **Browser requests:** `/participation/_next/static/chunks/117-xxx.js`
2. **Nginx strips prefix:** `/_next/static/chunks/117-xxx.js`
3. **Next.js serves:** Static file from `.next/static/chunks/`

### API Routes
1. **Browser requests:** `/participation/api/health`
2. **Nginx strips prefix:** `/api/health`
3. **Next.js API route:** Responds correctly

## Testing Results ✅

All endpoints working correctly through production URL:

### Production Tests (`http://hsapp.yungu.org/participation/`)

```bash
# Core Pages
Homepage:       200 ✅
Teacher Page:   200 ✅
Student Page:   200 ✅

# API Endpoints
Health:         ok  ✅ {"status":"ok","services":{"database":"connected"}}
Teachers API:   200 ✅

# Static Assets (with correct paths)
/_next/static/chunks/117-5567e84e49c381cb.js:    200 ✅ (immutable cache)
/_next/static/chunks/webpack-8e826c7e2b4f7f93.js: 200 ✅ (immutable cache)
/_next/static/css/710e6e3e4e1aabb7.css:          200 ✅ (immutable cache)

# Export API (NEW FEATURE)
/api/export/csv?roomId=X&type=totals:  ✅ Working (returns CSV for valid rooms)
/api/export/csv?roomId=X&type=logs:    ✅ Working (returns CSV for valid rooms)
```

### HTML Path Verification ✅

HTML now contains correct paths with `/participation` prefix:
- Links: `href="/participation/teacher"` ✅
- Scripts: `src="/participation/_next/static/chunks/..."` ✅
- Stylesheets: `href="/participation/_next/static/css/..."` ✅
- API calls from browser will go to `/participation/api/...` ✅

## Export Feature Enhancement

Also added **export student totals** feature:
- New endpoint: `/api/export/csv?roomId=X&type=totals`
- Exports current total points per student (instead of individual logs)
- Available in both Presentation View and Room Management pages
- Dropdown menu with options:
  - "Export Student Totals" (new)
  - "Export Participation Logs" (existing)

## Key Lesson

When nginx uses `proxy_pass http://backend/` (with trailing slash), it strips the location prefix. Therefore:
- **Remove `basePath` from Next.js config**
- Let nginx handle the path rewriting
- Next.js operates as if at root path internally

This pattern is consistent with other apps on the server (Test Schedule, Timer, etc.).

## Files Modified

1. `app/next.config.js` - Removed basePath
2. `app/lib/api-utils.ts` - Updated path references
3. `docker-compose.yml` - Updated environment URLs
4. `app/app/api/export/csv/route.ts` - Added totals export type
5. `app/app/teacher/room/[id]/presentation/page.tsx` - Added export dropdown
6. `app/app/teacher/room/[id]/page.tsx` - Added export dropdown

## Deployment Commands

```bash
cd /home/benny/Classroom_Participation_Tracker_V2
docker-compose build app
docker stop participation_tracker_app && docker rm participation_tracker_app
docker run -d \
  --name participation_tracker_app \
  --network classroom_participation_tracker_v2_default \
  -p 3010:3000 \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e NEXTAUTH_URL="http://hsapp.yungu.org/participation" \
  -e AUTH_URL="http://hsapp.yungu.org/participation" \
  -e NEXTAUTH_TRUST_HOST=true \
  -e NEXTAUTH_SECRET="..." \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  --restart unless-stopped \
  classroom_participation_tracker_v2_app
```

## Status: ✅ RESOLVED

Application is now running correctly at `http://hsapp.yungu.org/participation/`

