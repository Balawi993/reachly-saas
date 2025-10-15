# 📋 فهم شامل للمشروع - Reachly

## 🎯 نظرة عامة
**Reachly** هو نظام متكامل لإدارة حملات الرسائل المباشرة والمتابعة على Twitter/X باستخدام الكوكيز.

---

## 🏗️ البنية التقنية

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

### Backend Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Cookie Encryption**: AES-256 (crypto)
- **CORS**: cors middleware

---

## 📊 قاعدة البيانات (8 جداول)

### 1. **users** - المستخدمين
```sql
- id (PK)
- email (UNIQUE)
- password_hash
- created_at
```

### 2. **accounts** - حسابات Twitter
```sql
- id (PK)
- user_id (FK)
- username
- handle (@username)
- avatar
- encrypted_cookies (AES-256)
- is_valid
- last_validated
- created_at
```

### 3. **campaigns** - حملات الرسائل المباشرة
```sql
- id (PK)
- user_id (FK)
- account_id (FK)
- name
- status (draft/active/paused/completed)
- target_source (manual/followers)
- message_template
- tags (JSON)
- pacing_per_minute
- pacing_delay_min
- pacing_delay_max
- pacing_daily_cap
- pacing_retry_attempts
- stats_total
- stats_sent
- stats_failed
- stats_replied
- created_at
```

### 4. **targets** - أهداف حملات الرسائل
```sql
- id (PK)
- campaign_id (FK)
- username
- handle
- name
- avatar
- status (pending/sent/failed/skipped)
- retry_count
- last_attempt_at
- sent_at
- replied_at
- error_message
```

### 5. **follow_campaigns** - حملات المتابعة
```sql
- id (PK)
- user_id (FK)
- account_id (FK)
- name
- status (draft/active/paused/completed)
- target_source (manual/followers)
- settings_follows_per_minute
- settings_daily_cap
- settings_random_delay
- settings_auto_pause
- stats_total
- stats_sent
- stats_failed
- created_at
```

### 6. **follow_targets** - أهداف حملات المتابعة
```sql
- id (PK)
- campaign_id (FK)
- username
- handle
- name
- avatar
- status (pending/sent/failed)
- last_attempt_at
- error_message
```

### 7. **conversations** - المحادثات
```sql
- id (PK)
- campaign_id (FK)
- target_id (FK)
- last_message
- last_message_at
- created_at
```

### 8. **messages** - الرسائل
```sql
- id (PK)
- conversation_id (FK)
- text
- sender
- timestamp
```

---

## 🔧 الملفات الرئيسية

### Backend Files
```
server/
├── index.ts           # Express server + API endpoints (509 lines)
├── db.ts              # Database schema + Encryption (152 lines)
├── auth.ts            # JWT + bcrypt authentication
├── twitter.ts         # Twitter API integration (459+ lines)
├── campaign-runner.ts # DM campaign automation (278 lines)
└── follow-runner.ts   # Follow campaign automation (8145 bytes)
```

### Frontend Files
```
src/
├── App.tsx                    # Main app + routing
├── pages/
│   ├── Dashboard.tsx          # لوحة التحكم
│   ├── Accounts.tsx           # إدارة الحسابات
│   ├── Campaigns.tsx          # قائمة حملات الرسائل
│   ├── CampaignDetail.tsx     # تفاصيل الحملة
│   ├── FollowCampaigns.tsx    # قائمة حملات المتابعة
│   ├── FollowCampaignDetail.tsx
│   ├── Conversations.tsx      # المحادثات (UI فقط)
│   ├── Settings.tsx           # الإعدادات (غير مكتمل)
│   ├── Plans.tsx              # الخطط (UI فقط)
│   ├── Auth.tsx               # تسجيل الدخول/التسجيل
│   ├── campaign-wizard/       # معالج إنشاء حملة رسائل (7 ملفات)
│   └── follow-wizard/         # معالج إنشاء حملة متابعة (5 ملفات)
└── lib/
    └── api.ts                 # API client
```

---

## 🚀 الميزات المكتملة (100%)

### ✅ 1. إدارة الحسابات
- إضافة حسابات Twitter متعددة
- تشفير AES-256 للكوكيز
- التحقق التلقائي من صلاحية الحسابات
- عرض الحسابات مع الصور الشخصية
- حذف الحسابات

