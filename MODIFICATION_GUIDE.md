# 🛠️ دليل التعديلات السريع - Reachly

## 📍 أين تجد كل شيء؟

### 🎨 Frontend (واجهة المستخدم)

#### الصفحات الرئيسية
```
src/pages/
├── Dashboard.tsx          # لوحة التحكم - الإحصائيات
├── Accounts.tsx           # إدارة حسابات Twitter
├── Campaigns.tsx          # قائمة حملات الرسائل
├── CampaignDetail.tsx     # تفاصيل حملة رسائل
├── FollowCampaigns.tsx    # قائمة حملات المتابعة
├── FollowCampaignDetail.tsx # تفاصيل حملة متابعة
├── Conversations.tsx      # المحادثات (UI فقط)
├── Settings.tsx           # الإعدادات (غير مكتمل)
├── Plans.tsx              # الخطط (UI فقط)
└── Auth.tsx               # تسجيل الدخول/التسجيل
```

#### المعالجات (Wizards)
```
src/pages/campaign-wizard/    # معالج إنشاء حملة رسائل (5 خطوات)
src/pages/follow-wizard/      # معالج إنشاء حملة متابعة (4 خطوات)
```

#### المكونات
```
src/components/
├── ui/                   # مكونات shadcn/ui الأساسية
├── layout/               # AppLayout, Sidebar, Header
└── [custom]/             # مكونات مخصصة
```

#### API Client
```
src/lib/api.ts            # جميع استدعاءات API
```

---

### 🔧 Backend (الخادم)

#### الملفات الرئيسية
```
server/
├── index.ts              # Express server + جميع API endpoints
├── db.ts                 # قاعدة البيانات + التشفير
├── auth.ts               # JWT + bcrypt
├── twitter.ts            # التواصل مع Twitter API
├── campaign-runner.ts    # محرك حملات الرسائل
└── follow-runner.ts      # محرك حملات المتابعة
```

---

## 🎯 سيناريوهات التعديل الشائعة

### 1️⃣ إضافة صفحة جديدة

#### الخطوات:
```typescript
// 1. إنشاء الصفحة في src/pages/
// src/pages/NewPage.tsx
import { Card } from "@/components/ui/card";

export default function NewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">صفحة جديدة</h1>
      <Card className="p-6">
        {/* محتوى الصفحة */}
      </Card>
    </div>
  );
}

// 2. إضافة Route في src/App.tsx
import NewPage from "./pages/NewPage";

// داخل <Routes>
<Route path="/new-page" element={<NewPage />} />

// 3. إضافة رابط في Sidebar (إذا لزم الأمر)
// src/components/layout/Sidebar.tsx
```

---

### 2️⃣ إضافة API Endpoint جديد

#### الخطوات:
```typescript
// 1. في server/index.ts
app.get('/api/new-endpoint', authMiddleware, (req: any, res) => {
  try {
    // المنطق هنا
    const data = db.prepare('SELECT * FROM table').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 2. في src/lib/api.ts
export const newEndpoint = async () => {
  const response = await fetch(`${API_URL}/new-endpoint`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return response.json();
};

// 3. استخدام في Component
import { useQuery } from '@tanstack/react-query';
import { newEndpoint } from '@/lib/api';

const { data } = useQuery({
  queryKey: ['newEndpoint'],
  queryFn: newEndpoint,
});
```

---

### 3️⃣ إضافة عمود جديد في قاعدة البيانات

#### الخطوات:
```typescript
// 1. إنشاء ملف migration
// migrate-add-new-field.js
const Database = require('better-sqlite3');
const db = new Database('./reachly.db');

db.exec(`
  ALTER TABLE campaigns ADD COLUMN new_field TEXT;
`);

console.log('✅ Migration completed');
db.close();

// 2. تشغيل Migration
// node migrate-add-new-field.js

// 3. تحديث server/db.ts (للحملات الجديدة)
// أضف الحقل في CREATE TABLE IF NOT EXISTS

// 4. تحديث API endpoints في server/index.ts
// أضف الحقل في INSERT/UPDATE queries
```

---

### 4️⃣ تعديل نظام Pacing

#### الموقع: `server/campaign-runner.ts`

```typescript
// تعديل معدل الإرسال في الدقيقة
function getMessagesInLastMinute(campaignId: number): number {
  const logs = messageLog.get(campaignId) || [];
  const oneMinuteAgo = Date.now() - 60000; // غيّر هنا للتحكم بالمدة
  // ...
}

// تعديل التأخير العشوائي
const delay = Math.random() * (campaign.pacing_delay_max - campaign.pacing_delay_min) + campaign.pacing_delay_min;

// تعديل التحقق من الحد اليومي
if (attemptsToday.count >= campaign.pacing_daily_cap) {
  // المنطق هنا
}
```

---

### 5️⃣ إضافة مكون UI جديد

#### باستخدام shadcn/ui:
```bash
# إضافة مكون من shadcn
npx shadcn@latest add [component-name]

# مثال:
npx shadcn@latest add badge
npx shadcn@latest add calendar
npx shadcn@latest add chart
```

#### إنشاء مكون مخصص:
```typescript
// src/components/CustomComponent.tsx
import { Card } from "@/components/ui/card";

interface CustomComponentProps {
  title: string;
  children: React.ReactNode;
}

export function CustomComponent({ title, children }: CustomComponentProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </Card>
  );
}
```

---

### 6️⃣ تعديل Dashboard

#### الموقع: `src/pages/Dashboard.tsx`

```typescript
// إضافة إحصائية جديدة
const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: getDashboardStats,
  refetchInterval: 5000, // كل 5 ثوانٍ
});

// إضافة StatsCard جديد
<StatsCard
  title="إحصائية جديدة"
  value={stats?.newStat || 0}
  icon={IconName}
  trend={{ value: 12, isPositive: true }}
/>
```

