// 'use client';

// import React, { useState, useEffect } from 'react';
// import { fetchAPI } from '@/lib/api';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   Search,
//   Loader2,
//   X,
//   SlidersHorizontal,
//   Calendar,
//   Layers,
//   Wrench,
//   DollarSign
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// interface Category {
//   id: string;
//   name: string;
// }

// interface Device {
//   id: string;
//   name: string;
//   brand: string;
//   model: string;
//   serialNumber: string;
//   price: string;
//   status: 'AVAILABLE' | 'IN_MAINTENANCE' | 'DEPLOYED' | 'RETIRED';
//   description: string;
//   specifications: any;
//   workingPrinciple: string;
//   purchaseDate: string;
//   warrantyExpiry: string;
//   categoryId: string;
//   category: { id: string; name: string };
//   createdAt: string;
//   imageUrl?: string;
// }

// export default function AdminDevicesPage() {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Search & Pagination
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Form Modal States
//   const [isOpen, setIsOpen] = useState(false);
//   const [editingDevice, setEditingDevice] = useState<Device | null>(null);

//   // Form Field States
//   const [name, setName] = useState('');
//   const [brand, setBrand] = useState('');
//   const [model, setModel] = useState('');
//   const [serialNumber, setSerialNumber] = useState('');
//   const [price, setPrice] = useState('');
//   const [status, setStatus] = useState<'AVAILABLE' | 'IN_MAINTENANCE' | 'DEPLOYED' | 'RETIRED'>('AVAILABLE');
//   const [description, setDescription] = useState('');
//   const [workingPrinciple, setWorkingPrinciple] = useState('');
//   const [purchaseDate, setPurchaseDate] = useState('');
//   const [warrantyExpiry, setWarrantyExpiry] = useState('');
//   const [categoryId, setCategoryId] = useState('');
//   const [specificationsStr, setSpecificationsStr] = useState('{\n  "color": "Black",\n  "weight": "1.2kg"\n}');
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const fetchCategoriesList = async () => {
//     try {
//       const data = await fetchAPI('/categories');
//       // Sometimes returns tree hierarchy or array. If tree, we might need a flat list. 
//       // NestJS service normally returns a flat array for /categories unless queried.
//       setCategories(Array.isArray(data) ? data : data.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchDevicesList = async () => {
//     setLoading(true);
//     try {
//       let query = `?page=${page}&limit=8`;
//       if (search) query += `&search=${encodeURIComponent(search)}`;

//       const res = await fetchAPI(`/devices${query}`);
//       setDevices(res.data);
//       setTotalPages(res.meta.totalPages || 1);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to fetch devices list.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategoriesList();
//   }, []);

//   useEffect(() => {
//     fetchDevicesList();
//   }, [page]);

//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setPage(1);
//     fetchDevicesList();
//   };

//   const openAddModal = () => {
//     setEditingDevice(null);
//     setName('');
//     setBrand('');
//     setModel('');
//     setSerialNumber('');
//     setPrice('');
//     setStatus('AVAILABLE');
//     setDescription('');
//     setWorkingPrinciple('');
//     setPurchaseDate('');
//     setWarrantyExpiry('');
//     setCategoryId(categories[0]?.id || '');
//     setSpecificationsStr('{\n  "color": "Black",\n  "weight": "1.2kg"\n}');
//     setImageFile(null);
//     setIsOpen(true);
//   };

//   const openEditModal = (device: Device) => {
//     setEditingDevice(device);
//     setName(device.name);
//     setBrand(device.brand);
//     setModel(device.model);
//     setSerialNumber(device.serialNumber);
//     setPrice(String(device.price));
//     setStatus(device.status);
//     setDescription(device.description);
//     setWorkingPrinciple(device.workingPrinciple);

//     // Format dates to YYYY-MM-DD
//     setPurchaseDate(new Date(device.purchaseDate).toISOString().split('T')[0]);
//     setWarrantyExpiry(new Date(device.warrantyExpiry).toISOString().split('T')[0]);

//     setCategoryId(device.categoryId);
//     setSpecificationsStr(JSON.stringify(device.specifications, null, 2));
//     setImageFile(null);
//     setIsOpen(true);
//   };

//   const handleDeleteDevice = async (id: string) => {
//     if (!confirm('Are you absolutely sure you want to remove this device and all its logs?')) return;
//     try {
//       await fetchAPI(`/devices/${id}`, { method: 'DELETE' });
//       toast.success('Device removed successfully!');
//       fetchDevicesList();
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to delete device.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Parse specifications
//     let specs = {};
//     try {
//       specs = JSON.parse(specificationsStr);
//     } catch (err) {
//       toast.error('Specifications must be a valid JSON object format.');
//       return;
//     }

//     if (!categoryId) {
//       toast.error('Please assign a category.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('brand', brand);
//     formData.append('model', model);
//     formData.append('serialNumber', serialNumber);
//     formData.append('price', price);
//     formData.append('status', status);
//     formData.append('description', description);
//     formData.append('specifications', JSON.stringify(specs));
//     formData.append('workingPrinciple', workingPrinciple);
//     formData.append('purchaseDate', new Date(purchaseDate).toISOString());
//     formData.append('warrantyExpiry', new Date(warrantyExpiry).toISOString());
//     formData.append('categoryId', categoryId);
//     if (imageFile) {
//       formData.append('file', imageFile);
//     }

//     setIsSubmitting(true);
//     try {
//       if (editingDevice) {
//         await fetchAPI(`/devices/${editingDevice.id}`, {
//           method: 'PATCH',
//           body: formData,
//         });
//         toast.success('Device updated successfully!');
//       } else {
//         await fetchAPI('/devices', {
//           method: 'POST',
//           body: formData,
//         });
//         toast.success('Device registered successfully!');
//       }
//       setIsOpen(false);
//       fetchDevicesList();
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to save device.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">
//             Device Inventory CRUD
//           </h1>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Create, update, inspect details, and remove active computer components.
//           </p>
//         </div>

//         <button
//           onClick={openAddModal}
//           className="bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-brand-blue/15 text-xs shrink-0"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Register Device</span>
//         </button>
//       </div>

//       {/* Search Filter */}
//       <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl p-4 shadow-sm">
//         <form onSubmit={handleSearchSubmit} className="relative max-w-md">
//           <input
//             type="text"
//             placeholder="Search by name, model, serial..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//           />
//           <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-3" />
//         </form>
//       </div>

//       {/* Datatable */}
//       <div className="bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 rounded-2xl overflow-hidden shadow-sm">
//         {loading ? (
//           <div className="flex flex-col justify-center items-center py-20 space-y-4">
//             <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
//             <span className="text-xs text-gray-400">Loading catalog inventory table...</span>
//           </div>
//         ) : devices.length === 0 ? (
//           <div className="p-16 text-center text-gray-400 italic">
//             No devices matches found in inventory database.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
//               <thead>
//                 <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px] bg-gray-50 dark:bg-gray-900/10">
//                   <th className="p-4">Asset Details</th>
//                   <th className="p-4">Serial Number</th>
//                   <th className="p-4">Category</th>
//                   <th className="p-4">Price</th>
//                   <th className="p-4">Status</th>
//                   <th className="p-4 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
//                 {devices.map((device) => (
//                   <tr key={device.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
//                     <td className="p-4 flex items-center space-x-3">
//                       <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-brand-pale/50">
//                         {device.imageUrl ? (
//                           <img src={device.imageUrl} alt={device.name} className="w-full h-full object-cover" />
//                         ) : (
//                           <Layers className="w-4 h-4 text-gray-400" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-extrabold text-brand-dark dark:text-white text-sm">{device.name}</p>
//                         <p className="text-xxs text-gray-400 mt-0.5">{device.brand} • {device.model}</p>
//                       </div>
//                     </td>
//                     <td className="p-4 font-mono text-[11px] text-gray-500">{device.serialNumber}</td>
//                     <td className="p-4">
//                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-blue/5 text-brand-blue">
//                         {device.category.name}
//                       </span>
//                     </td>
//                     <td className="p-4 font-bold text-brand-dark dark:text-white">
//                       ${Number(device.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                     </td>
//                     <td className="p-4">
//                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${device.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' :
//                           device.status === 'IN_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400' :
//                             device.status === 'DEPLOYED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
//                               'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
//                         }`}>
//                         {device.status.replace('_', ' ')}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right space-x-2">
//                       <button
//                         onClick={() => openEditModal(device)}
//                         className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/15 text-gray-500 hover:text-brand-blue rounded-lg transition-colors"
//                         title="Edit Details"
//                       >
//                         <Edit2 className="w-3.5 h-3.5" />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteDevice(device.id)}
//                         className="p-2 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
//                         title="Remove Device"
//                       >
//                         <Trash2 className="w-3.5 h-3.5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* CRUD Form Modal Overlay */}
//       <AnimatePresence>
//         {isOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.6 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsOpen(false)}
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />

//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="w-full max-w-3xl bg-white dark:bg-[#111827] border border-brand-pale dark:border-brand-dark/20 shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
//             >
//               <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
//                 <h3 className="text-lg font-bold text-brand-dark dark:text-white">
//                   {editingDevice ? `Modify Component: ${editingDevice.name}` : 'Register New Peripheral Component'}
//                 </h3>
//                 <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">

//                 {/* Section 1: Names and Model */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Asset Name</label>
//                     <input
//                       type="text"
//                       required
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="e.g. Mechanical Keyboard"
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Brand</label>
//                     <input
//                       type="text"
//                       required
//                       value={brand}
//                       onChange={(e) => setBrand(e.target.value)}
//                       placeholder="e.g. Logitech"
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Model</label>
//                     <input
//                       type="text"
//                       required
//                       value={model}
//                       onChange={(e) => setModel(e.target.value)}
//                       placeholder="e.g. MX Keys Mini"
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                 </div>

//                 {/* Section 2: Numbers, Category, Status */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="md:col-span-2">
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Serial Number (Unique)</label>
//                     <input
//                       type="text"
//                       required
//                       value={serialNumber}
//                       onChange={(e) => setSerialNumber(e.target.value)}
//                       placeholder="e.g. SN-MX86745812"
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Category</label>
//                     <select
//                       value={categoryId}
//                       onChange={(e) => setCategoryId(e.target.value)}
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     >
//                       {categories.map(cat => (
//                         <option key={cat.id} value={cat.id}>{cat.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Status</label>
//                     <select
//                       value={status}
//                       onChange={(e) => setStatus(e.target.value as any)}
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     >
//                       <option value="AVAILABLE">Available</option>
//                       <option value="IN_MAINTENANCE">In Maintenance</option>
//                       <option value="DEPLOYED">Deployed</option>
//                       <option value="RETIRED">Retired</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Section 3: Cost and Dates */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5 flex items-center">
//                       <DollarSign className="w-3.5 h-3.5 mr-1" />
//                       <span>Purchase Price ($)</span>
//                     </label>
//                     <input
//                       type="number"
//                       required
//                       min={0}
//                       step="0.01"
//                       value={price}
//                       onChange={(e) => setPrice(e.target.value)}
//                       placeholder="e.g. 149.99"
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5 flex items-center">
//                       <Calendar className="w-3.5 h-3.5 mr-1" />
//                       <span>Purchase Date</span>
//                     </label>
//                     <input
//                       type="date"
//                       required
//                       value={purchaseDate}
//                       onChange={(e) => setPurchaseDate(e.target.value)}
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5 flex items-center">
//                       <Wrench className="w-3.5 h-3.5 mr-1" />
//                       <span>Warranty Expiry</span>
//                     </label>
//                     <input
//                       type="date"
//                       required
//                       value={warrantyExpiry}
//                       onChange={(e) => setWarrantyExpiry(e.target.value)}
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none"
//                     />
//                   </div>
//                 </div>

//                 {/* Section 4: Descriptions and specs */}
//                 <div className="space-y-4">
//                   {/* Image Upload */}
//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Device Image</label>
//                     <div className="flex items-center space-x-4">
//                       {imageFile ? (
//                         <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-pale bg-gray-50 dark:bg-[#1f2937] flex items-center justify-center shrink-0">
//                           <img
//                             src={URL.createObjectURL(imageFile)}
//                             alt="Preview"
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setImageFile(null)}
//                             className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ) : editingDevice?.imageUrl ? (
//                         <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-pale bg-gray-50 dark:bg-[#1f2937] flex items-center justify-center shrink-0">
//                           <img
//                             src={editingDevice.imageUrl}
//                             alt="Current"
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       ) : (
//                         <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] flex items-center justify-center text-gray-400 shrink-0">
//                           <Layers className="w-5 h-5" />
//                         </div>
//                       )}
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                           if (e.target.files && e.target.files[0]) {
//                             setImageFile(e.target.files[0]);
//                           }
//                         }}
//                         className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Asset Description</label>
//                     <textarea
//                       required
//                       rows={2}
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       placeholder="Input generic description..."
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5">Working Principle / Technical Guide</label>
//                     <textarea
//                       required
//                       rows={2}
//                       value={workingPrinciple}
//                       onChange={(e) => setWorkingPrinciple(e.target.value)}
//                       placeholder="Input working principles / assembly guides..."
//                       className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xxs font-bold text-gray-500 uppercase mb-1.5 flex items-center">
//                       <SlidersHorizontal className="w-4 h-4 mr-1 text-brand-blue" />
//                       <span>Specifications (JSON Format)</span>
//                     </label>
//                     <textarea
//                       required
//                       rows={4}
//                       value={specificationsStr}
//                       onChange={(e) => setSpecificationsStr(e.target.value)}
//                       className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-mono dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none font-mono text-[11px] focus:ring-2 focus:ring-brand-blue"
//                     />
//                   </div>
//                 </div>

//                 {/* Submit Actions */}
//                 <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
//                   <button
//                     type="button"
//                     onClick={() => setIsOpen(false)}
//                     className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl font-bold transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="px-5 py-2 bg-brand-blue hover:bg-brand-dark text-white rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
//                   >
//                     {isSubmitting ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <span>Save Component</span>
//                     )}
//                   </button>
//                 </div>

//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  X,
  SlidersHorizontal,
  Calendar,
  Layers,
  Wrench,
  DollarSign,
  Upload,
  ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Category {
  id: string;
  name: string;
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

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  IN_MAINTENANCE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  DEPLOYED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400',
  RETIRED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'IN_MAINTENANCE' | 'DEPLOYED' | 'RETIRED'>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [workingPrinciple, setWorkingPrinciple] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [specificationsStr, setSpecificationsStr] = useState('{\n  "color": "Black",\n  "weight": "1.2kg"\n}');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategoriesList = async () => {
    try {
      const data = await fetchAPI('/categories');
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevicesList = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=8`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await fetchAPI(`/devices${query}`);
      setDevices(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch devices list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategoriesList(); }, []);
  useEffect(() => { fetchDevicesList(); }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDevicesList();
  };

  const resetForm = () => {
    setName(''); setBrand(''); setModel(''); setSerialNumber('');
    setPrice(''); setStatus('AVAILABLE'); setDescription('');
    setWorkingPrinciple(''); setPurchaseDate(''); setWarrantyExpiry('');
    setCategoryId(categories[0]?.id || '');
    setSpecificationsStr('{\n  "color": "Black",\n  "weight": "1.2kg"\n}');
    setImageFile(null);
    setImagePreview(null);
  };

  const openAddModal = () => {
    setEditingDevice(null);
    resetForm();
    setIsOpen(true);
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setName(device.name);
    setBrand(device.brand);
    setModel(device.model);
    setSerialNumber(device.serialNumber);
    setPrice(String(device.price));
    setStatus(device.status);
    setDescription(device.description);
    setWorkingPrinciple(device.workingPrinciple);
    setPurchaseDate(new Date(device.purchaseDate).toISOString().split('T')[0]);
    setWarrantyExpiry(new Date(device.warrantyExpiry).toISOString().split('T')[0]);
    setCategoryId(device.categoryId);
    setSpecificationsStr(JSON.stringify(device.specifications, null, 2));
    setImageFile(null);
    setImagePreview(device.imageUrl || null);
    setIsOpen(true);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

 
  const handleDeleteDevice = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Device?',
      text: 'This will permanently remove the device and all its logs. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl text-sm',
        title: 'text-base font-bold',
        confirmButton: 'rounded-xl font-bold text-xs px-5 py-2.5',
        cancelButton: 'rounded-xl font-bold text-xs px-5 py-2.5',
      },
    });
 
    if (!result.isConfirmed) return;
 
    try {
      await fetchAPI(`/devices/${id}`, { method: 'DELETE' });
      toast.success('Device removed successfully!');
      fetchDevicesList();
 
      Swal.fire({
        title: 'Deleted!',
        text: 'The device has been removed from inventory.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl text-sm',
          title: 'text-base font-bold',
        },
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete device.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let specs = {};
    try {
      specs = JSON.parse(specificationsStr);
    } catch {
      toast.error('Specifications must be valid JSON.');
      return;
    }
    if (!categoryId) { toast.error('Please assign a category.'); return; }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('serialNumber', serialNumber);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('description', description);
    formData.append('specifications', JSON.stringify(specs));
    formData.append('workingPrinciple', workingPrinciple);
    formData.append('purchaseDate', new Date(purchaseDate).toISOString());
    formData.append('warrantyExpiry', new Date(warrantyExpiry).toISOString());
    formData.append('categoryId', categoryId);
    if (imageFile) formData.append('file', imageFile);

    setIsSubmitting(true);
    try {
      if (editingDevice) {
        await fetchAPI(`/devices/${editingDevice.id}`, { method: 'PATCH', body: formData });
        toast.success('Device updated successfully!');
      } else {
        await fetchAPI('/devices', { method: 'POST', body: formData });
        toast.success('Device registered successfully!');
      }
      setIsOpen(false);
      fetchDevicesList();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-brand-blue/60 focus:border-brand-blue transition placeholder:text-gray-400";
  const labelCls = "block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white tracking-tight">Device Inventory</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage computer components and peripherals.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-dark text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-blue/20 text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register Device
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, model, serial number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/60 transition"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-brand-blue" />
            <span className="text-xs text-gray-400">Loading inventory…</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="py-20 text-center">
            <Layers className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No devices found in inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80 dark:bg-gray-900/20">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Asset Details</th>
                  <th className="px-4 py-3">Serial Number</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors">
                    {/* Image Cell */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        {device.imageUrl ? (
                          <img
                            src={device.imageUrl}
                            alt={device.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </td>

                    {/* Asset Details */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-brand-dark dark:text-white text-sm leading-tight">{device.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{device.brand} · {device.model}</p>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{device.serialNumber}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-blue/8 text-brand-blue">
                        {device.category.name}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-bold text-brand-dark dark:text-white">
                      ${Number(device.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${STATUS_STYLES[device.status]}`}>
                        {device.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(device)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/15 text-gray-400 hover:text-brand-blue transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDevice(device.id)}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-3xl bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-dark dark:text-white">
                    {editingDevice ? 'Edit Device' : 'Register New Device'}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {editingDevice ? `Updating: ${editingDevice.name}` : 'Add a new component to inventory'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">

                {/* Image Upload — drag & drop zone */}
                <div>
                  <label className={labelCls}>Device Image</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all flex items-center gap-5 px-5 py-4
                      ${isDragging
                        ? 'border-brand-blue bg-brand-blue/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-blue/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                      }`}
                  >
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                        {imagePreview ? 'Change image' : 'Upload device image'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Drag & drop or click to browse · PNG, JPG, WEBP
                      </p>
                      {imageFile && (
                        <p className="text-[11px] text-brand-blue mt-1.5 font-medium truncate">
                          {imageFile.name}
                        </p>
                      )}
                    </div>

                    <Upload className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />

                    {/* Clear button */}
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-md bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageSelect(e.target.files[0]);
                    }}
                  />
                </div>

                {/* Name, Brand, Model */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Asset Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mechanical Keyboard" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Brand</label>
                    <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Logitech" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Model</label>
                    <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. MX Keys Mini" className={inputCls} />
                  </div>
                </div>

                {/* Serial, Category, Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Serial Number</label>
                    <input type="text" required value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. SN-MX86745812" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}>
                      <option value="AVAILABLE">Available</option>
                      <option value="IN_MAINTENANCE">In Maintenance</option>
                      <option value="DEPLOYED">Deployed</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                </div>

                {/* Price & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      <DollarSign className="w-3 h-3" /> Purchase Price ($)
                    </label>
                    <input type="number" required min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="149.99" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      <Calendar className="w-3 h-3" /> Purchase Date
                    </label>
                    <input type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls + ' flex items-center gap-1'}>
                      <Wrench className="w-3 h-3" /> Warranty Expiry
                    </label>
                    <input type="date" required value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Description & Working Principle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this asset…" className={inputCls + ' resize-none'} />
                  </div>
                  <div>
                    <label className={labelCls}>Working Principle / Technical Guide</label>
                    <textarea required rows={3} value={workingPrinciple} onChange={(e) => setWorkingPrinciple(e.target.value)} placeholder="Assembly or usage guide…" className={inputCls + ' resize-none'} />
                  </div>
                </div>

                {/* Specifications JSON */}
                <div>
                  <label className={labelCls + ' flex items-center gap-1'}>
                    <SlidersHorizontal className="w-3 h-3 text-brand-blue" />
                    Specifications (JSON)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={specificationsStr}
                    onChange={(e) => setSpecificationsStr(e.target.value)}
                    className={inputCls + ' font-mono text-[11px] resize-none'}
                  />
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs bg-brand-blue hover:bg-brand-dark text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSubmitting ? 'Saving…' : 'Save Device'}
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

