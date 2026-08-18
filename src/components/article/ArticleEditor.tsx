import React, { useState, useEffect, useRef } from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Sparkles,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import { Article, Category } from '../../types';
import { getCategories } from '../../services/categoryService';
import { SAMPLE_COVER_PRESETS } from '../../config/constants';

interface ArticleEditorProps {
  initialData?: Partial<Article>;
  onSave: (data: {
    title: string;
    subtitle: string;
    content: string;
    coverImage: string;
    categoryId: string;
    categoryName: string;
    tags: string[];
    status: 'draft' | 'published';
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialData,
  onSave,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      const list = await getCategories();
      setCategories(list);
      if (!categoryId && list.length > 0) {
        setCategoryId(list[0].id);
      }
    };
    fetchCats();
  }, []);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const insertTextAtCursor = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || '텍스트'}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : '텍스트'.length)
      );
    }, 50);
  };

  const handleAction = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('칼럼 제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      alert('칼럼 본문 내용을 작성해 주세요.');
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const categoryName = currentCat ? currentCat.name : '일반';

    await onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || SAMPLE_COVER_PRESETS[0].url,
      categoryId: categoryId || 'society',
      categoryName,
      tags,
      status,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !previewMode
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            에디터
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              previewMode
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            미리보기
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAction('draft')}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors shadow-2xs"
          >
            임시저장
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAction('published')}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
          >
            {isLoading ? '발행 중...' : '칼럼 발행하기'}
          </button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Layout */
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-xs">
          <div className="max-w-2xl mx-auto">
            {coverImage && (
              <div className="aspect-16/9 rounded-xl overflow-hidden mb-8 bg-stone-100">
                <img
                  src={coverImage}
                  alt="대표 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-8">
              <span className="inline-block text-xs font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded mb-3">
                {categories.find((c) => c.id === categoryId)?.name || '카테고리'}
              </span>
              <h1 className="font-serif-kr text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mb-3">
                {title || '칼럼 제목이 여기에 표시됩니다'}
              </h1>
              {subtitle && (
                <p className="text-lg text-stone-600 leading-relaxed font-light">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="article-prose border-t border-stone-100 pt-8 whitespace-pre-wrap">
              {content || '본문 내용이 작성되지 않았습니다.'}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-stone-100">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Layout */
        <div className="space-y-6">
          {/* Metadata Section: Category & Cover Image */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  카테고리 선택
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} — {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    대표 커버 이미지 URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-stone-600" />
                    추천 커버 선택
                  </button>
                </div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Curated Presets Drawer */}
            {showPresets && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-xs font-bold text-stone-700 mb-3">
                  칼럼 분위기에 맞는 고화질 에디토리얼 프리셋:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {SAMPLE_COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset.url);
                        setShowPresets(false);
                      }}
                      className="group text-left aspect-4/3 rounded-lg overflow-hidden relative border border-stone-200 hover:ring-2 hover:ring-stone-900 transition-all"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 font-medium text-center truncate backdrop-blur-xs">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Subtitle Section */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="칼럼 제목을 입력하세요"
                className="w-full font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none border-b border-transparent focus:border-stone-200 pb-2"
              />
            </div>
            <div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제목 또는 한 줄 요약을 입력하세요 (선택)"
                className="w-full text-sm sm:text-base text-stone-600 placeholder:text-stone-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Editor Body & Toolbar */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-stone-50 border-b border-stone-200 text-stone-700">
              <button
                type="button"
                onClick={() => insertTextAtCursor('## ')}
                title="소제목 (H2)"
                className="p-1.5 hover:bg-stone-200 rounded text-xs font-semibold"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('### ')}
                title="소제목 (H3)"
                className="p-1.5 hover:bg-stone-200 rounded text-xs font-semibold"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-stone-300 mx-1" />
              <button
                type="button"
                onClick={() => insertTextAtCursor('**', '**')}
                title="굵게"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('*', '*')}
                title="기울임"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('> ')}
                title="인용문"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <Quote className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-stone-300 mx-1" />
              <button
                type="button"
                onClick={() => insertTextAtCursor('- ')}
                title="글머리 기호 목록"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('1. ')}
                title="번호 매기기 목록"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n---\n')}
                title="구분선"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-stone-300 mx-1" />
              <button
                type="button"
                onClick={() => {
                  const url = prompt('링크 URL을 입력하세요:');
                  if (url) insertTextAtCursor('[', `](${url})`);
                }}
                title="링크 삽입"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('이미지 URL을 입력하세요:');
                  if (url) insertTextAtCursor(`\n![이미지 설명](${url})\n`);
                }}
                title="이미지 삽입"
                className="p-1.5 hover:bg-stone-200 rounded"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content Textarea */}
            <div className="p-6">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="깊이 있는 사유와 경험을 칼럼으로 작성해 보세요. Markdown 문법(## 제목, > 인용구 등)을 지원합니다."
                rows={18}
                className="w-full article-prose text-stone-800 placeholder:text-stone-300 focus:outline-none resize-y min-h-[380px]"
              />
            </div>
          </div>

          {/* Tags section */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-4 h-4 text-stone-700" />
              <label className="text-xs font-bold text-stone-700">
                태그 입력 (Enter 키 또는 쉼표로 추가)
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-stone-200 rounded-lg focus-within:ring-1 focus-within:ring-stone-900 bg-stone-50/50">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs bg-white border border-stone-300 text-stone-800 px-2.5 py-1 rounded-full font-medium shadow-2xs"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "예: 인공지능, 미래기술, 에세이" : "추가 태그 입력"}
                className="text-xs bg-transparent focus:outline-none flex-1 min-w-[140px] p-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
