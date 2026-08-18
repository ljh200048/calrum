import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, ChevronLeft } from 'lucide-react';
import { Article } from '../types';
import { getArticleById, updateArticle } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import { ArticleEditor } from '../components/article/ArticleEditor';
import { LoadingSpinner } from '../components/common/Loading';

export const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(id);
        if (!data) {
          alert('존재하지 않는 칼럼입니다.');
          navigate('/articles');
          return;
        }

        // Check ownership or admin
        if (currentUser?.uid !== data.authorId && !isAdmin) {
          alert('수정 권한이 없습니다.');
          navigate(`/articles/${id}`);
          return;
        }

        setArticle(data);
      } catch (err) {
        console.error('Failed to load article for edit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, currentUser, isAdmin]);

  const handleUpdate = async (data: {
    title: string;
    subtitle: string;
    content: string;
    coverImage: string;
    categoryId: string;
    categoryName: string;
    tags: string[];
    status: 'draft' | 'published';
  }) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateArticle(id, data);
      alert('칼럼이 성공적으로 수정되었습니다.');
      navigate(`/articles/${id}`);
    } catch (err) {
      console.error('Failed to update article:', err);
      alert('수정 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="칼럼 데이터를 불러오는 중입니다..." />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-stone-900">
          <Edit3 className="w-5 h-5" />
          <h1 className="font-serif-kr text-2xl font-bold">칼럼 수정하기</h1>
        </div>
        <button
          onClick={() => navigate(`/articles/${article.id}`)}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> 칼럼으로 돌아가기
        </button>
      </div>

      <ArticleEditor
        initialData={article}
        onSave={handleUpdate}
        isLoading={saving}
      />
    </div>
  );
};
