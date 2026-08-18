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
  BookOpen,
  FileText,
  Lightbulb,
  Check,
  ChevronDown,
  Clock,
  Layers,
  HelpCircle,
  Cpu,
  Users,
  TrendingUp,
  Palette,
  Feather,
  Compass,
  Coffee,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { Article, Category } from '../../types';
import { getCategories } from '../../services/categoryService';
import { getCategoryGuide, CategoryWritingGuide } from '../../config/categoryWritingGuides';

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
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 'society');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Category Assistant active tab: 'none' | 'templates' | 'tips' | 'covers' | 'titles'
  const [assistantTab, setAssistantTab] = useState<'none' | 'templates' | 'tips' | 'covers' | 'titles'>('none');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      const list = await getCategories();
      setCategories(list);
      if (!initialData?.categoryId && list.length > 0 && !categoryId) {
        setCategoryId(list[0].id);
      }
    };
    fetchCats();
  }, [initialData]);

  const currentCategoryObj = categories.find((c) => c.id === categoryId) || {
    id: categoryId,
    name: categoryId === 'it-ai' ? 'IT·AI' : categoryId === 'society' ? '사회' : '일반',
    description: '칼럼 카테고리',
  };

  const guide: CategoryWritingGuide = getCategoryGuide(categoryId);

  // Helper for category icons
  const renderCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Feather':
        return <Feather className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

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

  const addRecommendedTag = (t: string) => {
    if (!tags.includes(t)) {
      setTags([...tags, t]);
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

  const handleApplyTemplate = (tpl: CategoryWritingGuide['templates'][0]) => {
    if (content.trim() && content.trim() !== tpl.content.trim()) {
      const confirmOverwrite = window.confirm(
        '기존 본문 내용이 있습니다. 템플릿으로 덮어쓰시겠습니까?\n(취소를 누르면 기존 내용 아래에 추가됩니다.)'
      );
      if (confirmOverwrite) {
        setContent(tpl.content);
      } else {
        setContent((prev) => prev + '\n\n' + tpl.content);
      }
    } else {
      setContent(tpl.content);
    }

    if (!title) {
      setTitle(tpl.titlePlaceholder);
    }
    if (!subtitle) {
      setSubtitle(tpl.subtitlePlaceholder);
    }

    setAssistantTab('none');
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
    const categoryName = currentCat ? currentCat.name : guide.name;

    const fallbackCover =
      guide.recommendedCovers?.[0]?.url ||
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80';

    await onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || fallbackCover,
      categoryId: categoryId || 'society',
      categoryName,
      tags,
      status,
    });
  };

  // Stats calculation
  const charCountWithSpaces = content.length;
  const charCountNoSpaces = content.replace(/\s+/g, '').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
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

          <div className="h-4 w-[1px] bg-stone-200 mx-1 hidden sm:block" />

          {/* Quick word count in top bar */}
          <span className="text-[11px] text-stone-500 hidden sm:inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            예상 읽기 {estimatedReadingMinutes}분 ({charCountNoSpaces}자)
          </span>
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
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 bg-stone-100 px-3 py-1 rounded-md mb-3">
                {renderCategoryIcon(guide.iconName, 'w-3 h-3')}
                {currentCategoryObj.name}
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
          {/* Category Hero & Assistant Header */}
          <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                    칼럼 카테고리
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-stone-600" />
                  <span className="text-[11px] text-stone-300">
                    독자 대상: {guide.targetAudience}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    {renderCategoryIcon(guide.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif-kr text-white flex items-center gap-2">
                      <span>[{guide.name}]</span>
                      <span className="text-sm font-sans font-normal text-stone-300">
                        {guide.tagline}
                      </span>
                    </h2>
                  </div>
                </div>
              </div>

              {/* Category selector dropdown & guide toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-stone-300" />
                    <span>카테고리 변경</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white text-stone-900 rounded-xl shadow-lg border border-stone-200 p-2 z-30 space-y-1 max-h-72 overflow-y-auto">
                      <div className="px-2 py-1 text-[11px] font-bold text-stone-400">
                        카테고리 선택
                      </div>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            categoryId === cat.id
                              ? 'bg-stone-900 text-white font-semibold'
                              : 'hover:bg-stone-100 text-stone-800'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{cat.name}</p>
                            <p
                              className={`text-[10px] truncate max-w-[170px] ${
                                categoryId === cat.id ? 'text-stone-300' : 'text-stone-500'
                              }`}
                            >
                              {cat.description}
                            </p>
                          </div>
                          {categoryId === cat.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Assistant Action Pills */}
            <div className="mt-4 pt-4 border-t border-stone-800 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-stone-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {guide.name} 맞춤 도우미:
              </span>
              <button
                type="button"
                onClick={() =>
                  setAssistantTab(assistantTab === 'templates' ? 'none' : 'templates')
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  assistantTab === 'templates'
                    ? 'bg-white text-stone-900 font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                추천 칼럼 템플릿 ({guide.templates.length})
              </button>
              <button
                type="button"
                onClick={() =>
                  setAssistantTab(assistantTab === 'tips' ? 'none' : 'tips')
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  assistantTab === 'tips'
                    ? 'bg-white text-stone-900 font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                작성 팁 & 가이드
              </button>
              <button
                type="button"
                onClick={() =>
                  setAssistantTab(assistantTab === 'titles' ? 'none' : 'titles')
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  assistantTab === 'titles'
                    ? 'bg-white text-stone-900 font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                제목 아이디어
              </button>
              <button
                type="button"
                onClick={() =>
                  setAssistantTab(assistantTab === 'covers' ? 'none' : 'covers')
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  assistantTab === 'covers'
                    ? 'bg-white text-stone-900 font-bold'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                추천 커버 이미지
              </button>
            </div>
          </div>

          {/* Assistant Expandable Content Panels */}
          {assistantTab === 'templates' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-700" />
                    {guide.name} 분야 추천 칼럼 템플릿
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    해당 분야 칼럼의 전형적인 기승전결과 논리적 구조를 바로 적용할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantTab('none')}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.templates.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-stone-900">{tpl.name}</h4>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                          맞춤 구조
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
                        {tpl.description}
                      </p>
                      <div className="bg-stone-50 p-2 rounded text-[11px] text-stone-500 font-mono line-clamp-3 mb-3 border border-stone-100">
                        {tpl.content}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      이 템플릿 적용하기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assistantTab === 'tips' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    {guide.name} 칼럼 작성 시 에디토리얼 팁
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    독자의 공감과 신뢰를 이끌어내는 핵심 작성 지침입니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantTab('none')}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {guide.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-stone-900">{tip.title}</h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assistantTab === 'titles' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-stone-700" />
                    {guide.name} 분야 추천 칼럼 제목 예시
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    클릭하면 현재 칼럼의 제목으로 복사 및 적용할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantTab('none')}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guide.titleExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(ex);
                      setAssistantTab('none');
                    }}
                    className="text-left bg-white p-3 rounded-xl border border-stone-200 hover:border-stone-800 hover:bg-stone-50 transition-all group"
                  >
                    <p className="text-xs font-serif-kr font-bold text-stone-900 group-hover:text-stone-900">
                      "{ex}"
                    </p>
                    <span className="text-[10px] text-stone-400 group-hover:text-stone-600 mt-1 inline-block">
                      클릭하여 제목에 적용 →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {assistantTab === 'covers' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-stone-700" />
                    {guide.name} 분야 고화질 에디토리얼 프리셋 커버
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    원하는 분위기의 사진을 선택하면 대표 이미지로 자동 등록됩니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantTab('none')}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {guide.recommendedCovers.map((cov, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverImage(cov.url);
                      setAssistantTab('none');
                    }}
                    className={`group text-left aspect-4/3 rounded-xl overflow-hidden relative border transition-all ${
                      coverImage === cov.url
                        ? 'ring-2 ring-stone-900 border-transparent'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={cov.url}
                      alt={cov.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1.5 font-medium text-center truncate backdrop-blur-xs">
                      {cov.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title & Subtitle Section */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                칼럼 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`[${guide.name}] 칼럼 제목을 입력하세요`}
                className="w-full font-serif-kr text-2xl sm:text-3xl font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none border-b border-transparent focus:border-stone-200 pb-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                부제목 및 핵심 한 줄 요약 (선택)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="칼럼의 핵심 화두나 부제목을 입력하세요"
                className="w-full text-sm sm:text-base text-stone-600 placeholder:text-stone-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Cover Image Input Section */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700">
                대표 커버 이미지 URL
              </label>
              <button
                type="button"
                onClick={() => setAssistantTab('covers')}
                className="text-[11px] text-stone-700 hover:text-stone-950 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                {guide.name} 추천 프리셋 보기
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
              />
              {coverImage && (
                <div className="w-12 h-9 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                  <img
                    src={coverImage}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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

              <div className="ml-auto flex items-center gap-3 pr-2 text-[11px] text-stone-500">
                <span>공백제외 {charCountNoSpaces}자</span>
                <span>•</span>
                <span>약 {estimatedReadingMinutes}분 분량</span>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="p-6">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`[${guide.name}] 분야의 깊이 있는 사유와 통찰을 담아주세요. 상단의 '추천 칼럼 템플릿' 버튼을 누르면 이 카테고리에 최적화된 글 구조를 자동으로 불러올 수 있습니다.`}
                rows={18}
                className="w-full article-prose text-stone-800 placeholder:text-stone-300 focus:outline-none resize-y min-h-[420px]"
              />
            </div>
          </div>

          {/* Tags section with Category Recommendations */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-stone-700" />
                <label className="text-xs font-bold text-stone-700">
                  태그 입력 (Enter 키 또는 쉼표로 추가)
                </label>
              </div>
            </div>

            {/* Recommended Tags Bar */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-stone-500 mr-1">
                {guide.name} 추천 태그:
              </span>
              {guide.popularTags.map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => addRecommendedTag(rt)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors ${
                    tags.includes(rt)
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  +{rt}
                </button>
              ))}
            </div>

            {/* Tags Input Container */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 border border-stone-200 rounded-lg focus-within:ring-1 focus-within:ring-stone-900 bg-stone-50/50">
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
                placeholder={
                  tags.length === 0
                    ? `예: ${guide.popularTags.slice(0, 3).join(', ')}`
                    : '추가 태그 입력'
                }
                className="text-xs bg-transparent focus:outline-none flex-1 min-w-[140px] p-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