---

### 7️⃣ إضافة Filter في Campaign Detail

#### الموقع: `src/pages/CampaignDetail.tsx`

```typescript
// 1. إضافة state للـ filter
const [statusFilter, setStatusFilter] = useState<string>('all');

// 2. تصفية البيانات
const filteredTargets = targets.filter(t => 
  statusFilter === 'all' || t.status === statusFilter
);

// 3. إضافة Tabs للتصفية
<Tabs value={statusFilter} onValueChange={setStatusFilter}>
  <TabsList>
    <TabsTrigger value="all">All ({targets.length})</TabsTrigger>
    <TabsTrigger value="pending">Pending</TabsTrigger>
    <TabsTrigger value="sent">Sent</TabsTrigger>
    <TabsTrigger value="failed">Failed</TabsTrigger>
  </TabsList>
</Tabs>

// 4. استخدام filteredTargets في الجدول
{filteredTargets.map(target => (...))}
```

---

### 8️⃣ إضافة Notifications

#### باستخدام Sonner (موجود بالفعل):
```typescript
import { toast } from "sonner";

// نجاح
toast.success("تم بنجاح!", {
  description: "تم إنشاء الحملة بنجاح",
});

// خطأ
toast.error("حدث خطأ!", {
  description: error.message,
});

// معلومات
toast.info("معلومة", {
  description: "الحملة قيد التشغيل",
});

// تحميل
toast.loading("جاري التحميل...");
```

---

### 9️⃣ إضافة Charts في Dashboard

#### باستخدام Recharts (موجود بالفعل):
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2025-01-01', messages: 10 },
  { date: '2025-01-02', messages: 25 },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="messages" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

---

### 🔟 إضافة Bulk Actions

#### الموقع: `src/pages/Campaigns.tsx`

```typescript
// 1. إضافة state للتحديد
const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);

// 2. إضافة Checkbox في الجدول
<Checkbox
  checked={selectedCampaigns.includes(campaign.id)}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedCampaigns([...selectedCampaigns, campaign.id]);
    } else {
      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
    }
  }}
/>

// 3. إضافة أزرار Bulk Actions
{selectedCampaigns.length > 0 && (
  <div className="flex gap-2">
    <Button onClick={handleBulkStart}>Start All</Button>
    <Button onClick={handleBulkPause}>Pause All</Button>
    <Button onClick={handleBulkDelete}>Delete All</Button>
  </div>
)}
```

---

## 🔍 أماكن مهمة للتعديل

### إعدادات Pacing الافتراضية
```typescript
// server/db.ts - في CREATE TABLE campaigns
pacing_per_minute INTEGER DEFAULT 3,
pacing_delay_min INTEGER DEFAULT 15,
pacing_delay_max INTEGER DEFAULT 30,
pacing_daily_cap INTEGER DEFAULT 50,
pacing_retry_attempts INTEGER DEFAULT 2,
```

### Twitter API Configuration
```typescript
// server/twitter.ts
const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAA...';
```

### Frontend API URL
```typescript
// src/lib/api.ts
const API_URL = 'http://localhost:3001/api';
```

### CORS Settings
```typescript
// server/index.ts
app.use(cors({ 
  origin: 'http://localhost:8080', 
  credentials: true 
}));
```

---

## 🎨 Styling & Theming

### Tailwind Config
```typescript
// tailwind.config.ts
// تعديل الألوان، الخطوط، إلخ
```

### CSS Variables
```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

---

## 🧪 Testing

### اختبار API Endpoint
```bash
# باستخدام curl
curl -X GET http://localhost:3001/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### اختبار Component
```typescript
// يمكن إضافة اختبارات باستخدام Vitest أو Jest
```

---

## 📝 Best Practices

### 1. التعديلات في Backend
- ✅ استخدم `authMiddleware` لحماية endpoints
- ✅ استخدم try/catch للتعامل مع الأخطاء
- ✅ استخدم prepared statements لمنع SQL injection
- ✅ أضف console.log للتتبع

### 2. التعديلات في Frontend
- ✅ استخدم TypeScript types
- ✅ استخدم TanStack Query للـ data fetching
- ✅ استخدم shadcn/ui components
- ✅ اتبع نمط الكود الموجود

### 3. قاعدة البيانات
- ✅ أنشئ migration files للتعديلات
- ✅ احتفظ بنسخة احتياطية قبل التعديل
- ✅ اختبر على قاعدة بيانات تجريبية أولاً

---

## 🚀 التشغيل والاختبار

### Development
```bash
# تشغيل Frontend + Backend معاً
npm run dev:all

# أو بشكل منفصل:
npm run dev      # Frontend only
npm run server   # Backend only
```

### إعادة تعيين قاعدة البيانات
```bash
npm run reset-db
```

### Build للإنتاج
```bash
npm run build
```

---

## 📚 مراجع مفيدة

### Documentation
- `PROJECT_UNDERSTANDING.md` - فهم شامل للمشروع
- `NEXT_STEPS.md` - اقتراحات التطوير
- `README.md` - دليل البدء السريع
- `docs/` - توثيق تقني مفصل

### External Docs
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Router](https://reactrouter.com/) - Routing

---

## 💡 نصائح سريعة

1. **قبل التعديل**: افهم الكود الموجود أولاً
2. **اتبع النمط**: استخدم نفس أسلوب الكود الموجود
3. **اختبر**: اختبر التعديلات قبل الانتقال للتالي
4. **احتفظ بنسخة احتياطية**: خاصة لقاعدة البيانات
5. **استخدم Git**: commit بعد كل تعديل ناجح

---

**آخر تحديث**: 15 أكتوبر 2025
**الحالة**: ✅ جاهز للاستخدام