### ✅ 2. حملات الرسائل المباشرة (DM Campaigns)
- **إنشاء الحملات**: معالج من 5 خطوات
  - Basics: الاسم والحساب
  - Targets: اختيار الأهداف (يدوي أو استخراج متابعين)
  - Message: قالب الرسالة مع متغيرات {{name}} و {{username}}
  - Pacing: إعدادات السرعة والحدود
  - Review: مراجعة وإنشاء

- **استخراج المتابعين**: جلب متابعي أي حساب عام
- **إدارة الأهداف**: عرض، تصفية، تصدير CSV
- **التحكم بالحملات**: Start/Pause/Stop من القائمة مباشرة

### ✅ 3. حملات المتابعة (Follow Campaigns)
- إنشاء حملات متابعة تلقائية
- استهداف متابعي حسابات معينة
- إعدادات سرعة المتابعة
- تتبع النجاح والفشل

### ✅ 4. نظام Pacing & Limits محكم
- **Messages per Minute**: تحديد دقيق لعدد الرسائل في الدقيقة
- **Delay Range**: تأخير عشوائي بين الرسائل (15-30 ثانية)
- **Daily Cap**: حد يومي للرسائل (يُحترم 100%)
- **Retry Attempts**: إعادة المحاولة عند الفشل (حتى 3 مرات)
- **Processing Lock**: منع المعالجة المتزامنة

### ✅ 5. نظام Retry ذكي
- تتبع عدد المحاولات لكل هدف (retry_count)
- تسجيل آخر محاولة (last_attempt_at)
- إعادة المحاولة التلقائية للأهداف الفاشلة
- منع إرسال رسائل مكررة لنفس المستخدم
- تحديث الحالة بناءً على النجاح/الفشل

### ✅ 6. Dashboard & Analytics
- إحصائيات عامة:
  - إجمالي الرسائل المرسلة
  - الحملات النشطة
  - الحسابات المتصلة
  - معدل الرد
- تحديث تلقائي كل 5 ثوانٍ

### ✅ 7. الأمان
- **JWT Authentication**: مصادقة آمنة
- **bcrypt**: تشفير كلمات المرور
- **AES-256**: تشفير الكوكيز
- **Rate Limiting**: منع الحظر من Twitter
- **CORS**: حماية من الطلبات غير المصرح بها

---

## 🔄 آلية عمل نظام Pacing

### المنطق الأساسي (في campaign-runner.ts)
```typescript
1. كل ثانية: التحقق من إمكانية الإرسال
2. التحقق من Messages per Minute (آخر 60 ثانية)
3. التحقق من Daily Cap (محاولات اليوم)
4. اختيار الهدف التالي (pending أو failed مع محاولات متبقية)
5. التحقق من عدم التكرار
6. إرسال الرسالة
7. تسجيل النتيجة (نجاح/فشل)
8. تأخير عشوائي قبل الرسالة التالية
```

### منع التزامن
- `processingCampaigns Set`: يمنع معالجة نفس الحملة مرتين في نفس الوقت
- `messageLog Map`: تتبع الرسائل المرسلة في آخر دقيقة

---

## 🌐 API Endpoints (15 endpoint)

### Auth (2)
- `POST /api/auth/signup` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول

### Accounts (3)
- `GET /api/accounts` - قائمة الحسابات
- `POST /api/accounts` - إضافة حساب
- `DELETE /api/accounts/:id` - حذف حساب

### DM Campaigns (5)
- `GET /api/campaigns` - قائمة الحملات
- `GET /api/campaigns/:id` - تفاصيل حملة
- `POST /api/campaigns` - إنشاء حملة
- `POST /api/campaigns/:id/start` - بدء حملة
- `POST /api/campaigns/:id/pause` - إيقاف مؤقت
- `POST /api/campaigns/:id/stop` - إيقاف نهائي

### Follow Campaigns (4)
- `GET /api/follow-campaigns` - قائمة حملات المتابعة
- `GET /api/follow-campaigns/:id` - تفاصيل حملة متابعة
- `POST /api/follow-campaigns` - إنشاء حملة متابعة
- `POST /api/follow-campaigns/:id/start` - بدء
- `POST /api/follow-campaigns/:id/pause` - إيقاف مؤقت
- `POST /api/follow-campaigns/:id/stop` - إيقاف نهائي

