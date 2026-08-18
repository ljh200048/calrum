import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Feather, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createArticle } from '../services/articleService';
import { ArticleEditor } from '../components/article/ArticleEditor';

export const WriteArticle: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: {
    title: string;
    subtitle: string;
    content: string;
    coverImage: string;
    categoryId: string;
    categoryName: string;
    tags: string[];
    status: 'draft' | 'published';
  }) => {
    if (!currentUser || !userProfile) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const created = await createArticle({
        ...data,
        authorId: currentUser.uid,
        authorName: userProfile.nickname || currentUser.displayName || '칼럼니스트',
        authorPhotoURL: userProfile.photoURL || currentUser.photoURL || undefined,
        authorBio: userProfile.bio,
      });

      alert(
        data.status === 'published'
          ? '칼럼이 성공적으로 발행되었습니다!'
          : '칼럼이 임시저장되었습니다.'
      );

      navigate(`/articles/${created.id}`);
    } catch (err) {
      console.error('Failed to create article:', err);
      alert('칼럼 저장 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-stone-900 mb-2">
        <Feather className="w-5 h-5" />
        <h1 className="font-serif-kr text-2xl font-bold">새 칼럼 작성</h1>
      </div>
      <p className="text-xs text-stone-500 mb-6">
        독자들과 나눌 깊이 있는 생각과 사유를 에디터에 담아주세요.
      </p>

      <ArticleEditor onSave={handleSave} isLoading={loading} />
    </div>
  );
};
