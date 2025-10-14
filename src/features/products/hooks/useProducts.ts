import { useQuery } from "@tanstack/react-query";
import { Product } from "../types/productsType";
import { fetchProductsApi, fetchSingleProductApi } from "../services/productsService";


export const useProductsQuery = () =>
    useQuery<Product[], Error>({
        queryKey: ["products"],
        queryFn: fetchProductsApi,
        staleTime: 5 * 60 * 1000,
    });

export const useSingleProductQuery = (slug: string) =>
    useQuery<Product, Error>({
        queryKey: ["product", slug],
        queryFn: () => fetchSingleProductApi(slug),
    });
