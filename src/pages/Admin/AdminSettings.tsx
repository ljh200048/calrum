import React, { useState } from 'react';
import { Settings, Save, Shield, Globe, Bell, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { seedDefaultCategories } from '../../services/categoryService';
import { seedSampleArticles } from '../../services/articleService';

export const AdminSettings: React.FC = () => {
  const [platformName, setPlatformName] = useState('글결 (Geulgyeol)');
  const [siteDescription, setSiteDescription] = useState('생각을 깊게 하고, 사유를 넓히는 프리미엄 에디토리얼 칼럼 플랫폼');
  const [allowPublicRegister, setAllowPublicRegister] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [requireCommentApproval, setRequireCommentApproval] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSeedAll = async () => {
    setSeeding(true);
    try {
      await seedDefaultCategories();
      await seedSampleArticles();
      alert('기본 카테고리 및 샘플 칼럼 데이터가 성공적으로 초기화되었습니다.');
    } catch (err) {
      console.error('Seed all error:', err);
      alert('초기화 중 오류가 발생했습니다.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-kr text-lg font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-700" />
            플랫폼 환경 설정
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            사이트 기본 정보, 회원가입 정책 및 댓글 운영 정책을 설정합니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site General Info */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Globe className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              기본 사이트 정보
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                플랫폼 이름
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                사이트 소개 문구 (메타 설명)
              </label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Operating Policies */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Shield className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              운영 및 보안 정책
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-100 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={allowPublicRegister}
                onChange={(e) => setAllowPublicRegister(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <span className="font-semibold text-stone-900 block">신규 회원가입 허용</span>
                <span className="text-stone-500 text-[11px]">누구나 이메일로 가입하여 칼럼니스트로 활동할 수 있습니다.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-100 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <span className="font-semibold text-stone-900 block">칼럼 댓글 기능 활성화</span>
                <span className="text-stone-500 text-[11px]">독자들이 칼럼에 댓글과 감상평을 남길 수 있습니다.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-100 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={requireCommentApproval}
                onChange={(e) => setRequireCommentApproval(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <div>
                <span className="font-semibold text-stone-900 block">댓글 사전 승인제</span>
                <span className="text-stone-500 text-[11px]">작성된 댓글을 관리자가 검토 후 공개합니다 (스팸 방지).</span>
              </div>
            </label>
          </div>
        </div>

        {/* Global Banner Announcement */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Bell className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              전체 공지사항 팝업/배너
            </h3>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 text-xs mb-1">
              공지 메시지 (미입력 시 노출되지 않음)
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="예: 2026년 상반기 신진 칼럼니스트 공모전이 진행 중입니다."
              className="w-full p-2.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle className="w-4 h-4" /> 설정이 안전하게 저장되었습니다.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> 설정 저장하기
          </button>
        </div>
      </form>

      {/* Data Seed & Maintenance */}
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-10 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs font-bold text-stone-900">데이터베이스 초기화 및 유지보수</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          초기 설치 상태에서 기본 카테고리 10종과 샘플 칼럼 콘텐츠를 일괄 생성하여 테스트할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleSeedAll}
          disabled={seeding}
          className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-800 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? '생성 중...' : '기본 카테고리 및 샘플 칼럼 일괄 생성'}
        </button>
      </div>
    </div>
  );
};
