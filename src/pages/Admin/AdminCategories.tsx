import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { Category } from '../../types';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '../../services/categoryService';
import { LoadingSpinner } from '../../components/common/Loading';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      const created = await addCategory(newName.trim(), newDesc.trim(), categories.length + 1);
      setCategories([...categories, created]);
      setNewName('');
      setNewDesc('');
      setShowAddModal(false);
      alert('새 카테고리가 추가되었습니다.');
    } catch (err) {
      console.error('Add category error:', err);
      alert('카테고리 추가 중 오류가 발생했습니다.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setUpdating(true);
    try {
      await updateCategory(editingCategory.id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: editName.trim(), description: editDesc.trim() }
            : c
        )
      );
      setEditingCategory(null);
      alert('카테고리가 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('Update category error:', err);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTargetId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Delete category error:', err);
      alert('카테고리 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    setLoading(true);
    try {
      await seedDefaultCategories();
      await loadCategories();
      alert('기본 카테고리 10종이 Firestore에 성공적으로 등록되었습니다.');
    } catch (err) {
      console.error('Seed categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
        <h2 className="font-serif-kr text-base font-bold text-stone-900">
          칼럼 주제 및 카테고리 관리
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDefaults}
            className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> 기본 카테고리 초기화
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> 새 카테고리 추가
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="카테고리 목록을 불러오는 중입니다..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 font-mono">
                      #{(cat.order || idx + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="font-serif-kr text-base font-bold text-stone-900">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                    {cat.id}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {cat.description || '설명이 등록되지 않았습니다.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-stone-100">
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setEditName(cat.name);
                    setEditDesc(cat.description || '');
                  }}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 text-xs flex items-center gap-1 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" /> 수정
                </button>
                <button
                  onClick={() => setDeleteTargetId(cat.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 text-xs flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-kr text-base font-bold text-stone-900 mb-4">
              새 카테고리 생성
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  카테고리명
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 인문·철학"
                  required
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  카테고리 소개 / 설명
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="카테고리의 주제 방향과 설명을 적어주세요."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                >
                  {adding ? '추가 중...' : '카테고리 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-kr text-base font-bold text-stone-900 mb-4">
              카테고리 정보 수정 ({editingCategory.id})
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  카테고리명
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  카테고리 설명
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                >
                  {updating ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="카테고리 삭제"
        message="이 카테고리를 삭제하시겠습니까? 기존 칼럼들의 카테고리 정보가 유실되지 않도록 주의해 주세요."
        confirmText="삭제하기"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
