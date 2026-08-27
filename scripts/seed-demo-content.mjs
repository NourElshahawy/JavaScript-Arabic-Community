// One-off script: creates demo developer accounts and realistic Arabic
// content (posts, questions+answers, discussions, news, interview
// experiences) so the platform has something to read on a fresh Supabase
// project. Safe to re-run — it skips users/content that already exist by
// checking usernames/titles/bodies first.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co node scripts/seed-demo-content.mjs
//
// The service role key is in Supabase → Project Settings → API →
// "service_role" secret. It bypasses RLS entirely, so:
//   - never commit it, never put it in .env.local.example
//   - only run this against a project you control (dev/staging is ideal)
//   - pass it inline on the command line so it never lands in shell history
//
// About the NEWS items: every summary is a short Arabic paraphrase of a
// real 2026 development in the JavaScript ecosystem, with `source_url`
// pointing at the official blog / canonical page for that project. They
// are seed content for a demo, not journalism — always read the linked
// source for the authoritative details.

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const daysAgoISO = (days = 0) => new Date(Date.now() - days * 86_400_000).toISOString();
const lines = (...parts) => parts.join("\n");

const DEMO_USERS = [
  {
    email: "ahmed.nasser.demo@example.com",
    username: "ahmed_nasser",
    full_name: "أحمد ناصر",
    bio: "مطور Frontend، شغوف بـ React وأداء الويب. بكتب عن تجربتي في التعلم والعمل.",
    location: "القاهرة، مصر",
    skills: ["JavaScript", "React", "Next.js", "Performance"],
  },
  {
    email: "sara.abdallah.demo@example.com",
    username: "sara_abdallah",
    full_name: "سارة عبدالله",
    bio: "Backend Engineer في شركة ناشئة. مهتمة بـ Node.js وتصميم الـ APIs.",
    location: "عمّان، الأردن",
    skills: ["Node.js", "Fastify", "PostgreSQL", "Testing"],
  },
  {
    email: "mohamed.sherif.demo@example.com",
    username: "m_sherif",
    full_name: "محمد الشريف",
    bio: "مهندس برمجيات، بحب أشارك تجارب الانترفيوهات عشان أساعد المطورين الجدد.",
    location: "الرياض، السعودية",
    skills: ["JavaScript", "TypeScript", "Vue"],
  },
  {
    email: "mennah.hussein.demo@example.com",
    username: "mennah_h",
    full_name: "مِنّة حسين",
    bio: "Full-stack developer، بتابع أخبار الـ JavaScript ecosystem أول بأول.",
    location: "الإسكندرية، مصر",
    skills: ["React", "Node.js", "Web APIs"],
  },
  {
    email: "youssef.kamal.demo@example.com",
    username: "youssef_kamal",
    full_name: "يوسف كمال",
    bio: "مطور مستقل، مهتم بأدوات البناء (Vite, Rolldown) وتحسين تجربة المطورين.",
    location: "تونس العاصمة، تونس",
    skills: ["Vite", "Rollup", "esbuild", "npm"],
  },
  {
    email: "layla.mansour.demo@example.com",
    username: "layla_mansour",
    full_name: "ليلى منصور",
    bio: "مهتمة بأمان التطبيقات وسلسلة التوريد (supply chain). بحب أبسّط مواضيع الأمان للمطورين.",
    location: "الدار البيضاء، المغرب",
    skills: ["Security", "Node.js", "CI/CD", "npm"],
  },
  {
    email: "khaled.omar.demo@example.com",
    username: "khaled_omar",
    full_name: "خالد عمر",
    bio: "Platform engineer. بجرّب الـ runtimes الجديدة (Deno, Bun) في الإنتاج وبكتب عن النتيجة.",
    location: "دبي، الإمارات",
    skills: ["Deno", "Bun", "TypeScript", "Docker"],
  },
  {
    email: "nour.adel.demo@example.com",
    username: "nour_adel",
    full_name: "نور عادل",
    bio: "Developer Advocate. بترجم وبشرح مقترحات TC39 وميزات المتصفحات الجديدة بالعربي.",
    location: "بيروت، لبنان",
    skills: ["JavaScript", "Web Standards", "Writing", "TC39"],
  },
];

async function ensureUser(demo) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("username", demo.username).maybeSingle();
  if (existing) {
    console.log(`✓ user ${demo.username} already exists`);
    return existing.id;
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: demo.email,
    email_confirm: true,
    password: randomUUID(),
    user_metadata: { full_name: demo.full_name, username: demo.username },
  });

  if (error) {
    throw new Error(`Failed to create ${demo.username}: ${error.message}`);
  }

  const userId = created.user.id;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      bio: demo.bio,
      location: demo.location,
      skills: demo.skills,
      onboarding_completed: true,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Failed to update profile for ${demo.username}: ${updateError.message}`);
  }

  console.log(`+ created user ${demo.username}`);
  return userId;
}

async function ensureTag(slug, name) {
  await supabase.from("tags").upsert({ slug, name }, { onConflict: "slug", ignoreDuplicates: true });
  const { data } = await supabase.from("tags").select("id").eq("slug", slug).single();
  return data.id;
}

const TAG_NAMES = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  nextjs: "Next.js",
  nodejs: "Node.js",
  vite: "Vite",
  rust: "Rust",
  deno: "Deno",
  bun: "Bun",
  npm: "npm",
  security: "Security",
  ecmascript: "ECMAScript",
  tc39: "TC39",
  performance: "Performance",
  frontend: "Frontend",
  backend: "Backend",
  turbopack: "Turbopack",
  angular: "Angular",
  signals: "Signals",
  svelte: "Svelte",
  testing: "Testing",
  webapi: "Web APIs",
};

async function tagContent(contentType, contentId, tagSlugs) {
  for (const slug of tagSlugs) {
    const tagId = await ensureTag(slug, TAG_NAMES[slug] ?? slug);
    await supabase.from("content_tags").upsert(
      { tag_id: tagId, content_type: contentType, content_id: contentId },
      { onConflict: "content_type,content_id,tag_id", ignoreDuplicates: true }
    );
  }
}

async function ensurePost(authorId, body, tagSlugs = [], daysAgo = 0) {
  const { data: existing } = await supabase.from("posts").select("id").eq("author_id", authorId).eq("body", body).maybeSingle();
  if (existing) return existing.id;

  const { data: post, error } = await supabase
    .from("posts")
    .insert({ author_id: authorId, body, created_at: daysAgoISO(daysAgo) })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert post: ${error.message}`);
  await tagContent("post", post.id, tagSlugs);
  console.log(`+ post: ${body.slice(0, 48).replace(/\n/g, " ")}...`);
  return post.id;
}

