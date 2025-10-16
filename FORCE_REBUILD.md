# CRITICAL: Railway Not Picking Up Changes

## The Problem
Railway is using an old build that doesn't include `role` in JWT token.

## Solution: Force Clean Rebuild

### In Railway Dashboard:

1. **Go to your Web Service**
2. **Settings → Deploy**
3. **Delete ALL environment variables temporarily**
4. **Re-add them**
5. **Trigger Deploy**

OR:

1. **Settings → General**
2. **Delete the service**
3. **Re-create from GitHub**

OR:

1. **Deployments tab**
2. **Click "..." on latest deployment**
3. **"Redeploy"**
4. **Make sure it says "Building from commit: 5c39704"**

## Verify After Deploy:

Check logs for:
```
User logged in { userId: 3, role: 'admin' }
```

If `role` appears, it worked!