### Utilities (2)
- `POST /api/extract-followers` - استخراج المتابعين
- `GET /api/dashboard/stats` - إحصائيات Dashboard

---

## 🔐 التشفير والأمان

### تشفير الكوكيز (AES-256-CBC)
```typescript
// في db.ts
encrypt(text) -> iv:encrypted_data
decrypt(encrypted) -> original_text

// المفتاح من .env.local
COOKIE_ENCRYPTION_KEY=hex_string_64_chars
```

### JWT Authentication
```typescript
// في auth.ts
generateToken({ id, email }) -> JWT token
verifyToken(token) -> user object

// المفتاح من .env.local
JWT_SECRET=random_string
```

---

## 📦 الحزم المثبتة

### Dependencies (64 حزمة)
- **React Ecosystem**: react, react-dom, react-router-dom
- **UI**: @radix-ui/* (24 حزمة), lucide-react
- **Forms**: react-hook-form, zod, @hookform/resolvers
- **State**: @tanstack/react-query
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Backend**: express, better-sqlite3, bcryptjs, jsonwebtoken
- **Utilities**: date-fns, dotenv, cors, cookie-parser

### DevDependencies (16 حزمة)
- **TypeScript**: typescript, @types/*
- **Build**: vite, @vitejs/plugin-react-swc
- **Linting**: eslint, typescript-eslint
- **Styling**: autoprefixer, postcss, @tailwindcss/typography

---

## 🎨 الصفحات والمكونات

### الصفحات الرئيسية (12 صفحة)
1. **Auth** - تسجيل الدخول/التسجيل ✅
2. **Dashboard** - لوحة التحكم ✅
3. **Accounts** - إدارة الحسابات ✅
4. **Campaigns** - قائمة حملات الرسائل ✅
5. **CampaignDetail** - تفاصيل حملة الرسائل ✅
6. **CampaignWizard** - معالج إنشاء حملة رسائل ✅
7. **FollowCampaigns** - قائمة حملات المتابعة ✅
8. **FollowCampaignDetail** - تفاصيل حملة المتابعة ✅
9. **FollowCampaignWizard** - معالج إنشاء حملة متابعة ✅
10. **Conversations** - المحادثات ⏳ (UI فقط، بدون بيانات)
11. **Settings** - الإعدادات ⏳ (غير مكتمل)
12. **Plans** - الخطط ⏳ (UI فقط)

### المكونات الرئيسية (52+ مكون)
- **Layout**: AppLayout, Sidebar, Header
- **UI Components**: من shadcn/ui (Button, Card, Dialog, Table, إلخ)
- **Custom Components**: StatsCard, CampaignCard, TargetTable, إلخ

---

## 🔄 سير العمل (Workflow)

### 1. إضافة حساب Twitter
```
1. المستخدم يذهب إلى صفحة Accounts
2. يضغط "Add Account"
3. يدخل username والكوكيز (auth_token, ct0)
4. Backend يتحقق من صلاحية الحساب عبر Twitter API
5. يشفر الكوكيز بـ AES-256
6. يحفظ في قاعدة البيانات
```

### 2. إنشاء حملة رسائل
```
1. المستخدم يذهب إلى Campaigns → New Campaign
2. يمر بـ 5 خطوات:
   - Basics: اسم الحملة واختيار الحساب
   - Targets: إضافة أهداف (يدوي أو استخراج متابعين)
   - Message: كتابة قالب الرسالة
   - Pacing: تحديد السرعة والحدود
   - Review: مراجعة وإنشاء
3. Backend يحفظ الحملة والأهداف في قاعدة البيانات
```

### 3. تشغيل حملة
```
1. المستخدم يضغط "Start" من صفحة Campaigns
2. Backend يبدأ interval كل ثانية
3. في كل iteration:
   - التحقق من Pacing limits
   - اختيار الهدف التالي
   - إرسال الرسالة عبر Twitter API
   - تحديث الحالة والإحصائيات
   - تأخير عشوائي
4. يستمر حتى:
   - انتهاء الأهداف
   - الوصول للحد اليومي
   - المستخدم يوقف الحملة
```

---

## 🛠️ Scripts المتاحة

```bash
# Development
npm run dev           # Frontend only (Vite)
npm run server        # Backend only (tsx watch)
npm run dev:all       # Both Frontend + Backend

# Database
npm run reset-db      # إعادة تعيين قاعدة البيانات

# Build
npm run build         # Production build
npm run build:dev     # Development build

# Other
npm run lint          # ESLint
npm run preview       # Preview production build
```

---

## ⚙️ ملفات الإعداد

### .env.local (موجود)
```env
JWT_SECRET=your-jwt-secret-here
COOKIE_ENCRYPTION_KEY=your-encryption-key-here
PORT=3001
```

### package.json
- **Name**: vite_react_shadcn_ts
- **Type**: module (ES Modules)
- **Scripts**: 7 scripts
- **Dependencies**: 64 حزمة
- **DevDependencies**: 16 حزمة

---

## 📝 التوثيق المتاح

### ملفات التوثيق (8+ ملفات)
1. **README.md** - دليل البدء السريع (بالعربية)
2. **README_AR.md** - دليل مفصل بالعربية
3. **PROJECT_STATUS.md** - حالة المشروع
4. **NEXT_STEPS.md** - الخطوات القادمة والاقتراحات
5. **FOLLOW_CAMPAIGNS_BACKEND_COMPLETE.md** - توثيق حملات المتابعة
6. **FOLLOW_CAMPAIGNS_FEATURE.md** - ميزة حملات المتابعة
7. **FOLLOW_CAMPAIGNS_FIXES.md** - إصلاحات حملات المتابعة
8. **docs/** - مجلد التوثيق التقني

---

## 🎯 الحالة الحالية

### ✅ جاهز 100%
- Backend API كامل
- DM Campaigns كاملة
- Follow Campaigns كاملة
- نظام Pacing & Retry
- Dashboard & Analytics
- Authentication & Security

### ⏳ يحتاج تطوير
- صفحة Conversations (UI موجود، تحتاج ربط بيانات)
- صفحة Settings (غير مكتملة)
- صفحة Plans (UI فقط)

### 💡 اقتراحات التطوير (من NEXT_STEPS.md)
1. **أولوية عالية** (3 ساعات):
   - Filters في Campaign Detail
   - Bulk Actions
   - Notifications System
   - Campaign Scheduling

2. **أولوية متوسطة** (4 ساعات):
   - Dashboard Charts
   - Campaign Templates
   - Blacklist Management
   - Advanced Targeting

3. **أولوية منخفضة** (حسب الحاجة):
   - A/B Testing
   - Conversations (ربط بيانات)
   - Team Collaboration

---

## 🚨 ملاحظات مهمة

### الأمان
⚠️ **لا تغير** `COOKIE_ENCRYPTION_KEY` بعد إضافة حسابات (ستفقد الوصول للكوكيز المشفرة)
⚠️ **احتفظ بنسخة احتياطية** من `.env.local`
⚠️ **لا تشارك** الكوكيز أو قاعدة البيانات

### الاستخدام
⚠️ استخدم إعدادات Pacing آمنة لتجنب الحظر
⚠️ ابدأ بحد يومي منخفض (30-50 رسالة)
⚠️ راقب معدل الفشل

### القيود
⚠️ Twitter لديه حدود:
- 500 DM/يوم (حسابات قديمة)
- 50-100 DM/يوم (حسابات جديدة)
- 15 طلب/15 دقيقة للـ API

---

## 🎉 الخلاصة

**Reachly** هو نظام متكامل وجاهز للاستخدام لإدارة حملات Twitter DM والمتابعة.

**نقاط القوة:**
✅ كود نظيف ومنظم
✅ نظام Pacing & Retry محكم
✅ أمان عالي (تشفير، JWT، bcrypt)
✅ UI حديث وسهل الاستخدام
✅ توثيق شامل
✅ سهل الصيانة والتطوير

**جاهز للتطوير:**
- البنية التحتية قوية
- يمكن إضافة ميزات جديدة بسهولة
- الكود قابل للتوسع

---

**آخر تحديث**: 15 أكتوبر 2025
**الإصدار**: v1.3.0
**الحالة**: ✅ جاهز للاستخدام والتطوير