async function ensureQuestion(authorId, title, body, tagSlugs = [], daysAgo = 0) {
  const { data: existing } = await supabase.from("questions").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: question, error } = await supabase
    .from("questions")
    .insert({ author_id: authorId, title, body, created_at: daysAgoISO(daysAgo) })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert question: ${error.message}`);
  await tagContent("question", question.id, tagSlugs);
  console.log(`+ question: ${title}`);
  return question.id;
}

async function ensureAnswer(questionId, authorId, body, { accept = false, daysAgo = 0 } = {}) {
  const { data: existing } = await supabase.from("answers").select("id").eq("question_id", questionId).eq("author_id", authorId).maybeSingle();
  const answerId =
    existing?.id ??
    (
      await supabase
        .from("answers")
        .insert({ question_id: questionId, author_id: authorId, body, created_at: daysAgoISO(daysAgo) })
        .select("id")
        .single()
        .then(({ data, error }) => {
          if (error) throw new Error(`Failed to insert answer: ${error.message}`);
          return data;
        })
    ).id;

  if (accept) {
    await supabase.from("questions").update({ accepted_answer_id: answerId }).eq("id", questionId);
  }
  return answerId;
}

async function ensureDiscussion(authorId, title, body, tagSlugs = [], daysAgo = 0) {
  const { data: existing } = await supabase.from("discussions").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: discussion, error } = await supabase
    .from("discussions")
    .insert({ author_id: authorId, title, body, created_at: daysAgoISO(daysAgo) })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert discussion: ${error.message}`);
  await tagContent("discussion", discussion.id, tagSlugs);
  console.log(`+ discussion: ${title}`);
  return discussion.id;
}

async function ensureNews(submitterId, { title, summary, url, source, tags = [], daysAgo = 0 }) {
  const { data: existing } = await supabase.from("news").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: news, error } = await supabase
    .from("news")
    .insert({
      submitted_by: submitterId,
      title,
      summary,
      source_url: url,
      source_name: source,
      status: "approved",
      published_at: daysAgoISO(daysAgo),
      created_at: daysAgoISO(daysAgo),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert news: ${error.message}`);
  await tagContent("news", news.id, tags);
  console.log(`+ news: ${title}`);
  return news.id;
}

async function ensureInterview(authorId, data) {
  const { data: existing } = await supabase
    .from("interview_experiences")
    .select("id")
    .eq("author_id", authorId)
    .eq("company", data.company)
    .eq("position", data.position)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: interview, error } = await supabase
    .from("interview_experiences")
    .insert({
      author_id: authorId,
      company: data.company,
      position: data.position,
      experience_level: data.level,
      difficulty: data.difficulty,
      rounds: data.rounds,
      interview_questions: data.questions,
      process_description: data.process ?? null,
      personal_experience: data.experience,
      status: "approved",
      created_at: daysAgoISO(data.daysAgo ?? 0),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert interview experience: ${error.message}`);
  console.log(`+ interview: ${data.position} @ ${data.company}`);
  return interview.id;
}

async function ensureFollow(followerId, followingId) {
  if (followerId === followingId) return;
  await supabase
    .from("follows")
    .upsert({ follower_id: followerId, following_id: followingId }, { onConflict: "follower_id,following_id", ignoreDuplicates: true });
}

async function ensureVote(userId, contentType, contentId, value = "up") {
  await supabase
    .from("votes")
    .upsert({ user_id: userId, content_type: contentType, content_id: contentId, value }, { onConflict: "user_id,content_type,content_id", ignoreDuplicates: true });
}

