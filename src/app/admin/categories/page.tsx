'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  FolderTree, 
  X, 
  Tag, 
  Folder 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  subCategories?: CategoryNode[];
}

export default function AdminCategoriesPage() {
  const [categoriesTree, setCategoriesTree] = useState<CategoryNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);
  
  // Form Field States
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      // Fetch flat categories
      const flatData = await fetchAPI('/categories');
      setFlatCategories(Array.isArray(flatData) ? flatData : flatData.data || []);
      
      // Fetch hierarchical tree
      const treeData = await fetchAPI('/categories?tree=true');
      setCategoriesTree(treeData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setParentId('');
    setIsOpen(true);
  };

  const openEditModal = (cat: CategoryNode) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(cat.parentId || '');
    setIsOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this category? Any device associated with it will need to be reassigned.')) return;
    try {
      await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted successfully!');
      fetchCategoriesData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Prevent making a category its own parent
    if (editingCategory && parentId === editingCategory.id) {
      toast.error('A category cannot be its own parent.');
      return;
    }

    const payload = {
      name,
      parentId: parentId || null,
    };

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await fetchAPI(`/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Category updated successfully!');
      } else {
        await fetchAPI('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Category created successfully!');
      }
      setIsOpen(false);
      fetchCategoriesData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper check
  const editingDevice = () => editingCategory !== null;

  // Render tree node in admin view
  const renderAdminTree = (node: CategoryNode, depth = 0) => {
    return (
      <div key={node.id} className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-3.5 bg-gray-50/60 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all text-xs"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-1.5 bg-brand-blue/10 text-brand-blue rounded-lg">
              <Folder className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-brand-dark dark:text-white truncate">{node.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => openEditModal(node)}
              className="p-1.5 hover:bg-brand-blue/10 text-gray-400 hover:text-brand-blue rounded-lg transition-colors"
              title="Edit Category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteCategory(node.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
        
        {node.subCategories && node.subCategories.length > 0 && (
          <div className="space-y-2">
            {node.subCategories.map(sub => renderAdminTree(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Category Taxonomy Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Construct parent-child nested categories to build a clean asset taxonomy tree.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-brand-blue/15 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Main Categories Tree list */}
      <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-6 shadow-sm">
        <h4 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider mb-6 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <FolderTree className="w-4.5 h-4.5 text-brand-blue" />
          <span>Nested Category Tree</span>
        </h4>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading taxonomy tree structure...</span>
          </div>
        ) : categoriesTree.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic">
            No categories defined in database. Get started by clicking New Category.
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {categoriesTree.map(node => renderAdminTree(node, 0))}
          </div>
        )}
      </div>

      {/* Category CRUD Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
                <h3 className="text-sm font-bold text-brand-dark dark:text-white">
                  {editingDevice() ? 'Modify Category' : 'Create New Category'}
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Graphic Cards"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Parent Category (Optional)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">None (Top Level Category)</option>
                    {flatCategories
                      .filter(c => !editingDevice() || c.id !== editingCategory?.id)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-blue hover:bg-brand-dark text-white rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Category</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
