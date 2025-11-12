# Debugging Authentication Issues

## Enhanced Logging Added

I've added detailed logging to both signin and signup routes. The logs will show:
- When requests are received
- Missing fields
- Teacher lookup results
- Password validation results
- Success/failure status

## To Debug Your Issue

1. **Try logging in or creating an account from your browser**

2. **Check the logs immediately after:**
   ```bash
   docker logs participation_tracker_app --tail 50 | grep -E "\[SIGNIN\]|\[SIGNUP\]|Error|error"
   ```

3. **Or watch logs in real-time:**
   ```bash
   docker logs participation_tracker_app --follow | grep -E "\[SIGNIN\]|\[SIGNUP\]"
   ```

## Common Issues to Check

1. **Browser Console Errors**: Open browser DevTools (F12) and check the Console tab for JavaScript errors
2. **Network Tab**: Check the Network tab to see if requests are being made and what responses you're getting
3. **CORS Issues**: Check if there are CORS errors in the browser console
4. **BasePath Issues**: Verify requests are going to `/participation/api/auth/signin` not `/api/auth/signin`

## Quick Test

Test the API directly:
```bash
# Test signup
curl -X POST http://hsapp.yungu.org/participation/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test'$(date +%s)'@example.com","password":"test123"}'

# Test signin (use an email that exists)
curl -X POST http://hsapp.yungu.org/participation/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

## What the Logs Will Show

- `[SIGNIN] Request received:` - Shows when a login attempt happens
- `[SIGNIN] Missing fields:` - Shows if email/password are missing
- `[SIGNIN] Teacher not found:` - Shows if email doesn't exist
- `[SIGNIN] Invalid password:` - Shows if password is wrong
- `[SIGNIN] Success:` - Shows successful login

Same pattern for `[SIGNUP]` logs.


