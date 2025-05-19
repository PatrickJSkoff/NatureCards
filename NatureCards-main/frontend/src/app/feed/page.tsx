"use client";

import { useEffect, useState } from "react";
import { FeedCard } from "@/components/FeedCard";
import { CardPost } from "@/types/index";
import { fetchFeedData } from "@/lib/feed";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { userState } from "@/lib/gallery";
import { useRouter } from "next/navigation";

export default function Feed() {
  const [posts, setPosts] = useState<CardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!userState.userId) {
      setError("Please log in to view your feed");
      setLoading(false);
      return;
    }

    const getFeedData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFeedData();
        setPosts(data.posts);
      } catch (error) {
        console.error("Failed to fetch feed data:", error);
        setError("Failed to load feed. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getFeedData();
  }, [router]);

  const handleRefresh = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeedData();
      setPosts(data.posts);
    } catch (error) {
      console.error("Failed to refresh feed data:", error);
      setError("Failed to refresh feed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nature Cards Feed</h1>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-500">{error}</p>
          {!userState.userId && (
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Log In
            </button>
          )}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No posts found in the feed</p>
          <p className="mt-2 text-gray-500">Try adding some friends to see their cards!</p>
        </div>
      )}
    </div>
  );
}
