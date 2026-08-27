// One-off script: creates a handful of demo developer accounts and
// realistic Arabic content (posts, questions+answers, a discussion, news,
// interview experiences) so the platform doesn't look empty in a fresh
// Supabase project. Safe to re-run — it skips users/content that already
// exist by checking usernames/titles first.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co node scripts/seed-demo-content.mjs
//
// The service role key is in Supabase → Project Settings → API →
// "service_role" secret. It bypasses RLS entirely, so:
//   - never commit it, never put it in .env.local.example
//   - only run this against a project you control (dev/staging is ideal)
//   - pass it inline on the command line so it never lands in shell history
//     files by accident (or export it in a throwaway shell)

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
    skills: ["Node.js", "Express", "PostgreSQL", "Testing"],
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
    bio: "مطور مستقل، مهتم بأدوات البناء (Vite, Webpack) وتحسين تجربة المطورين.",
    location: "تونس العاصمة، تونس",
    skills: ["Vite", "Webpack", "Babel", "npm"],
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

  // handle_new_user trigger creates the profiles row synchronously on
  // insert, so it should already exist — fill in the rest of the profile.
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

async function tagContent(contentType, contentId, tagSlugs) {
  for (const slug of tagSlugs) {
    const tagId = await ensureTag(slug, slug);
    await supabase.from("content_tags").upsert(
      { tag_id: tagId, content_type: contentType, content_id: contentId },
      { onConflict: "content_type,content_id,tag_id", ignoreDuplicates: true }
    );
  }
}

async function ensurePost(authorId, body, tagSlugs = []) {
  const { data: existing } = await supabase.from("posts").select("id").eq("author_id", authorId).eq("body", body).maybeSingle();
  if (existing) return existing.id;

  const { data: post, error } = await supabase.from("posts").insert({ author_id: authorId, body }).select("id").single();
  if (error) throw new Error(`Failed to insert post: ${error.message}`);
  await tagContent("post", post.id, tagSlugs);
  console.log(`+ post by ${authorId.slice(0, 8)}: ${body.slice(0, 40)}...`);
  return post.id;
}

async function ensureQuestion(authorId, title, body, tagSlugs = []) {
  const { data: existing } = await supabase.from("questions").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: question, error } = await supabase
    .from("questions")
    .insert({ author_id: authorId, title, body })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert question: ${error.message}`);
  await tagContent("question", question.id, tagSlugs);
  console.log(`+ question: ${title}`);
  return question.id;
}

async function ensureAnswer(questionId, authorId, body) {
  const { data: existing } = await supabase.from("answers").select("id").eq("question_id", questionId).eq("author_id", authorId).maybeSingle();
  if (existing) return existing.id;

  const { data: answer, error } = await supabase
    .from("answers")
    .insert({ question_id: questionId, author_id: authorId, body })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert answer: ${error.message}`);
  return answer.id;
}

async function ensureDiscussion(authorId, title, body, tagSlugs = []) {
  const { data: existing } = await supabase.from("discussions").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: discussion, error } = await supabase
    .from("discussions")
    .insert({ author_id: authorId, title, body })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert discussion: ${error.message}`);
  await tagContent("discussion", discussion.id, tagSlugs);
  console.log(`+ discussion: ${title}`);
  return discussion.id;
}

async function ensureNews(submitterId, title, summary, sourceUrl, sourceName, tagSlugs = []) {
  const { data: existing } = await supabase.from("news").select("id").eq("title", title).maybeSingle();
  if (existing) return existing.id;

  const { data: news, error } = await supabase
    .from("news")
    .insert({
      submitted_by: submitterId,
      title,
      summary,
      source_url: sourceUrl,
      source_name: sourceName,
      status: "approved",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert news: ${error.message}`);
  await tagContent("news", news.id, tagSlugs);
  console.log(`+ news: ${title}`);
  return news.id;
}

