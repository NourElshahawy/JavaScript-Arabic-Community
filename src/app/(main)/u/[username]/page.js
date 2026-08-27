import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Link2, Globe, Calendar, MessageSquareText, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import {
  getProfileByUsername,
  getPostsByAuthor,
  getQuestionsByAuthor,
  getDiscussionsByAuthor,
  getAnswersByAuthor,
} from "@/lib/data/profiles";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { QuestionCard } from "@/components/post/QuestionCard";
import { DiscussionCard } from "@/components/post/DiscussionCard";
import { EmptyState } from "@/components/ui/States";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { FollowButton } from "@/components/profile/FollowButton";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { timeAgo } from "@/lib/format";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { profile } = await getProfileByUsername(supabase, params.username);
  if (!profile) return {};
  return {
    title: profile.full_name,
    description: profile.bio || `الملف الشخصي لـ ${profile.full_name} على JavaScript Arabic Community`,
  };
}

const JOIN_DATE_FORMAT = new Intl.DateTimeFormat("ar", { year: "numeric", month: "long" });

const TABS = [
  { key: "posts", label: "المنشورات" },
  { key: "questions", label: "الأسئلة" },
  { key: "answers", label: "الإجابات" },
  { key: "discussions", label: "النقاشات" },
];

export default async function ProfilePage({ params, searchParams }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { profile } = await getProfileByUsername(supabase, params.username, { viewerId: user?.id });

  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.id;
  const tab = TABS.some((t) => t.key === searchParams?.tab) ? searchParams.tab : "posts";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="card profile-header">
        <div className="profile-header__top">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
          <div className="profile-header__names">
            <h1>{profile.full_name}</h1>
            <span className="post__author-username ltr">@{profile.username}</span>
          </div>
          <div className="profile-header__actions">
            {isOwnProfile ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm">
                  تعديل الملف الشخصي
                </Button>
              </Link>
            ) : (
              <FollowButton targetUserId={profile.id} initialFollowing={profile.isFollowedByViewer} isAuthenticated={!!user} />
            )}
          </div>
        </div>

        {profile.bio ? <p style={{ color: "var(--color-text)" }}>{profile.bio}</p> : null}

        <ProfileBadges badges={profile.badges} />

        <div className="profile-links">
          {profile.location ? (
            <span className="profile-links__item">
              <MapPin size={14} /> {profile.location}
            </span>
          ) : null}
          {profile.github_url ? (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="profile-links__item ltr">
              <Link2 size={14} /> GitHub
            </a>
          ) : null}
          {profile.linkedin_url ? (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="profile-links__item ltr">
              <Link2 size={14} /> LinkedIn
            </a>
          ) : null}
          {profile.website_url ? (
            <a href={profile.website_url} target="_blank" rel="noreferrer" className="profile-links__item ltr">
              <Globe size={14} /> Website
            </a>
          ) : null}
          <span className="profile-links__item">
            <Calendar size={14} /> انضم في {JOIN_DATE_FORMAT.format(new Date(profile.created_at))}
          </span>
        </div>

        <div className="profile-stats">
          <div className="profile-stats__item">
            <span className="profile-stats__value">{profile.reputation}</span>
            <span className="profile-stats__label">النقاط</span>
          </div>
          <div className="profile-stats__item">
            <span className="profile-stats__value">{profile.followersCount}</span>
            <span className="profile-stats__label">متابِع</span>
          </div>
          <div className="profile-stats__item">
            <span className="profile-stats__value">{profile.followingCount}</span>
            <span className="profile-stats__label">يتابع</span>
          </div>
          <div className="profile-stats__item">
            <span className="profile-stats__value">{profile.postsCount}</span>
            <span className="profile-stats__label">منشور</span>
          </div>
        </div>
      </div>

      <div>
        <SectionTabs basePath={`/u/${profile.username}`} param="tab" current={tab} tabs={TABS} label="محتوى المستخدم" />
        <ProfileTabContent supabase={supabase} profileId={profile.id} tab={tab} userId={user?.id} />
      </div>
    </div>
  );
}

async function ProfileTabContent({ supabase, profileId, tab, userId }) {
  if (tab === "questions") {
    const { questions } = await getQuestionsByAuthor(supabase, profileId);
    if (!questions.length) return <EmptyState icon={MessageSquareText} title="لا توجد أسئلة بعد" />;
    return questions.map((q) => <QuestionCard key={q.id} question={q} />);
  }

  if (tab === "discussions") {
    const { discussions } = await getDiscussionsByAuthor(supabase, profileId);
    if (!discussions.length) return <EmptyState icon={MessageSquareText} title="لا توجد نقاشات بعد" />;
    return discussions.map((d) => <DiscussionCard key={d.id} discussion={d} />);
  }

  if (tab === "answers") {
    const { answers } = await getAnswersByAuthor(supabase, profileId);
    if (!answers.length) return <EmptyState icon={MessageSquareText} title="لا توجد إجابات بعد" />;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {answers.map((a) => (
          <Link key={a.id} href={`/questions/${a.question?.id}`} className="card" style={{ display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
              {a.is_accepted ? <CheckCircle2 size={14} style={{ color: "var(--color-accept)" }} /> : null}
              <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>{a.question?.title}</span>
              <span className="post__meta" style={{ marginInlineStart: "auto" }}>
                {timeAgo(a.created_at)}
              </span>
            </div>
            <p className="post__body" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {a.body}
            </p>
          </Link>
        ))}
      </div>
    );
  }

  const { posts } = await getPostsByAuthor(supabase, profileId, { userId });
  if (!posts.length) return <EmptyState icon={MessageSquareText} title="لا توجد منشورات بعد" />;
  return posts.map((post) => <PostCard key={post.id} post={post} isAuthenticated={!!userId} />);
}