async function main() {
  console.log("Seeding demo users...");
  const ids = {};
  for (const demo of DEMO_USERS) {
    ids[demo.username] = await ensureUser(demo);
  }
  const U = ids;
  const ahmed = U.ahmed_nasser;
  const sara = U.sara_abdallah;
  const mohamed = U.m_sherif;
  const mennah = U.mennah_h;
  const youssef = U.youssef_kamal;
  const layla = U.layla_mansour;
  const khaled = U.khaled_omar;
  const nour = U.nour_adel;

  // ---------------------------------------------------------------- NEWS ---
  console.log("\nSeeding news...");
  await ensureNews(nour, {
    title: "تحديث أمني حرج لـ Next.js: الإصدارات 16.3.3 و15.5.24 تعالج ثغرتين بدرجة خطورة عالية",
    summary:
      "Vercel أصدرت تحديثًا أمنيًا يعالج ثغرتين بدرجة خطورة عالية في Next.js. المطلوب التحديث فورًا لـ 16.3.3 أو 15.5.24 حسب النسخة اللي بتستخدمها. راجع صفحة الـ blog الرسمية للتفاصيل والـ CVEs.",
    url: "https://nextjs.org/blog",
    source: "Next.js Blog",
    tags: ["nextjs", "security"],
    daysAgo: 2,
  });
  await ensureNews(layla, {
    title: "هجوم سلسلة توريد واسع على npm: دودة Shai-Hulud تصيب مئات نسخ الحزم الشهيرة",
    summary:
      "باحثو أمن رصدوا هجومًا نشطًا على npm يصيب نسخًا خبيثة من keyv وحزم مرتبطة بيها بإجمالي تنزيلات ضخمة شهريًا. البرمجية بتسرق بيانات اعتماد المطورين وبتنشر نفسها بإصابة حزم إضافية. الحماية: تثبيت الإصدارات بالـ lockfile، مراجعة كل تحديث dependency، تفعيل 2FA على npm، وفحص التغييرات بأدوات زي Socket أو npm audit.",
    url: "https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack",
    source: "Wiz Blog",
    tags: ["npm", "security", "nodejs"],
    daysAgo: 6,
  });
  await ensureNews(youssef, {
    title: "Vite 8 يطلق معماريّة جديدة مبنية على Rolldown (bundler مكتوب بـ Rust)",
    summary:
      "صدر Vite 8 وبيستخدم Rolldown كـ bundler موحّد بدل ازدواجية esbuild في التطوير وRollup في الإنتاج. الفريق بيتكلم عن builds أسرع من 10 لـ 30 مرة مع الحفاظ على توافق الـ plugins. Rolldown نفسه وصل 1.0 مستقر، وشركة Linear نزّلت وقت الـ production build من 46 ثانية لـ 6 ثواني.",
    url: "https://vite.dev/blog/announcing-vite8",
    source: "Vite Blog",
    tags: ["vite", "rust", "performance"],
    daysAgo: 10,
  });
  await ensureNews(khaled, {
    title: "Bun 1.2 يرفع توافقه مع Node.js لـ 98–99% ويثبّت استخدامه في الإنتاج",
    summary:
      "Bun 1.2 حسّن توافقه مع Node.js بشكل كبير وأصلح مشاكل npm اللي كانت بتخليه محفوف بالمخاطر في الإنتاج. بقى drop-in replacement لمشاريع Node كتير، مع تثبيت حزم أسرع بمرّات من npm بفضل تصميمه المكتوب بـ Zig.",
    url: "https://bun.sh/blog",
    source: "Bun Blog",
    tags: ["bun", "nodejs", "performance"],
    daysAgo: 14,
  });
  await ensureNews(nour, {
    title: "Node.js ينتقل لإصدار رئيسي واحد سنويًا بدءًا من الإصدار 27",
    summary:
      "بدءًا من Node.js 27 في أكتوبر 2026، هيتغير جدول الإصدارات من إصدارين رئيسيين سنويًا لإصدار واحد، وكل الإصدارات هتبقى LTS، وهيختفي التمييز بين النسخ الفردية والزوجية. الهدف تبسيط دورة الترقية على الفرق.",
    url: "https://www.infoq.com/news/2026/06/nodejs-release-changes/",
    source: "InfoQ",
    tags: ["nodejs"],
    daysAgo: 18,
  });
  await ensureNews(mennah, {
    title: "Node.js 26 يصبح إصدار Current وسيتحوّل إلى LTS في أكتوبر 2026",
    summary:
      "صدر Node.js 26 كإصدار Current. للإنتاج، Node.js 24 هو الـ Active LTS الحالي وNode.js 22 في مرحلة الصيانة (Maintenance). لو مشروعك على 22، ابدأ خطة الترقية لـ 24 قبل نهاية عمر الدعم.",
    url: "https://nodejs.org/en/blog/release/v26.0.0",
    source: "Node.js Blog",
    tags: ["nodejs"],
    daysAgo: 22,
  });
  await ensureNews(khaled, {
    title: "Angular 21 يتحوّل بالكامل للـ Signals واكتشاف التغيّر بدون Zone.js",
    summary:
      "Angular 21 بيدفع ناحية الـ Signals الصريحة و zoneless change detection. فرق بتتكلم عن تقليل حوالي 18% في حجم الـ bundle وحوالي 12% تحسّن في وقت التحميل الأول مع الـ standalone components والـ signals.",
    url: "https://blog.angular.dev",
    source: "Angular Blog",
    tags: ["angular", "signals", "performance"],
    daysAgo: 28,
  });
  await ensureNews(nour, {
    title: "TypeScript 7 يصدر رسميًا بمترجم مكتوب بلغة Go أسرع بحوالي 10 أضعاف",
    summary:
      "مايكروسوفت أعادت كتابة مترجم TypeScript وخدمة اللغة بالكامل بلغة Go (المشروع اتعلن عنه في مارس 2025). القياسات بتوريّ تسريع بين 9x و13x — فحص كود VS Code نزل من 77.8 ثانية لـ 7.5. النسخة القديمة المكتوبة بـ JavaScript بتكمل كـ 6.x خلال فترة الانتقال، والـ API البرمجي المستقر متوقع في 7.1.",
    url: "https://devblogs.microsoft.com/typescript/typescript-native-port/",
    source: "Microsoft DevBlogs",
    tags: ["typescript", "performance"],
    daysAgo: 34,
  });
  await ensureNews(ahmed, {
    title: "Next.js 16 يجعل Turbopack هو الأداة الافتراضية للبناء في التطوير والإنتاج",
    summary:
      "صدر Next.js 16 وبقى Turbopack هو الـ bundler الافتراضي لكل المشاريع في الـ development والـ production، بـ builds أسرع من 2 لـ 5 مرات من غير أي إعداد، والـ Fast Refresh أسرع لحد 10 مرات. الإصدارات اللاحقة ضافت persistent file cache وتقليل استهلاك الذاكرة لحد حوالي 90%.",
    url: "https://nextjs.org/blog/next-16",
    source: "Next.js Blog",
    tags: ["nextjs", "react", "turbopack"],
    daysAgo: 40,
  });
  await ensureNews(ahmed, {
    title: "React 19.2: مكوّن <Activity> وخطّاف useEffectEvent وتحسينات للـ Server Rendering",
    summary:
      "React 19.2 ضاف <Activity> اللي بيسمح تقسّم التطبيق لأجزاء تتخفي/تظهر مع إدارة الـ effects والأولويات، و useEffectEvent لفصل منطق الأحداث عن الـ Effects التفاعلية من غير stale closures، بالإضافة لـ cacheSignal وPerformance Tracks و batched Suspense في الـ SSR.",
    url: "https://react.dev/blog/2025/10/01/react-19-2",
    source: "React Blog",
    tags: ["react"],
    daysAgo: 46,
  });
  await ensureNews(nour, {
    title: "ECMAScript 2025 يُعتمد رسميًا بتسعة مقترحات منها Iterator Helpers وSet Methods",
    summary:
      "الجمعية العامة لـ Ecma اعتمدت ES2025. المجموعة النهائية: Iterator Helpers، Set Methods، Promise.try()، JSON Modules / Import Attributes، RegExp.escape()، RegExp inline modifiers، Float16Array، Duplicate named capture groups، وArray.fromAsync(). أغلبها مدعوم فعلاً في Node 22+ والمتصفحات الحديثة.",
    url: "https://tc39.es/ecma262/",
    source: "TC39 / ECMA-262",
    tags: ["ecmascript", "javascript", "tc39"],
    daysAgo: 60,
  });
  await ensureNews(khaled, {
    title: "Deno 2 يوفّر توافقًا كاملًا مع npm عبر بادئة \"npm:\" و node_modules",
    summary:
      "Deno 2 عمل تحوّل استراتيجي ناحية التوافق مع Node وnpm: تقدر تستورد الحزم مباشرة بـ import express from \"npm:express\" أو تستخدم package.json و node_modules التقليدية، مع الاحتفاظ بأمان Deno وأدواته المدمجة (fmt, lint, test).",
    url: "https://deno.com/blog",
    source: "Deno Blog",
    tags: ["deno", "npm", "typescript"],
    daysAgo: 68,
  });
  await ensureNews(mohamed, {
    title: "Svelte: مستجدات أغسطس 2026 — تحسينات على Runes وأدوات التطوير",
    summary:
      "التدوينة الشهرية لفريق Svelte بتلخّص تحسينات على نظام الـ Runes ($state, $derived, $effect)، ومكتبات جديدة في المنظومة، وتحديثات على الـ language tools. Runes بقت المعيار الأساسي للتفاعلية في Svelte 5/6.",
    url: "https://svelte.dev/blog/whats-new-in-svelte-august-2026",
    source: "Svelte Blog",
    tags: ["svelte", "signals"],
    daysAgo: 9,
  });

  // ----------------------------------------------------------- QUESTIONS ---
  console.log("\nSeeding questions & answers...");

  const q1 = await ensureQuestion(
    mennah,
    "ليه الـ Promise microtask بتتنفذ قبل setTimeout حتى لو الاتنين delay = 0؟",
    "عارف إن الـ Event Loop بيفرّق بين microtasks و macrotasks، بس مش فاهم بالظبط ليه الترتيب بيبقى كده كل مرة. حد يقدر يشرحها بمثال بسيط؟",
    ["javascript"],
    30
  );
  await ensureAnswer(
    q1,
    ahmed,
    lines(
      "بعد كل macrotask (زي setTimeout callback) الـ Event Loop بيفضّي **كل** الـ microtask queue قبل ما يروح للـ macrotask اللي بعده. يعني الـ Promise callbacks بتتنفذ كلها الأول.",
      "",
      "```js",
      "console.log('1');",
      "setTimeout(() => console.log('2 — macrotask'), 0);",
      "Promise.resolve().then(() => console.log('3 — microtask'));",
      "console.log('4');",
      "// الترتيب: 1 → 4 → 3 → 2",
      "```",
      "",
      "وكمان setTimeout(fn, 0) مش صفر فعلي — المتصفحات بتفرض حد أدنى (~4ms للـ nested timers)، وبرضه لازم يستنى دوره كـ macrotask."
    ),
    { accept: true, daysAgo: 29 }
  );

  const q2 = await ensureQuestion(
    youssef,
    "إيه الفرق العملي بين useMemo و useCallback في React؟",
    "فاهم إن الاتنين بيعملوا نوع من الـ caching، بس مش قادر أحدد امتى أستخدم أنهي واحد في كود حقيقي.",
    ["react"],
    26
  );
  await ensureAnswer(
    q2,
    sara,
    lines(
      "`useMemo` بيكاش **قيمة** (نتيجة حساب)، و`useCallback` بيكاش **الفنكشن نفسها** (الـ reference).",
      "",
      "```jsx",
      "// حساب تقيل → useMemo",
      "const sorted = useMemo(() => bigList.sort(compare), [bigList]);",
      "",
      "// فنكشن بتتبعت لـ child معمول له memo → useCallback",
      "const onSelect = useCallback((id) => setSelected(id), []);",
      "return <Row onSelect={onSelect} />;",
      "```",
      "",
      "لو مفيش child بيعمل memo ولا حساب تقيل، الاتنين مجرد تعقيد زيادة. React Compiler (تجريبي في 19.2) بيقلل الحاجة ليهم أصلاً."
    ),
    { accept: true, daysAgo: 25 }
  );

  const q3 = await ensureQuestion(
    mohamed,
    "إزاي أستخدم Iterator Helpers الجديدة في ES2025 بدل الـ arrays الوسيطة؟",
    "سمعت إن ES2025 ضافت map / filter / take على الـ iterators مباشرة. إزاي أستفيد منها في pipeline كبير من غير ما أعمل نسخ كتير من الـ array؟",
    ["ecmascript", "javascript", "performance"],
    16
  );
  await ensureAnswer(
    q3,
    nour,
    lines(
      "الـ helpers بتشتغل **بشكل كسول (lazy)**: بتعالج عنصر عنصر خلال السلسلة كلها قبل ما تنتقل للتالي، فمفيش arrays وسيطة.",
      "",
      "```js",
      "// الطريقة القديمة: بتلفّ على كل الـ array مرتين وتعمل نسخة",
      "const old = bigArray.filter(x => x % 2 === 0).map(x => x * 10).slice(0, 3);",
      "",
      "// ES2025: بيقف بعد أول 3 عناصر مطابقة",
      "const fresh = bigArray.values()",
      "  .filter(x => x % 2 === 0)",
      "  .map(x => x * 10)",
      "  .take(3)",
      "  .toArray();",
      "```",
      "",
      "مدعومة في Node 22+ ومتصفحات 2024+. مفيدة جدًا مع الـ generators والـ streams اللي مش عارف حجمها."
    ),
    { accept: true, daysAgo: 15 }
  );

  const q4 = await ensureQuestion(
    ahmed,
    "امتى أستخدم useEffectEvent بدل useCallback في React 19.2؟",
    "المفهوم لسه جديد عليّ. إيه المشكلة اللي بيحلها بالظبط؟",
    ["react"],
    12
  );
  await ensureAnswer(
    q4,
    mennah,
    lines(
      "`useEffectEvent` بيطلّع منطق **مش تفاعلي** بره الـ Effect، فتقدر تقرأ أحدث props/state من غير ما تضيفهم للـ dependency array.",
      "",
      "```jsx",
      "function ChatRoom({ roomId, theme }) {",
      "  const onConnected = useEffectEvent(() => {",
      "    showToast('اتصلنا!', theme); // بيشوف أحدث theme دايمًا",
      "  });",
      "",
      "  useEffect(() => {",
      "    const conn = createConnection(roomId);",
      "    conn.on('connected', () => onConnected());",
      "    return () => conn.disconnect();",
      "  }, [roomId]); // theme مش هنا → مفيش reconnect لما الـ theme يتغير",
      "}",
      "```",
      "",
      "`useCallback` غرضه مختلف تمامًا: تثبيت reference عشان تمنع re-render لـ child."
    ),
    { daysAgo: 11 }
  );

  const q5 = await ensureQuestion(
    sara,
    "إيه أنضف طريقة أعمل بيها timeout لـ fetch؟",
    "عايز الطلب يفشل بعد 5 ثواني بدل ما يفضل معلّق.",
    ["javascript", "webapi", "nodejs"],
    20
  );
  await ensureAnswer(
    q5,
    khaled,
    lines(
      "أبسط طريقة دلوقتي: `AbortSignal.timeout()` (Node 18+ ومتصفحات حديثة).",
      "",
      "```js",
      "try {",
      "  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });",
      "  return await res.json();",
      "} catch (e) {",
      "  if (e.name === 'TimeoutError') throw new Error('انتهت المهلة');",
      "  throw e;",
      "}",
      "```",
      "",
      "ولو محتاج تجمع بين timeout و إلغاء يدوي، استخدم `AbortSignal.any([userSignal, AbortSignal.timeout(5000)])`."
    ),
    { accept: true, daysAgo: 19 }
  );

  const q6 = await ensureQuestion(
    mennah,
    "الفرق بين structuredClone و JSON.parse(JSON.stringify(x))؟",
    "بستخدم حيلة الـ JSON من زمان في النسخ العميق، هل structuredClone أحسن فعلاً؟",
    ["javascript", "webapi"],
    24
  );
  await ensureAnswer(
    q6,
    ahmed,
    lines(
      "أيوه، وبفرق كبير. حيلة الـ JSON بتضيّع أي حاجة مش JSON.",
      "",
      "```js",
      "const original = { d: new Date(), map: new Map([['a', 1]]), n: undefined };",
      "",
      "JSON.parse(JSON.stringify(original));",
      "// d بقت string، map بقت {}، n اختفت",
      "",
      "structuredClone(original);",
      "// d لسه Date، map لسه Map، وبيتعامل مع المراجع الدائرية",
      "```",
      "",
      "مدعومة في Node 17+ وكل المتصفحات. مبتنفعش مع الـ functions والـ DOM nodes."
    ),
    { accept: true, daysAgo: 23 }
  );

  const q7 = await ensureQuestion(
    khaled,
    "إزاي أشغّل TypeScript مباشرة في Node من غير build step؟",
    "عايز أكتب scripts بـ .ts وأشغّلها على طول في الـ development.",
    ["typescript", "nodejs"],
    8
  );
  await ensureAnswer(
    q7,
    sara,
    lines(
      "Node بقى بيشيل الـ type annotations وقت التشغيل (type stripping):",
      "",
      "```bash",
      "# Node 22.6+ : علم تجريبي",
      "node --experimental-strip-types script.ts",
      "",
      "# Node 23.6+ : شغّال افتراضيًا لملفات .ts",
      "node script.ts",
      "```",
      "",
      "مهم: ده **مش** type-checking — Node بيشيل الأنواع وخلاص. سيب فحص الأنواع للـ CI (`tsc --noEmit` أو `tsgo` بتاع TypeScript 7)."
    ),
    { accept: true, daysAgo: 7 }
  );

  const q8 = await ensureQuestion(
    youssef,
    "Object.groupBy بتعمل إيه؟ وامتى أستخدمها؟",
    "شفتها في كود زميل ومفهمتش الفرق بينها وبين reduce.",
    ["javascript", "ecmascript"],
    14
  );
  await ensureAnswer(
    q8,
    nour,
    lines(
      "بتجمّع عناصر أي iterable حسب مفتاح بترجعه الدالة — بديل مقروء لـ reduce.",
      "",
      "```js",
      "const users = [",
      "  { name: 'أحمد', role: 'admin' },",
      "  { name: 'سارة', role: 'user' },",
      "  { name: 'منة', role: 'admin' },",
      "];",
      "",
      "Object.groupBy(users, (u) => u.role);",
      "// { admin: [{أحمد}, {منة}], user: [{سارة}] }",
      "```",
      "",
      "فيه كمان `Map.groupBy` لو المفتاح مش نص. جزء من ES2024، مدعومة في Node 21+ ومتصفحات 2024."
    ),
    { daysAgo: 13 }
  );

  const q9 = await ensureQuestion(
    mohamed,
    "يعني إيه satisfies في TypeScript وامتى أستخدمها؟",
    "الفرق بينها وبين as أو : Type مش واضح ليّا.",
    ["typescript"],
    18
  );
  await ensureAnswer(
    q9,
    khaled,
    lines(
      "`satisfies` بتتأكد إن القيمة مطابقة لنوع، **من غير ما تغيّر** النوع الدقيق المستنتج ليها.",
      "",
      "```ts",
      "type Route = { path: string; auth: boolean };",
      "",
      "const routes = {",
      "  home:  { path: '/',      auth: false },",
      "  admin: { path: '/admin', auth: true  },",
      "} satisfies Record<string, Route>;",
      "",
      "routes.home.path;  // النوع string، والـ autocomplete عارف 'home' و'admin'",
      "// لو نسيت auth في route، الـ compiler هيمسكها",
      "```",
      "",
      "مثالية للـ config objects: تحقّق كامل + inference دقيق. `as` بالعكس بتسكّت الـ compiler وممكن تخبّي أخطاء."
    ),
    { accept: true, daysAgo: 17 }
  );

  const q10 = await ensureQuestion(
    sara,
    "Promise.withResolvers() بتحل مشكلة إيه؟",
    "شفتها في ES2024، إمتى أحتاجها؟",
    ["javascript", "ecmascript"],
    10
  );
  await ensureAnswer(
    q10,
    ahmed,
    lines(
      "لما محتاج تعمل resolve/reject للـ promise من كود **بره** الـ executor.",
      "",
      "```js",
      "// قبل: نمط متكرر ومزعج",
      "let resolve, reject;",
      "const p = new Promise((res, rej) => { resolve = res; reject = rej; });",
      "",
      "// ES2024",
      "const { promise, resolve, reject } = Promise.withResolvers();",
      "emitter.once('done', resolve);",
      "emitter.once('error', reject);",
      "await promise;",
      "```",
      "",
      "مفيدة في ربط الـ promises بـ event emitters أو أي callback API قديم."
    ),
    { daysAgo: 9 }
  );

  const q11 = await ensureQuestion(
    ahmed,
    "إيه هي الـ Signals وليه كل الفريمويركس بتتكلم عنها في 2026؟",
    "Angular 21 اعتمدها، Svelte عندها runes، وفيه مقترح TC39. إيه الفكرة الأساسية؟",
    ["signals", "javascript", "angular"],
    22
  );
  await ensureAnswer(
    q11,
    nour,
    lines(
      "الـ Signal قيمة تفاعلية بتعرف **مين بيعتمد عليها**، فلما تتغير بتحدّث اللي محتاج بس — من غير re-render لشجرة كاملة.",
      "",
      "```js",
      "const count = signal(0);",
      "const double = computed(() => count() * 2);",
      "effect(() => console.log(double())); // يطبع 0",
      "",
      "count.set(5); // يطبع 10 — بس الـ effect اللي بيعتمد على count اللي اشتغل",
      "```",
      "",
      "Angular 21 بناها في القلب، Vue بيستخدم نفس الفكرة (ref) من زمان، Svelte 5+ بـ runes ($state)، وفيه مقترح TC39 لإضافتها للغة نفسها. الفايدة: أداء أفضل وكود أوضح للحالة المشتقة."
    ),
    { accept: true, daysAgo: 21 }
  );

  const q12 = await ensureQuestion(
    mennah,
    "Array.fromAsync مقابل Promise.all — امتى أستخدم أنهي؟",
    "الاتنين بيتعاملوا مع async، بس مش فاهم الفرق العملي.",
    ["javascript", "ecmascript", "nodejs"],
    6
  );
  await ensureAnswer(
    q12,
    sara,
    lines(
      "`Promise.all` بيبدأ كل الـ promises **مع بعض** (parallel). `Array.fromAsync` بيستهلك async iterable **عنصر عنصر** (sequential).",
      "",
      "```js",
      "// عدد ثابت من الطلبات المستقلة → parallel",
      "const results = await Promise.all(urls.map((u) => fetch(u)));",
      "",
      "// استهلاك async generator (pagination) → بالترتيب",
      "async function* pages() {",
      "  let url = '/api/items?page=1';",
      "  while (url) {",
      "    const r = await fetch(url).then((x) => x.json());",
      "    yield* r.data;",
      "    url = r.next;",
      "  }",
      "}",
      "const all = await Array.fromAsync(pages());",
      "```"
    ),
    { accept: true, daysAgo: 5 }
  );

  // --------------------------------------------------------- DISCUSSIONS ---
  console.log("\nSeeding discussions...");

  const d1 = await ensureDiscussion(
    mohamed,
    "هل Frontend Developer محتاج يتعلم TypeScript في 2026؟",
    "بشوف شركات كتير بقت بتطلب TypeScript كشرط أساسي مش ميزة إضافية، وإحصائيات بتقول التبنّي وصل حوالي 78% بين المحترفين. حد لسه شغال JavaScript عادي ومعتقدش إنه محتاجه؟ ياريت نتناقش من زوايا مختلفة.",
    ["typescript", "frontend"],
    27
  );
  const d2 = await ensureDiscussion(
    khaled,
    "تهاجر لـ TypeScript 7 (مترجم Go) دلوقتي ولا تستنى 7.1؟",
    "السرعة إغراء كبير (10x على الـ CI)، بس النسخة الحالية لسه من غير API برمجي مستقر، وده معناه إن أدوات زي ts-jest و بعض الـ ESLint plugins ممكن تحتاج وقت تلحق. إنتم رأيكم إيه — تجربوها في مشروع إنتاج دلوقتي ولا تستنوا؟",
    ["typescript", "performance"],
    20
  );
  const d3 = await ensureDiscussion(
    khaled,
    "Node vs Deno 2 vs Bun 1.2 لمشروع API جديد في 2026 — تختار إيه ولماذا؟",
    "التوافق بقى شبه محلول في التلاتة. Bun أسرع في التثبيت والتشغيل، Deno عنده toolchain مدمج وأمان افتراضي، وNode هو الأضمن للـ production والتوظيف. لو بتبدأ مشروع جديد النهاردة، هتختار إيه؟",
    ["nodejs", "deno", "bun"],
    15
  );
  const d4 = await ensureDiscussion(
    mennah,
    "بعد سنتين من React Server Components — استحقت الضجة ولا عقّدت الدنيا؟",
    "التجربة اتحسّنت كتير مع Next 16 وTurbopack، بس لسه فيه لبس حوالي حدود الـ server/client والـ caching. حد بنى بيها مشروع كبير ويقدر يشارك تجربته الحقيقية — المكسب كان يستاهل التعقيد؟",
    ["react", "nextjs"],
    12
  );
  const d5 = await ensureDiscussion(
    youssef,
    "Vite 8 + Rolldown: الـ migration من Vite 6/7 يستاهل دلوقتي؟",
    "الأرقام اللي الفريق نشرها مبهرة (Linear من 46s لـ 6s)، والـ plugin compatibility مفروض محفوظة. حد جرّب الترقية على مشروع فيه plugins كتير — قابلت مشاكل؟",
    ["vite", "rust", "performance"],
    9
  );
  const d6 = await ensureDiscussion(
    layla,
    "بعد دودة Shai-Hulud على npm — إيه أقل الاحتياطات اللي لازم كل فريق يعملها؟",
    "الفكرة إننا نطلع بـ checklist عملي مش نظري. عندي بداية: (1) تثبيت الإصدارات بالـ lockfile ومنع الـ auto-update، (2) تفعيل 2FA على كل حسابات npm، (3) مراجعة الـ dependency diffs في الـ PRs، (4) استخدام `npm ci` مش `npm install` في الـ CI، (5) أداة فحص زي Socket. تضيفوا إيه؟",
    ["npm", "security", "nodejs"],
    5
  );
  const d7 = await ensureDiscussion(
    nour,
    "الـ Signals داخلة JavaScript نفسها — ده هيوحّد الفريمويركس ولا يزوّد التشتت؟",
    "لو المقترح عدّى، كل فريمورك هيقدر يبني تفاعليته فوق أساس واحد. بس ممكن برضه كل واحد يفضل يعمل الـ API بتاعه فوقه. رأيكم — ده هيسهّل الانتقال بين الفريمويركس ولا مش هيفرق عمليًا؟",
    ["signals", "javascript", "tc39"],
    3
  );

  // -------------------------------------------------------------- POSTS ---
  console.log("\nSeeding posts...");
  const p1 = await ensurePost(
    ahmed,
    "لسه مكتشف إن Array.prototype.at() بتخليك تجيب آخر عنصر بـ arr.at(-1) من غير ما تحسب arr.length - 1. حاجة بسيطة بس فرقت معايا كتير في قراءة الكود.",
    ["javascript"],
    33
  );
  await ensurePost(
    sara,
    "بعد سنتين على Express، جرّبت Fastify في مشروع جديد. الفرق في الأداء ملموس خصوصًا مع الـ schema validation المدمجة. هكتب تدوينة قريب عن التجربة.",
    ["nodejs", "backend"],
    31
  );
  await ensurePost(
    mohamed,
    "نصيحة للمطورين الجدد: متستهونش بقراءة رسالة الخطأ كاملة قبل ما تروح تبحث. ٧٠٪ من مشاكلي بتتحل بمجرد قراءة الرسالة بتركيز.",
    [],
    29
  );
  await ensurePost(
    mennah,
    "جرّبت Server Components في Next.js في مشروع حقيقي مش تجريبي. التفكير في الـ data fetching بيتغير تمامًا — محتاج وقت أتعوّد.",
    ["nextjs", "react"],
    28
  );
  await ensurePost(
    youssef,
    "رقّيت مشروع متوسط من Vite 6 لـ Vite 8 (Rolldown). الـ dev server نفس الإحساس، بس الـ production build نزل من ~40 ثانية لـ ~12. الـ migration أخدت نص يوم بس بسبب plugin واحد قديم.",
    ["vite", "rust", "performance"],
    11
  );
  await ensurePost(
    khaled,
    "شغّلت أول script إنتاجي بـ node script.ts من غير ts-node ولا build. Type stripping في Node 24 بيشتغل حلو للـ tooling الداخلي. لسه بعمل tsc --noEmit في الـ CI طبعًا.",
    ["nodejs", "typescript"],
    7
  );
  await ensurePost(
    layla,
    "تذكير بعد أخبار الأسبوع: حوّلوا الـ CI من npm install لـ npm ci، وفعّلوا 2FA على npm، وخلّوا مراجعة أي bump في dependency جزء من الـ PR review. الاحتياطات دي بتوقف أغلب هجمات سلسلة التوريد.",
    ["npm", "security"],
    5
  );
  await ensurePost(
    nour,
    "Iterator Helpers من ES2025 غيّرت طريقة كتابتي للـ data pipelines: bigArray.values().filter(...).map(...).take(10).toArray() — كسول، وبيقف بدري، ومن غير arrays وسيطة.",
    ["ecmascript", "javascript"],
    17
  );
  await ensurePost(
    ahmed,
    "React Compiler (تجريبي في 19.2) شال مني معظم useMemo/useCallback اليدوية في مشروع صغير. الكود بقى أنضف والأداء زي ما هو أو أحسن. لسه مش هحطه في مشروع كبير قبل ما يستقر.",
    ["react"],
    19
  );
  await ensurePost(
    sara,
    "structuredClone(obj) بديل نضيف لـ JSON.parse(JSON.stringify(obj)) — بيحافظ على Date وMap وSet وبيتعامل مع المراجع الدائرية. مدعوم في كل البيئات الحديثة.",
    ["javascript", "webapi"],
    21
  );
  await ensurePost(
    mennah,
    "أول مرة أستخدم <Activity> في React 19.2 عشان أحافظ على حالة tab متخفية من غير ما فضل الـ effects شغالة. الفكرة بسيطة بس بتحل مشكلة قديمة.",
    ["react"],
    13
  );
  await ensurePost(
    khaled,
    "قارنت وقت تثبيت الحزم على مشروع فيه ~1200 dependency: npm ~34s، pnpm ~11s، bun ~2s (cached). لسه بستخدم npm في الإنتاج للثبات، بس bun في التطوير المحلي فرق كبير.",
    ["bun", "npm", "performance"],
    15
  );
  await ensurePost(
    mohamed,
    "سؤال بيتكرر في الانترفيوهات: اكتب debounce من غير مكتبات. جهّزوا الإجابة دي كويس، وافهموا الفرق بينها وبين throttle.",
    ["javascript"],
    24
  );
  await ensurePost(
    youssef,
    "Object.groupBy وMap.groupBy (ES2024) خلّوني أشيل نص استخدامات reduce في الكود. أوضح بكتير للي بيقرا بعدك.",
    ["javascript", "ecmascript"],
    18
  );
  await ensurePost(
    nour,
    "لو بتشرح الـ Event Loop لحد: ابدأ بـ call stack → microtask queue (Promises) → macrotask queue (setTimeout). القاعدة: الـ microtasks كلها بتتفضّى بعد كل macrotask.",
    ["javascript"],
    26
  );

  // --------------------------------------------------------- INTERVIEWS ---
  console.log("\nSeeding interview experiences...");
  await ensureInterview(mohamed, {
    company: "Vodafone",
    position: "Frontend Developer",
    level: "junior",
    difficulty: "medium",
    daysAgo: 35,
    rounds: ["HR", "JavaScript Screening", "React Technical", "Culture Fit"],
    questions: [
      "اشرح الـ Event Loop خطوة بخطوة",
      "الفرق بين == و ===؟",
      "إزاي بيشتغل الـ reconciliation في React؟",
      "اكتب فنكشن debounce من غير مكتبات",
    ],
    process: "أربع مراحل على مدار أسبوعين، كلها عن بُعد ما عدا الأخيرة.",
    experience:
      "التجربة كانت منظمة كويس. أصعب حاجة كانت الجزء التقني في React لأنهم ركزوا على الفهم العميق مش الاستخدام. المقابلة الأخيرة كانت أقرب لمحادثة عن أسلوب العمل.",
  });
  await ensureInterview(sara, {
    company: "شركة ناشئة (Fintech)",
    position: "Backend Developer",
    level: "mid",
    difficulty: "hard",
    daysAgo: 40,
    rounds: ["Take-home Task", "System Design", "Live Coding", "Final with CTO"],
    questions: [
      "صمّم نظام لمعالجة المدفوعات يتحمل آلاف الطلبات في الثانية",
      "إزاي تتعامل مع الـ race conditions على مستوى قاعدة البيانات؟",
      "ليه اخترت Fastify في الـ take-home بتاعك؟",
      "إيه استراتيجيتك للـ idempotency في الـ payment APIs؟",
    ],
    process: "أسبوعين، الـ take-home أخد يومين والباقي جلسات ساعة لساعة ونص.",
    experience:
      "أصعب انترفيو خضته. الـ System Design كان صعب لأنهم بيدققوا في كل قرار وبيسألوك عن الـ trade-offs. نصيحتي: جهّز نفسك على المقارنات مش الحل النهائي بس.",
  });
  await ensureInterview(khaled, {
    company: "Careem",
    position: "Senior Frontend Engineer",
    level: "senior",
    difficulty: "hard",
    daysAgo: 18,
    rounds: ["Recruiter Screen", "Coding (2 rounds)", "Frontend System Design", "Behavioral / Bar Raiser"],
    questions: [
      "صمّم واجهة تتبّع رحلة لايف — إزاي تتعامل مع تحديثات الموقع المتكررة من غير ما تقتل الأداء؟",
      "اشرح إزاي تعمل virtualization لقائمة فيها آلاف العناصر",
      "إيه الفرق بين debounce وthrottle وrequestAnimationFrame في السياق ده؟",
      "إزاي تقيس وتحسّن الـ Largest Contentful Paint؟",
    ],
    process: "خمس جلسات موزّعة على يومين، فيها Bar Raiser في الآخر.",
    experience:
      "التركيز كان على الأداء وقرارات المعمارية على الـ frontend، مش خوارزميات مجردة. جلسة الـ System Design كانت الأهم — عايزين يشوفوا إزاي بتفكر في الـ trade-offs تحت ضغط.",
  });
  await ensureInterview(mennah, {
    company: "Instabug",
    position: "Full-stack Developer (Node + React)",
    level: "mid",
    difficulty: "medium",
    daysAgo: 25,
    rounds: ["HR", "Take-home (small feature)", "Technical Review + Live Coding", "Team Fit"],
    questions: [
      "اشرح قرارك في تقسيم الـ components في الـ take-home",
      "إزاي تمنع الـ N+1 queries في endpoint بيرجع list مع علاقات؟",
      "امتى تستخدم optimistic update وامتى ماتستخدمهوش؟",
      "إزاي تختبر hook فيه side effects؟",
    ],
    process: "الـ take-home كان feature صغير كامل (front + back) في 3–4 ساعات، وبعدين مراجعة مباشرة للكود.",
    experience:
      "التجربة كانت عملية جدًا ومريحة. مراجعة الكود المباشرة أهم من الأسئلة النظرية — بيهمهم إزاي بتبرر قراراتك وبتستقبل الـ feedback.",
  });
  await ensureInterview(youssef, {
    company: "شركة SaaS (عن بُعد – أوروبا)",
    position: "Frontend Engineer",
    level: "mid",
    difficulty: "medium",
    daysAgo: 30,
    rounds: ["Intro Call", "Pair Programming", "Take-home", "Values Interview"],
    questions: [
      "نعمل refactor لكومبوننت كبير مع بعض دلوقتي — ابدأ",
      "إيه اللي بيخلّي bundle كبير، وإزاي تحلّله؟",
      "اشرح الفرق بين الـ SSR والـ SSG والـ ISR وامتى تستخدم كل واحد",
      "إزاي تتعامل مع الـ accessibility في modal؟",
    ],
    process: "كله عن بُعد، جلسة الـ pair programming كانت على مشكلة حقيقية من الـ codebase بتاعهم.",
    experience:
      "الـ pair programming كان مريح لأنهم بيساعدوك وبيشوفوا إزاي بتشتغل مع حد. الـ take-home كان محدود بساعتين وواضح إنهم بيحترموا وقتك.",
  });
  await ensureInterview(mohamed, {
    company: "بنك (خليجي)",
    position: "Frontend Developer",
    level: "junior",
    difficulty: "medium",
    daysAgo: 45,
    rounds: ["HR", "Technical Written Test", "Technical Interview", "Manager"],
    questions: [
      "امتحان تحريري: أسئلة على closures وpromises والـ CSS specificity",
      "اشرح الفرق بين localStorage وsessionStorage والـ cookies",
      "إيه هي الـ CORS وليه بتحصل؟",
      "إزاي تأمّن نموذج تسجيل دخول على الـ frontend؟",
    ],
    process: "امتحان تحريري ساعة، وبعدين مقابلتين. العملية كلها أخدت 3 أسابيع بسبب إجراءات الـ HR.",
    experience:
      "الجزء التحريري كان أساسيات بحتة. المقابلة التقنية ركزت على الأمان والـ web fundamentals أكتر من الفريمويركس. لو بتذاكر للبنوك، ركّز على الأساسيات كويس.",
  });

  // --------------------------------------------------------- FOLLOWS ------
  console.log("\nSeeding follows...");
  const everyone = [ahmed, sara, mohamed, mennah, youssef, layla, khaled, nour];
  const followPairs = [
    [ahmed, sara], [ahmed, mohamed], [ahmed, nour], [ahmed, mennah],
    [sara, ahmed], [sara, khaled], [sara, layla],
    [mennah, ahmed], [mennah, sara], [mennah, nour], [mennah, youssef],
    [youssef, ahmed], [youssef, mennah], [youssef, khaled],
    [mohamed, ahmed], [mohamed, sara], [mohamed, nour],
    [layla, sara], [layla, khaled], [layla, nour],
    [khaled, sara], [khaled, youssef], [khaled, nour], [khaled, ahmed],
    [nour, ahmed], [nour, mennah], [nour, layla],
  ];
  for (const [a, b] of followPairs) await ensureFollow(a, b);

  // --------------------------------------------------------- VOTES -------
  console.log("\nSeeding votes/likes so counts don't read as zero...");
  const upvoters = everyone;
  for (const voter of upvoters) {
    await ensureVote(voter, "post", p1);
    await ensureVote(voter, "question", q3);
    await ensureVote(voter, "discussion", d6);
  }
  for (const voter of [ahmed, sara, mennah, khaled, nour]) {
    await ensureVote(voter, "question", q11);
    await ensureVote(voter, "discussion", d3);
  }
  for (const voter of [mohamed, youssef, layla, khaled]) {
    await ensureVote(voter, "question", q7);
    await ensureVote(voter, "discussion", d2);
  }
  await ensureVote(ahmed, "discussion", d1);
  await ensureVote(sara, "discussion", d1);
  await ensureVote(nour, "discussion", d7);
  await ensureVote(mennah, "discussion", d4);
  await ensureVote(youssef, "discussion", d5);

  console.log("\nDone. Refresh the site — feed, questions (with code samples), discussions, news, and interviews should all be populated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
