/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { Device } from "@/lib/api/device.api";
import { catalogApi, CategoryNode } from "@/lib/api/deviceApi";
import CatalogSidebar from "@/components/device/CatalogSidebar";
import CatalogContent from "@/components/device/CatalogContent";
import DeviceDetailsModal from "@/components/device/DeviceDetailsModal";


export default function CatalogPage() {
  const { addItem } = useCart();

  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  const loadCategories = async () => {
    try {
      const data = await catalogApi.getCategoriesTree();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch categories.");
    }
  };

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogApi.getDevices({
        page,
        limit: 9,
        search,
        selectedCategoryId,
        status,
        minPrice,
        maxPrice,
      });
      setDevices(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategoryId, status, search, minPrice, maxPrice]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleAddToCart = (device: Device) => {
    addItem({
      id: device.id,
      name: device.name,
      brand: device.brand,
      model: device.model,
      price: Number(device.price),
      imageUrl:
        device.images?.find((img) => img.isPrimary)?.url ||
        device.images?.[0]?.url ||
        "",
    });
    toast.success(`${device.name} cataloged into checkout.`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDevices();
  };

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategoryId("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  // Design Token system matching states mapping
  const getStatusColor = (deviceStatus: string) => {
    switch (deviceStatus) {
      case "AVAILABLE":
        return "text-success-500 bg-success-50 border-success-400/20";
      case "IN_MAINTENANCE":
        return "text-warning-500 bg-warning-50 border-warning-400/20";
      case "DEPLOYED":
        return "text-info-500 bg-info-50 border-info-400/20";
      case "RETIRED":
        return "text-danger-500 bg-danger-50 border-danger-400/20";
      default:
        return "text-text-muted bg-surface-100 border-surface-200";
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 p-4 md:p-8 transition-colors duration-200 text-text-primary">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <CatalogSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          status={status}
          setStatus={setStatus}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          setPage={setPage}
          fetchDevices={loadDevices}
          resetFilters={resetFilters}
        />

        <CatalogContent
          devices={devices}
          loading={loading}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          handleSearchSubmit={handleSearchSubmit}
          handleDeviceClick={handleDeviceClick}
          handleAddToCart={handleAddToCart}
          getStatusColor={getStatusColor}
        />
      </div>

      <DeviceDetailsModal
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}
