import { Product } from "@/types/Product";

/**
 * Formata um valor numérico para o padrão brasileiro de moeda
 * @param price - Valor a ser formatado
 * @returns String formatada no padrão brasileiro (ex: "99,90")
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2).replace(".", ",");
};

/**
 * Extrai o SKU de um produto baseado no primeiro item disponível com vendedor
 * @param product - Produto a extrair o SKU
 * @returns SKU do produto
 */
export const getProductSku = (product: Product): string => {
  return product.items.find((item) => item.sellers.length > 0)?.itemId || "";
};

/**
 * Monta a URL completa do produto na loja
 * @param productLink - Link relativo do produto
 * @param storeUrl - URL base da loja
 * @returns URL completa do produto
 */
export const getProductUrl = (productLink: string, storeUrl: string): string => {
  return `${storeUrl}${productLink}`;
};