async function ensureInterview(authorId, company, position, level, difficulty, rounds, questions, experience) {
  const { data: existing } = await supabase
    .from("interview_experiences")
    .select("id")
    .eq("author_id", authorId)
    .eq("company", company)
    .eq("position", position)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: interview, error } = await supabase
    .from("interview_experiences")
    .insert({
      author_id: authorId,
      company,
      position,
      experience_level: level,
      difficulty,
      rounds,
      interview_questions: questions,
      personal_experience: experience,
      status: "approved",
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to insert interview experience: ${error.message}`);
  console.log(`+ interview: ${position} @ ${company}`);
  return interview.id;
}

async function ensureFollow(followerId, followingId) {
  if (followerId === followingId) return;
  await supabase.from("follows").upsert(
    { follower_id: followerId, following_id: followingId },
    { onConflict: "follower_id,following_id", ignoreDuplicates: true }
  );
}

async function ensureVote(userId, contentType, contentId, value = "up") {
  await supabase.from("votes").upsert(
    { user_id: userId, content_type: contentType, content_id: contentId, value },
    { onConflict: "user_id,content_type,content_id", ignoreDuplicates: true }
  );
}

async function main() {
  console.log("Seeding demo users...");
  const ids = {};
  for (const demo of DEMO_USERS) {
    ids[demo.username] = await ensureUser(demo);
  }

  const [ahmed, sara, mohamed, mennah, youssef] = DEMO_USERS.map((d) => ids[d.username]);

  console.log("\nSeeding posts...");
  const post1 = await ensurePost(
    ahmed,
    "لسه مكتشف إن الـ Array.prototype.at() بتخليك تجيب آخر عنصر بـ arr.at(-1) من غير ما تحسب arr.length - 1. حاجة بسيطة بس فرقت معايا كتير في الكود.",
    ["javascript"]
  );
  await ensurePost(
    sara,
    "بعد سنتين بستخدم Express، قررت أجرب Fastify في مشروع جديد. الفرق في الأداء ملموس فعلاً خصوصًا مع الـ schema validation المدمجة. هكتب تدوينة قريبًا عن التجربة.",
    ["nodejs", "backend"]
  );
  await ensurePost(
    mohamed,
    "نصيحة للمطورين الجدد: متستهونش بقراءة الـ error message كامل قبل ما تروح تبحث في جوجل. ٧٠٪ من مشاكلي بتتحل بس بقراءة الرسالة كويس.",
    []
  );
  await ensurePost(
    mennah,
    "جربت النهاردة Server Components في Next.js لأول مرة في مشروع حقيقي مش تجريبي. التفكير في الـ data fetching بيتغير تمامًا، محتاج وقت أتعود عليه.",
    ["nextjs", "react"]
  );
  await ensurePost(
    youssef,
    "لو لسه بتستخدم Webpack وحابب تجرب حاجة أسرع في التطوير المحلي، Vite فرق كبير في الـ dev server startup time. الـ migration مش معقدة زي ما الناس بتتخيل.",
    ["vite", "webpack"]
  );

  console.log("\nSeeding questions & answers...");
  const q1 = await ensureQuestion(
    mennah,
    "ليه الـ Promise microtask بتتنفذ قبل setTimeout حتى لو الاتنين delay = 0؟",
    "عارف إن الـ Event Loop بيفرّق بين microtasks وmacrotasks، بس مش فاهم بالظبط ليه الترتيب بيبقى كده كل مرة. حد يقدر يشرحها بمثال بسيط؟",
    ["javascript"]
  );
  const a1 = await ensureAnswer(
    q1,
    ahmed,
    "الـ Event Loop بعد كل macrotask (زي setTimeout) بيفضل يفضّي الـ microtask queue كاملة قبل ما يروح للـ macrotask اللي بعدها. يعني الـ Promises بتتنفذ كلها الأول حتى لو setTimeout كان delay = 0، لأن الـ 0 دي بتتحول عمليًا لأقل قيمة ممكنة مش صفر فعلي، وبرضو لازم تستنى دورها كـ macrotask."
  );
  await supabase.from("questions").update({ accepted_answer_id: a1 }).eq("id", q1);

  const q2 = await ensureQuestion(
    youssef,
    "إيه الفرق العملي بين useMemo وuseCallback في React؟",
    "فاهم إن الاتنين بيعملوا caching، بس مش قادر أحدد امتى أستخدم أنهي واحد في الكود الحقيقي.",
    ["react"]
  );
  await ensureAnswer(
    q2,
    sara,
    "useMemo بيكاش قيمة (نتيجة حساب)، وuseCallback بيكاش الفنكشن نفسها (الـ reference). لو عندك computation تقيلة زي فلترة array كبير، استخدم useMemo. لو بتعدي فنكشن كـ prop لكومبوننت child بيعمل memo وعايز تمنع re-render غير ضروري، استخدم useCallback."
  );

  console.log("\nSeeding a discussion...");
  const discussion1 = await ensureDiscussion(
    mohamed,
    "هل Frontend Developer محتاج يتعلم TypeScript في 2026؟",
    "بشوف شركات كتير بقت بتطلب TypeScript كشرط أساسي مش ميزة إضافية. حد شغال بـ JavaScript عادي لسه ومعتقدش إنه محتاج يتعلمه؟ ياريت نتناقش في الموضوع من زوايا مختلفة.",
    ["typescript", "frontend"]
  );

  console.log("\nSeeding news...");
  await ensureNews(
    mennah,
    "TC39 يناقش مقترحًا جديدًا لتبسيط التعامل مع الـ Records وTuples في JavaScript",
    "المقترح لسه في مراحله المبكرة (Stage 1)، بيهدف لإضافة بيانات غير قابلة للتعديل (immutable) بشكل أصلي في اللغة من غير الحاجة لمكتبات خارجية زي Immutable.js.",
    "https://github.com/tc39/proposals",
    "TC39 Proposals",
    ["ecmascript", "tc39"]
  );
  await ensureNews(
    ahmed,
    "Vite تواصل تحسين أداء الـ dev server مع كل إصدار جديد",
    "فريق Vite بيركز في آخر التحديثات على تقليل وقت الـ cold start للمشاريع الكبيرة، وتحسين التوافق مع مكتبات الـ CSS الحديثة.",
    "https://vitejs.dev/blog/",
    "Vite Blog",
    ["vite", "performance"]
  );

  console.log("\nSeeding interview experiences...");
  await ensureInterview(
    mohamed,
    "Vodafone",
    "Frontend Developer",
    "junior",
    "medium",
    ["HR", "JavaScript Screening", "React Technical", "Culture Fit"],
    [
      "اشرح الـ Event Loop خطوة بخطوة",
      "إيه الفرق بين == و===؟",
      "إزاي بيشتغل الـ Virtual DOM في React؟",
      "اكتب فنكشن debounce من غير مكتبات",
    ],
    "التجربة كانت منظمة كويس، أربع مراحل على مدار أسبوعين. أصعب حاجة كانت الجزء التقني في الـ React لأنهم ركزوا على الفهم العميق مش بس الاستخدام. المقابلة الأخيرة كانت أقرب لمحادثة عادية عن أسلوب العمل والفريق."
  );
  await ensureInterview(
    sara,
    "شركة ناشئة (Fintech)",
    "Backend Developer",
    "mid",
    "hard",
    ["Take-home Task", "System Design", "Live Coding", "Final with CTO"],
    [
      "صمّم نظام لمعالجة المدفوعات يتحمل آلاف الطلبات في الثانية",
      "إزاي تتعامل مع الـ race conditions في قاعدة البيانات؟",
      "ليه اخترت Node.js في الـ take-home task بتاعك؟",
    ],
    "أصعب انترفيو خضته لحد دلوقتي. الـ take-home task أخد مني يومين كاملين، وبعدين جه الـ System Design اللي كان صعب لأنهم بيدققوا في كل قرار بتاخده وبيسألوك ليه. نصيحتي: جهّز نفسك كويس على الـ trade-offs مش بس الحل النهائي."
  );

  console.log("\nSeeding follows...");
  await ensureFollow(ahmed, sara);
  await ensureFollow(ahmed, mohamed);
  await ensureFollow(sara, ahmed);
  await ensureFollow(mennah, ahmed);
  await ensureFollow(mennah, sara);
  await ensureFollow(youssef, ahmed);
  await ensureFollow(youssef, mennah);
  await ensureFollow(mohamed, ahmed);

  console.log("\nSeeding a few likes/votes so counts don't read as zero everywhere...");
  await ensureVote(sara, "post", post1);
  await ensureVote(mohamed, "post", post1);
  await ensureVote(mennah, "post", post1);
  await ensureVote(ahmed, "question", q1);
  await ensureVote(sara, "question", q1);
  await ensureVote(mohamed, "question", q1);
  await ensureVote(mennah, "discussion", discussion1);
  await ensureVote(youssef, "discussion", discussion1, "up");

  console.log("\nDone. Refresh the site — the feed, questions, discussions, news, and interviews sections should all have content now.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
