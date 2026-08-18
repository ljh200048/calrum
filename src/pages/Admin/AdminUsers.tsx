import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, ExternalLink, Search } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { getAllUsers, updateUserRole } from '../../services/authService';
import { formatDate } from '../../components/article/ArticleCard';
import { LoadingSpinner } from '../../components/common/Loading';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers(100);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      alert('회원 권한이 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('Failed to change user role:', err);
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.nickname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="회원 닉네임 또는 이메일 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>
        <span className="text-xs font-semibold text-stone-600">
          총 {filtered.length}명의 회원
        </span>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="회원 목록을 불러오는 중입니다..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">회원 정보</th>
                  <th className="py-3.5 px-4 font-semibold">이메일</th>
                  <th className="py-3.5 px-4 font-semibold">역할 및 권한</th>
                  <th className="py-3.5 px-4 font-semibold">작성 칼럼</th>
                  <th className="py-3.5 px-4 font-semibold">가입일</th>
                  <th className="py-3.5 px-4 font-semibold text-right">프로필</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.photoURL ||
                            `https://api.dicebear.com/7.x/notionists/svg?seed=${u.uid}`
                          }
                          alt={u.nickname}
                          className="w-8 h-8 rounded-full object-cover border border-stone-300"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block">{u.nickname}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {u.uid.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    {/* Role selector */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                          u.role === 'admin'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                            : u.role === 'editor'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        <option value="user">일반 회원 (user)</option>
                        <option value="editor">에디터 (editor)</option>
                        <option value="admin">최고 관리자 (admin)</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-700">
                      {u.articleCount || 0}편
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/author/${u.uid}`}
                        className="inline-flex items-center gap-1 p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>작가 페이지</span>
                      </Link>
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
