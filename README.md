# JavaScript Arabic Community

منصة اجتماعية عربية لمطوري JavaScript: Feed، أسئلة وإجابات، نقاشات، أخبار، تجارب انترفيو، ملفات مطورين، متابعة، تصويت وسمعة، إشعارات، وإدارة محتوى.

Phase 1-4 من خارطة الطريق منفذة بالكامل: Authentication، Profiles، Home Feed، Posts/Comments/Likes/Follow، Questions & Answers مع Accepted Answer وVoting، Discussions، News وInterview Experiences (بسير موافقة أدمن)، Reports & Moderation، Admin Dashboard، Badges تلقائية، Leaderboard، وبحث يغطي كل أنواع المحتوى. Phase 5 (Jobs، Newsletter، AI features، Monetization) غير منفذة بعد.

## Stack

- **Frontend**: Next.js (App Router) · React · JavaScript فقط · CSS3 مخصص بالكامل (بدون Tailwind)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Row Level Security)
- **Forms**: react-hook-form + zod
- **Icons**: lucide-react (مكتبة أيقونات واحدة فقط، لضمان اتساق بصري)

## البدء السريع

### 1. إنشاء مشروع Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. من **Project Settings → API** انسخ `Project URL` و `anon public key`.
3. من **Authentication → Providers** فعّل **Email** (مع Confirm email) و **Google** (تحتاج Client ID/Secret من Google Cloud Console، ثم أضف `https://<project-ref>.supabase.co/auth/v1/callback` كـ Authorized redirect URI في Google).
4. من **Authentication → URL Configuration** اضبط:
   - Site URL: `http://localhost:3000` (أو دومين الإنتاج)
   - Redirect URLs: أضف `http://localhost:3000/auth/callback` (وما يقابلها في الإنتاج)

### 2. تشغيل الـ Migrations

