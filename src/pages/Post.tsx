import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

type WPPost = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
};

const Post: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/wp-json/wp/v2/posts/${id}?_embed`);
        setPost(data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="card">Φόρτωση…</div>;
  if (!post) return <div className="card">Δεν βρέθηκε άρθρο.</div>;

  return (
    <article className="card">
      <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <div className="muted">{new Date(post.date).toLocaleString()}</div>
      <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </article>
  );
};

export default Post;
