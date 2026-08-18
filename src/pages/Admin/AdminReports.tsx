import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { Report, ReportStatus } from '../../types';
import { getReports, updateReportStatus } from '../../services/reportService';
import { formatDate } from '../../components/article/ArticleCard';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await getReports();
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleStatusUpdate = async (reportId: string, status: ReportStatus) => {
    try {
      await updateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      alert(`신고가 [${status === 'resolved' ? '처리 완료' : '기각'}] 상태로 변경되었습니다.`);
    } catch (err) {
      console.error('Report update failed:', err);
      alert('신고 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const filtered = reports.filter(
    (r) => statusFilter === 'all' || r.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
        <h2 className="font-serif-kr text-base font-bold text-stone-900">
          이용자 신고 접수 및 조치 내역
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">상태 필터:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-stone-200 font-semibold text-stone-800 bg-white"
          >
            <option value="all">전체</option>
            <option value="pending">대기 중 (pending)</option>
            <option value="resolved">처리 완료 (resolved)</option>
            <option value="dismissed">기각 (dismissed)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="신고 목록을 불러오는 중입니다..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
          접수된 신고 내역이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">신고 유형 / 대상</th>
                  <th className="py-3.5 px-4 font-semibold">신고 사유</th>
                  <th className="py-3.5 px-4 font-semibold">상세 내용</th>
                  <th className="py-3.5 px-4 font-semibold">신고자</th>
                  <th className="py-3.5 px-4 font-semibold">접수일</th>
                  <th className="py-3.5 px-4 font-semibold">처리 상태</th>
                  <th className="py-3.5 px-4 font-semibold text-right">조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block">
                        {rep.targetType === 'article' ? '칼럼' : '댓글'}
                      </span>
                      {rep.targetType === 'article' && (
                        <Link
                          to={`/articles/${rep.targetId}`}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> 칼럼 확인
                        </Link>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {rep.reason}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-stone-600 truncate">
                      {rep.detail || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {rep.reporterEmail || '익명'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {formatDate(rep.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.status === 'pending'
                            ? 'bg-red-100 text-red-700'
                            : rep.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {rep.status === 'pending'
                          ? '대기 중'
                          : rep.status === 'resolved'
                          ? '처리 완료'
                          : '기각됨'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {rep.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusUpdate(rep.id, 'resolved')}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold"
                          >
                            조치 완료
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(rep.id, 'dismissed')}
                            className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-[10px] font-semibold"
                          >
                            기각
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
