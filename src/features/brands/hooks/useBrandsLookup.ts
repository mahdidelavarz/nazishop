"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBrandsLookupApi } from "../services/brandLookupService";
import { Brand } from "../types/brandTypes";

// Hook for fetching brands for dropdown/select options
export const useBrandsLookup = () => {
  return useQuery<Brand[]>({
    queryKey: ["brands-lookup"],
    queryFn: async () => {
      return await fetchBrandsLookupApi();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

