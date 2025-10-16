#!/bin/bash
# Run this script on Railway to fix admin role

echo "🔄 Fixing admin role..."

# Update admin role
psql $DATABASE_URL -c "UPDATE users SET role = 'admin' WHERE email = 'admin@reachly.com';"

# Verify
echo "✅ Checking result:"
psql $DATABASE_URL -c "SELECT id, email, role FROM users WHERE email = 'admin@reachly.com';"

echo "🎉 Done! Logout and login again on the website."
