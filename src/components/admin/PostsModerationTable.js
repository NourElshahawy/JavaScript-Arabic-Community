"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";
import { Trash2 } from "lucide-react";

export function PostsModerationTable({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);

  async function handleDelete(postId) {
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <div className="card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>المحتوى</th>
            <th>الكاتب</th>
            <th>الإعجابات</th>
            <th>التعليقات</th>
            <th>الوقت</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td style={{ maxWidth: 320 }}>
                <Link href={`/posts/${post.id}`}>{post.body.slice(0, 80)}</Link>
              </td>
              <td>
                <Link href={`/u/${post.author?.username}`} className="ltr">
                  @{post.author?.username}
                </Link>
              </td>
              <td>{post.likes_count}</td>
              <td>{post.comments_count}</td>
              <td>{timeAgo(post.created_at)}</td>
              <td>
                <button className="btn btn--icon btn--sm" aria-label="حذف المنشور" onClick={() => handleDelete(post.id)}>
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
