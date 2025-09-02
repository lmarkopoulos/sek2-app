import React, { useEffect, useState } from 'react';
import { fetchCategoryBySlug, fetchPostsByCategoryId } from '../services/api';

type WPPost = {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
};

const News: React.FC = () => {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const slug = process.env.REACT_APP_NEWS_CATEGORY_SLUG || 'private-news';

  useEffect(() => {
    (async () => {
      try {
        const cat = await fetchCategoryBySlug(slug);
        if (cat?.id) setPosts(await fetchPostsByCategoryId(cat.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="card">Φόρτωση ειδήσεων…</div>;

  return (
    <div className="news-page">
      <h2>Πληροφόρηση</h2>
      <div className="grid">
        {posts.map((post) => (
          <article key={post.id} className="card">
            <h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <div
              className="muted"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
            <a
              className="btn btn-outline"
              href={post.link}
              target="_blank"
              rel="noreferrer"
            >
              Άνοιγμα
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;
