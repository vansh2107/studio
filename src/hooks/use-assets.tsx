'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Asset } from '@/lib/types';

export type { Asset };

const ASSETS_STORAGE_KEY = 'finarray-assets';

// Function to safely get assets from localStorage
const getInitialAssets = (): Asset[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    // If nothing is stored, start with an empty array.
    return storedAssets ? JSON.parse(storedAssets) : [];
  } catch (error) {
    console.error("Failed to parse assets from localStorage", error);
    // In case of parsing error, fallback to an empty array.
    return [];
  }
};

interface AssetContextType {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (assetId: string) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetsProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<Asset[]>(getInitialAssets);

  // Effect to save assets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    } catch (error) {
      console.error("Failed to save assets to localStorage", error);
    }
  }, [assets]);

  const addAsset = (asset: Asset) => {
    setAssets(prevAssets => [...prevAssets, asset]);
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    );
  };
  
  const deleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset, updateAsset, deleteAsset }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetsProvider');
  }
  return context;
};
