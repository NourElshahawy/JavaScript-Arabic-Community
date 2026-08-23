import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Link2, Globe, Calendar, MessageSquareText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getProfileByUsername, getPostsByAuthor } from "@/lib/data/profiles";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { EmptyState } from "@/components/ui/States";
import { FollowButton } from "@/components/profile/FollowButton";
import { ProfileBadges } from "@/components/profile/ProfileBadges";

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

export default async function ProfilePage({ params }) {
  const supabase = await createClient();
  const { user } = await getCurrentUser();
  const { profile } = await getProfileByUsername(supabase, params.username, { viewerId: user?.id });

  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.id;
  const { posts } = await getPostsByAuthor(supabase, profile.id, { userId: user?.id });

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
        <h2 style={{ marginBottom: "var(--space-3)" }}>المنشورات</h2>
        {posts.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="لا توجد منشورات بعد" />
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} isAuthenticated={!!user} />)
        )}
      </div>
    </div>
  );
}