في **SQL Editor** على Supabase، شغّل كل ملفات `supabase/migrations/` بالترتيب الرقمي (0001 → الأحدث)، أو باستخدام [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-ref>
supabase db push
```

هذا ينشئ:

- كل الجداول (`profiles`, `posts`, `comments`, `votes`, `follows`, `tags`, `content_tags`, `questions`, `answers`, `discussions`, `news`, `interview_experiences`, `reports`, `bookmarks`, `reputation_events`, `badges`, `user_badges`, `notifications`, `user_interests`)
- الـ triggers (إنشاء profile تلقائيًا عند التسجيل، عدادات likes/comments/answers، أحداث السمعة، إشعارات المتابعة/الإجابة)
- سياسات Row Level Security على مستوى قاعدة البيانات (وليس فقط إخفاء أزرار في الواجهة)
- bucket تخزين عام باسم `avatars`
- تفعيل Realtime على جدول `notifications`
- بيانات مرجعية أولية: وسوم شائعة (JavaScript, React, Next.js...) وشارات (Badges)

### 3. متغيرات البيئة

```bash
cp .env.local.example .env.local
```

عبّئ `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` من خطوة 1، واضبط `NEXT_PUBLIC_SITE_URL` حسب بيئتك.

### 4. التشغيل محليًا

```bash
npm install
npm run dev
```

افتح `http://localhost:3000`.

### 5. بيانات تجريبية (اختياري)

عشان الموقع ميبقاش فاضي وقت العرض أو التجربة، فيه سكريبت بينشئ 8 حسابات مطورين وهمية (بأسماء وسير ذاتية عربية واقعية) ومحتوى مرتبط بيهم:

- **~13 خبر حقيقي** من مطوّرات الـ JavaScript ecosystem في 2026 (Next.js 16 / Turbopack، TypeScript 7 بمترجم Go، Vite 8 + Rolldown، React 19.2، Node.js 26، ES2025، Deno 2، Bun 1.2، هجوم npm supply chain، Angular 21 Signals...) — كل خبر summary عربي مختصر و`source_url` بيوديك للمدوّنة الرسمية للمصدر. دي بيانات seed لعرض تجريبي، اقرأ المصدر للتفاصيل الموثوقة.
- **~12 سؤال وإجابة** بمقاطع كود حقيقية (Iterator Helpers، `useEffectEvent`، `AbortSignal.timeout`، `structuredClone`، `satisfies`، `Promise.withResolvers`، Signals...).
- **7 نقاشات** حول جدالات قائمة فعلاً (الهجرة لـ TS7، Node vs Deno vs Bun، RSC بعد سنتين، أمان npm...).
- **~15 منشور**، **6 تجارب انترفيو** مفصّلة (Vodafone، Careem، Instabug، بنك خليجي...)، ومتابعات وتصويتات عشان الأرقام متبقاش صفر.

التواريخ موزّعة على الأسابيع الأخيرة عشان الترتيب الزمني يبان طبيعي. السكريبت آمن لإعادة التشغيل (بيتخطّى الموجود).

```bash
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> NEXT_PUBLIC_SUPABASE_URL=<project-url> npm run seed:demo
```

الـ `service_role` key موجود في **Project Settings → API**. **متحطهوش في `.env.local` ولا أي ملف** — مرره في سطر الأوامر مباشرة زي المثال، لأنه بيتخطى كل RLS policies بالكامل. شغّله فقط على مشروع تحت تحكمك (تطوير/تجربة).

### 6. CAPTCHA على التسجيل/الدخول (اختياري)

المشروع بيدعم [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) عن طريق دعم Supabase Auth الأصلي له (`captchaToken`) — مفيش حاجة مخصصة بتتحقق من التوكن، Supabase بتعملها بنفسها server-side.

1. اعمل widget جديد على [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) وخد الـ **Site Key** و**Secret Key**.
2. في Supabase: **Authentication → Settings → Attack Protection**، فعّل **Enable Captcha protection**، اختار **Turnstile**، وحط الـ Secret Key.
3. في `.env.local` ضيف:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

لو الـ env var مش موجودة، الـ widget مش بيظهر خالص وصفحات التسجيل/الدخول بتشتغل عادي من غيره.

### 7. Analytics (اختياري)

نفس الفكرة — لو عايز تستخدم [Plausible](https://plausible.io) (خفيف، من غير cookies، مش محتاج consent banner)، ضيف في `.env.local`:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
```

لو Self-hosted، ضيف كمان `NEXT_PUBLIC_PLAUSIBLE_SRC` برابط السكريبت بتاعك.

## بنية المشروع

```
src/
  app/
    (auth)/          صفحات تسجيل الدخول/التسجيل/استعادة كلمة المرور (بدون Navbar)
    (onboarding)/     إعداد الملف الشخصي + اختيار الاهتمامات بعد التسجيل
    (main)/           التطبيق الرئيسي (Navbar + Sidebar): الفيد، البروفايل، الإعدادات...
    auth/callback/    معالجة روابط تأكيد البريد وOAuth (PKCE)
  components/
    ui/               عناصر Design System القابلة لإعادة الاستخدام (Button, Field, Avatar, Tag...)
    layout/           Navbar, Sidebar, BottomNav
    post/             PostCard, Composer, Like/Bookmark/Share, تعليقات
    profile/          FollowButton
    auth/             GoogleAuthButton, AvatarUploader
  lib/
    supabase/         عملاء Supabase لـ Browser / Server / Middleware
    data/              دوال جلب بيانات Server-side (feed, profile...)
    validation/        مخططات zod للفورمز
  styles/             tokens.css (المتغيرات) · base.css (Reset + RTL) · components.css
supabase/migrations/  SQL الخاص بقاعدة البيانات (schema, seed, storage, realtime)
```

## قرارات معمارية

- **Tagging متعدد الأشكال (`content_tags`)** بدلًا من جدول ربط لكل نوع محتوى (`post_tags`, `question_tags`...)، حتى لا نحتاج جدولًا جديدًا مع كل نوع محتوى جديد.
- **Voting متعدد الأشكال (`votes`)** بقيد `unique(user_id, content_type, content_id)` يمنع التصويت المتكرر فعليًا على مستوى قاعدة البيانات، لا الواجهة فقط.
- **RLS في كل مكان**: كل جدول محتوى قابل للإشراف يعرض فقط الصفوف `status = 'approved'` للمستخدم العادي؛ صاحب المحتوى والمشرفون يرون نسخهم/كل شيء. لا يوجد منطق صلاحيات يعتمد فقط على إخفاء عناصر الواجهة.
- **Route groups**: `(auth)` و `(onboarding)` بدون Navbar، و `(main)` يحتوي الـ shell الكامل ويُحوّل تلقائيًا أي مستخدم لم يُكمل `onboarding_completed` إلى `/onboarding/profile-setup`.

## المراحل القادمة (Phase 5، غير منفذة)

Jobs Board · Newsletter · بحث متقدم (Elasticsearch/Meilisearch) · AI features · Monetization.

## ملاحظات أمان مهمة

- **لا تضع مفاتيح Supabase حقيقية في `.env.local.example`** — هذا الملف مُتتبَّع في git ويُقرأه أي شخص يفتح المستودع. القيم الحقيقية تروح في `.env.local` فقط (مُتجاهَل تلقائيًا في `.gitignore`).
- حظر/إيقاف حساب من `/admin/users` يمنع فعليًا النشر والتعليق والتصويت على مستوى قاعدة البيانات (trigger `check_author_active`)، مش مجرد تصنيف شكلي.
