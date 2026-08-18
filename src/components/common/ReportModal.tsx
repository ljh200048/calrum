import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { createReport } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { ReportTargetType } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  '부적절한 홍보 또는 광고성 글',
  '욕설, 비방 또는 혐오 표현',
  '허위사실 유포 또는 명예훼손',
  '저작권 침해 또는 무단 전재',
  '음란성 또는 청소년 유해 콘텐츠',
  '기타 부적절한 사유',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('신고는 로그인 후 이용하실 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await createReport(
        currentUser.uid,
        currentUser.email || undefined,
        targetType,
        targetId,
        targetTitle,
        selectedReason,
        detail
      );
      setCompleted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Report submission failed:', err);
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-stone-900">
            <Flag className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-base font-serif-kr">
              {targetType === 'article' ? '칼럼 신고' : '댓글 신고'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <p className="font-bold text-stone-900 mb-1">신고가 정상 접수되었습니다.</p>
            <p className="text-xs text-stone-500">운영팀에서 신속히 검토 후 조치하겠습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {targetTitle && (
              <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-600 truncate border border-stone-200">
                <span className="font-semibold text-stone-800">대상: </span>
                {targetTitle}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                신고 사유 선택
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                      selectedReason === r
                        ? 'border-stone-900 bg-stone-50 font-semibold text-stone-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                상세 설명 (선택)
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="구체적인 정황이나 사유를 적어주시면 검토에 도움이 됩니다."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                {submitting ? '접수 중...' : '신고 접수하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
