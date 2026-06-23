'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchAPI } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Tag, 
  DollarSign,
  Activity,
  History,
  Calendar,
  Layers,
  Wrench,
  AlertCircle,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  subCategories?: CategoryNode[];
}

interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: string;
  status: 'AVAILABLE' | 'IN_MAINTENANCE' | 'DEPLOYED' | 'RETIRED';
  description: string;
  specifications: any;
  workingPrinciple: string;
  purchaseDate: string;
  warrantyExpiry: string;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  imageUrl?: string;
}

interface InventoryLog {
  id: string;
  action: string;
  remarks: string | null;
  performedAt: string;
}

export default function CatalogPage() {
  const { addItem } = useCart();
  
  // Data States
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceLogs, setDeviceLogs] = useState<InventoryLog[]>([]);
  
  // Pagination & Filters States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Categories Tree
  const fetchCategories = async () => {
    try {
      const data = await fetchAPI('/categories?tree=true');
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch categories.');
    }
  };

  // Fetch Devices Catalog
  const fetchDevices = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=9`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategoryId) query += `&categoryId=${selectedCategoryId}`;
      if (status) query += `&status=${status}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;

      const res = await fetchAPI(`/devices${query}`);
      setDevices(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load devices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [page, selectedCategoryId, status]);

  // Fetch logs when opening a device
  const fetchDeviceLogs = async (deviceId: string) => {
    setLogsLoading(true);
    try {
      const data = await fetchAPI(`/inventory-logs?deviceId=${deviceId}&limit=100`);
      // Sometimes it returns pagination structure, check if array or object
      setDeviceLogs(data.data || data || []);
    } catch (err) {
      console.error('Failed to load device logs', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    fetchDeviceLogs(device.id);
  };

  const handleAddToCart = (device: Device) => {
    addItem({
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      price: Number(device.price),
      imageUrl: device.imageUrl,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDevices();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategoryId('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const getStatusColor = (deviceStatus: string) => {
    switch (deviceStatus) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30';
      case 'IN_MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/30';
      case 'DEPLOYED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30';
      case 'RETIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700/30';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Render categories tree nodes recursively
  const renderCategoryNode = (node: CategoryNode, depth = 0) => {
    const isSelected = selectedCategoryId === node.id;
    return (
      <div key={node.id} style={{ paddingLeft: `${depth * 12}px` }}>
        <button
          onClick={() => {
            setSelectedCategoryId(node.id);
            setPage(1);
          }}
          className={`flex items-center space-x-2 w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            isSelected
              ? 'bg-brand-blue text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-brand-pale/25 dark:hover:bg-gray-800/50 hover:text-brand-dark dark:hover:text-white'
          }`}
        >
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
          <span className="truncate">{node.name}</span>
        </button>
        {node.subCategories && node.subCategories.length > 0 && (
          <div className="mt-1 space-y-1">
            {node.subCategories.map(sub => renderCategoryNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-pale/5 dark:bg-[#080d19]">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row lg:space-x-8">
        
        {/* Sidebar for Categories & Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6 mb-6 lg:mb-0">
          {/* Categories Sidebar Box */}
          <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-dark dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Layers className="w-4.5 h-4.5 text-brand-blue" />
              <span>Categories</span>
            </h3>
            
            <div className="space-y-1.5 max-h-72 lg:max-h-none overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategoryId('');
                  setPage(1);
                }}
                className={`flex items-center space-x-2 w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategoryId === ''
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-brand-pale/25 dark:hover:bg-gray-800/50 hover:text-brand-dark'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </button>
              
              {categories.map(node => renderCategoryNode(node, 0))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Filter className="w-4.5 h-4.5 text-brand-blue" />
                <span>Filter Options</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xxs font-bold text-brand-blue hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Any Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="IN_MAINTENANCE">In Maintenance</option>
                <option value="DEPLOYED">Deployed</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Price Range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setPage(1);
                  fetchDevices();
                }}
                className="w-full bg-brand-pale/35 dark:bg-brand-dark/20 text-brand-dark dark:text-white text-xs font-bold py-2 rounded-xl border border-brand-pale hover:bg-brand-blue hover:text-white transition-all"
              >
                Apply Price
              </button>
            </div>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <section className="flex-1 space-y-6">
          {/* Top Search Bar */}
          <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
              <input
                type="text"
                placeholder="Search device, brand, model or SN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                Catalog Display
              </span>
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
              <span className="text-sm text-gray-500">Loading catalog inventory...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-16 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-base font-bold text-brand-dark dark:text-white">No Devices Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2">
                We couldn&apos;t discover any peripherals matches matching your queries. Adjust filters to continue.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {devices.map((device, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={device.id}
                    className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden hover:shadow-2xl shadow-brand-pale/5 hover:border-brand-blue transition-all duration-300 flex flex-col group"
                  >
                    {/* Card image container */}
                    <div className="h-44 w-full bg-gray-50 dark:bg-gray-800/30 relative flex items-center justify-center overflow-hidden border-b border-brand-pale/35 dark:border-brand-dark/20 shrink-0">
                      {device.imageUrl ? (
                        <img
                          src={device.imageUrl}
                          alt={device.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                          <Layers className="w-8 h-8 mb-1.5 stroke-[1.5]" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">No Image Available</span>
                        </div>
                      )}
                    </div>

                    {/* Header: Brand & Status */}
                    <div onClick={() => handleDeviceClick(device)} className="p-5 flex-1 space-y-4 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="text-xxs font-bold text-brand-blue tracking-wide uppercase px-2 py-0.5 bg-brand-blue/5 rounded">
                          {device.brand}
                        </span>
                        <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(device.status)}`}>
                          {device.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-brand-dark dark:text-white group-hover:text-brand-blue transition-colors leading-snug">
                          {device.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Model: {device.model}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 text-xxs text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xxs">
                          SN: {device.serialNumber}
                        </span>
                        <span>•</span>
                        <span className="flex items-center text-xxs">
                          <Tag className="w-3.5 h-3.5 mr-1" />
                          {device.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Price / Action */}
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-brand-pale/35 dark:border-brand-dark/20 flex items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-brand-dark dark:text-white">
                        ${Number(device.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(device)}
                          className="p-2 rounded-lg bg-brand-blue text-white hover:bg-brand-dark transition-colors"
                          aria-label={`Add ${device.name} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <Link href={`/devices/${device.id}`} className="text-xxs text-brand-blue font-bold hover:underline flex items-center">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-4">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="p-2 border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <span className="text-sm font-semibold text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-brand-pale dark:border-brand-dark/20 bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Device Details Modal Overlay */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDevice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/50 dark:bg-gray-900/10">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-bold text-brand-blue tracking-wide uppercase px-2 py-0.5 bg-brand-blue/5 rounded">
                      {selectedDevice.brand}
                    </span>
                    <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(selectedDevice.status)}`}>
                      {selectedDevice.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-brand-dark dark:text-white leading-tight">
                    {selectedDevice.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Model: {selectedDevice.model}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Specifications & Description */}
                <div className="space-y-6">
                  {/* Device Image */}
                  {selectedDevice.imageUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#1f2937] border border-brand-pale/35 dark:border-brand-dark/10 relative">
                      <img
                        src={selectedDevice.imageUrl}
                        alt={selectedDevice.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Basic Metadata */}
                  <div className="bg-gray-50 dark:bg-gray-800/40 border border-brand-pale/35 dark:border-brand-dark/10 rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Serial Number</p>
                      <p className="text-xs font-semibold text-brand-dark dark:text-white mt-1 font-mono">{selectedDevice.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider">Purchase Price</p>
                      <p className="text-xs font-semibold text-brand-dark dark:text-white mt-1">
                        ${Number(selectedDevice.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        <span>Purchase Date</span>
                      </p>
                      <p className="text-xs font-semibold text-brand-dark dark:text-white mt-1">
                        {new Date(selectedDevice.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xxs text-gray-400 font-bold uppercase tracking-wider flex items-center">
                        <Wrench className="w-3.5 h-3.5 mr-1" />
                        <span>Warranty Expiry</span>
                      </p>
                      <p className="text-xs font-semibold text-brand-dark dark:text-white mt-1">
                        {new Date(selectedDevice.warrantyExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <Info className="w-4 h-4 mr-1 text-brand-blue" />
                      <span>Description</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-brand-pale/5 p-3 rounded-xl border border-brand-pale/20">
                      {selectedDevice.description}
                    </p>
                  </div>

                  {/* Specifications JSON Grid */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <SlidersHorizontal className="w-4 h-4 mr-1 text-brand-blue" />
                      <span>Specifications</span>
                    </h4>
                    <div className="border border-brand-pale/30 dark:border-brand-dark/20 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedDevice.specifications && Object.keys(selectedDevice.specifications).length > 0 ? (
                        Object.keys(selectedDevice.specifications).map((key) => (
                          <div key={key} className="flex justify-between items-center p-3 text-xs">
                            <span className="capitalize text-gray-500 font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-bold text-brand-dark dark:text-white text-right">
                              {typeof selectedDevice.specifications[key] === 'object' 
                                ? JSON.stringify(selectedDevice.specifications[key]) 
                                : String(selectedDevice.specifications[key])}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 italic">
                          No custom specifications defined.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Working Principle & Audit Logs */}
                <div className="space-y-6">
                  {/* Working Principle */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <Activity className="w-4 h-4 mr-1 text-brand-blue animate-pulse" />
                      <span>Working Principle</span>
                    </h4>
                    <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-brand-pale/5 p-4 rounded-xl border border-brand-pale/25 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedDevice.workingPrinciple}
                    </div>
                  </div>

                  {/* Inventory Logs Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <History className="w-4 h-4 mr-1 text-brand-blue" />
                      <span>Inventory Audit Logs</span>
                    </h4>
                    
                    {logsLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                      </div>
                    ) : deviceLogs.length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-400 italic border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        No audit actions logged for this device.
                      </div>
                    ) : (
                      <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 space-y-4 max-h-60 overflow-y-auto pr-1">
                        {deviceLogs.map((log) => (
                          <div key={log.id} className="text-xs relative">
                            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-brand-blue ring-4 ring-white dark:ring-gray-900" />
                            <div className="flex justify-between items-center text-xxs text-gray-400">
                              <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xxs tracking-wide font-bold text-gray-500">
                                {log.action.toUpperCase()}
                              </span>
                              <span>{new Date(log.performedAt).toLocaleDateString()}</span>
                            </div>
                            {log.remarks && (
                              <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium italic">
                                &quot;{log.remarks}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex justify-end">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="bg-brand-pale hover:bg-brand-light text-brand-dark font-bold py-2 px-5 rounded-xl text-xs transition-colors"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
