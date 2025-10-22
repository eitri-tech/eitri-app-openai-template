import { View, Page } from "eitri-luminus";
import { useEffect } from "react";
import { Product } from "@/types/Product";
import { useOpenAI, useToolCall, useToast } from "@/hooks";
import { vtexConfig, VTEX_STORE_URL } from "@/config";
import { getProductSku, getProductUrl } from "@/utils/product";
import { injectGlobalStyles } from "@/utils/styles";
import { Toast } from "@/components/Toast";
import { ProductCarousel } from "@/components/Product";

interface SearchProductsResponse {
  products: Product[];
}

export default function Home(props) {
  const openAI = useOpenAI();
  const { showToast, displayToast } = useToast();

  const {
    data,
    loading,
    execute: searchProducts,
  } = useToolCall<SearchProductsResponse>("searchProducts", {
    query: openAI.getToolInput() || "Camisas",
    vtexConfig,
  });

  const products = data?.products || [];

  useEffect(() => {
    injectGlobalStyles();
    const loadProducts = async () => {
      await searchProducts();
    };

    loadProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    const productUrl = getProductUrl(product.link, VTEX_STORE_URL);
    window.open(productUrl, "_blank");
  };

  const handleAddToCart = async (product: Product) => {
    const sku = getProductSku(product);
    console.log("SKU:", sku);

    displayToast();

    await openAI.sendFollowUpMessage(
      `Adicione o seguinte produto ao carrinho: ${JSON.stringify({
        productName: product.productName,
        productId: sku,
      })}. VtexConfig: ${JSON.stringify(vtexConfig)}`
    );
  };

  return (
    <Page
      className="w-full h-full light:bg-white dark:bg-[#212121] flex flex-col items-center justify-center"
      statusBarTextColor="white"
    >
      <Toast
        show={showToast}
        message="Nosso Agente de IA irá adicionar o produto ao carrinho, você pode acompanhar nas mensagens seguintes do Chat."
      />

      <View className="w-full max-w-6xl mx-auto flex flex-col p-2">
        <ProductCarousel
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </View>
    </Page>
  );
}
