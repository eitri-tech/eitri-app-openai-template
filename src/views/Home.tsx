import { View, Page } from "eitri-luminus";
import { useEffect, useState } from "react";
import { Product } from "@/types/Product";
import { useOpenAI, useToolCall, useToast } from "@/hooks";
import { vtexConfig, VTEX_STORE_URL } from "@/config";
import { getProductSku, getProductUrl } from "@/utils/product";
import { injectGlobalStyles } from "@/utils/styles";
import { Toast } from "@/components/Toast";
import { ProductCarousel } from "@/components/Product";
import { CategoryBadge, CategoryBadgeSkeleton } from "@/components/Category";

interface SearchProductsResponse {
  products: Product[];
}

interface ToolInput {
  query: string;
  intention?: string;
  keywords: string[]
}

interface FacetItem {
  label: string;
  path: string;
}

export default function Home(props) {
  const openAI = useOpenAI();
  const { showToast, displayToast } = useToast();
  const toolInput = openAI.getToolInput<ToolInput>();

  // Estados para gerenciar facets e cache
  const [availableFacets, setAvailableFacets] = useState<FacetItem[]>([]);
  const [selectedFacetPath, setSelectedFacetPath] = useState<string>("");
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});

  // Estado único de loading
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const {
    data,
    execute: searchProducts,
  } = useToolCall<SearchProductsResponse>("getProductsByFacets", {
    vtexConfig,
  });


  const { execute: askToEitriAI } = useToolCall<any>("ask", {
    vtexConfig,
  })

  const { execute: getCategories } = useToolCall<any>("getCategories", {
    vtexConfig,
  })

  const { execute: getFacets } = useToolCall<any>("getFacets", {
    vtexConfig,
  })

  const products = selectedFacetPath && productsCache[selectedFacetPath]
    ? productsCache[selectedFacetPath]
    : data?.products || [];

  // Função para buscar produtos por facet (com cache)
  const loadProductsByFacet = async (facetPath: string) => {
    // Atualiza a seleção imediatamente
    setSelectedFacetPath(facetPath);

    // Verifica se já está em cache
    if (productsCache[facetPath]) {
      return;
    }

    // Busca produtos da API
    setIsLoadingProducts(true);
    const result = await searchProducts({
      facets: facetPath,
      vtexConfig,
    });

    if (result?.products) {
      // Atualiza cache
      setProductsCache((prev) => ({
        ...prev,
        [facetPath]: result.products,
      }));
    }
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    injectGlobalStyles();
    const loadFacets = async () => {
      setIsInitialLoading(true);
      console.log("Carregando categorias e facets")

      const categories = await getCategories()

      const prompt = `
      Você é um assistente virtual que irá me ajudar a encontrar produtos na loja.
      Query: ${toolInput.query}
      Keywords: ${toolInput.keywords.join(', ')}

      Abaixo eu tenho as categorias disponíveis na loja, você deve me ajudar a encontrar produtos que sejam relevantes para o usuário.
      categorias: ${JSON.stringify(categories.map((category) => ({
        name: category.name,
        id: category.id,
        children: category.children.map((child) => ({
          name: child.name,
          id: child.id,
        }))
      })))}

      Você me deve retornar somente um JSON com as categorias com suas sub-categorias relevantes para o usuário, como abaixo e evite duplicações:
      {
        "categories": Array<{
          id: number,
          name: string,
          subCategoryName: string,
          subCategoryId: number
        }>
      }
    `

      const result = await askToEitriAI({
        query: prompt,
        vtexConfig
      });

      const dataString = result?.replace(/```json/g, '').replace(/```/g, '')

      const data = JSON.parse(dataString) as { categories: { name: string, id: number, subCategoryName: string, subCategoryId: number }[] }

      const facetsPromises = []

      for (const category of data.categories) {
        facetsPromises.push(getFacets({
          query: category.name + " " + category.subCategoryName,
          vtexConfig
        }))
      }

      const facets = await Promise.all(facetsPromises)

      console.log("Facets obtidos:", facets)

      const facetsPrompt = `
      Você é um assistente virtual que irá me ajudar a encontrar produtos na loja.
      Query: ${toolInput.query}
      Keywords: ${toolInput.keywords.join(', ')}

      Abaixo eu tenho as facets disponíveis na loja, você deve me ajudar a encontrar produtos que sejam relevantes para o usuário que fazem match com as categorias e com os keywords. Evite duplicações, se a sub-categoria já estiver presente em um categoria "pai" não duplique adicionando em outra.

      categories: ${JSON.stringify(data)}

      facets: ${JSON.stringify(facets)}

      Você me deve retornar somente um JSON com as Facets relevantes para o usuário no seguinte formato:
      {
        "facets": Array<{
          label: string,
          categoryKey: string,
          categoryValue: string,
          subCategoryKey: string,
          subCategoryValue: string
        }>
      }

      IMPORTANTE: o campo "label" deve ser um nome amigável para exibição ao usuário (ex: "Camisetas Masculinas", "Calças Jeans").
      `

      const resultFacets = await askToEitriAI({
        query: facetsPrompt,
        vtexConfig
      });

      const facetsDataString = resultFacets?.replace(/```json/g, '').replace(/```/g, '')
      const facetsData = JSON.parse(facetsDataString) as {
        facets: Array<{
          label: string,
          categoryKey: string,
          categoryValue: string,
          subCategoryKey: string,
          subCategoryValue: string
        }>
      }

      // Transforma os facets no formato correto: /category-key/category-value/sub-category-key/sub-category-value
      const formattedFacets: FacetItem[] = facetsData.facets.map((facet) => ({
        label: facet.label,
        path: `/${facet.categoryKey}/${facet.categoryValue}/${facet.subCategoryKey}/${facet.subCategoryValue}`,
      }));

      console.log("Facets formatados:", formattedFacets)

      setAvailableFacets(formattedFacets);

      // Carrega produtos do primeiro facet automaticamente
      if (formattedFacets.length > 0) {
        await loadProductsByFacet(formattedFacets[0].path);
      }

      setIsInitialLoading(false);
    };

    loadFacets();
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

      <View className="w-full max-w-6xl mx-auto flex flex-col p-2 gap-4">
        {/* Badges de Categorias */}
        <View
          className="w-full overflow-x-auto overflow-y-hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <View
            className="flex flex-row gap-2 py-2 px-1"
            style={{
              flexWrap: 'nowrap',
              minWidth: 'min-content',
            }}
          >
            {isInitialLoading ? (
              // Skeleton para badges
              <>
                {[1, 2, 3, 4, 5].map((index) => (
                  <CategoryBadgeSkeleton key={index} />
                ))}
              </>
            ) : (
              // Badges reais
              availableFacets.map((facet) => (
                <CategoryBadge
                  key={facet.path}
                  label={facet.label}
                  isActive={selectedFacetPath === facet.path}
                  onClick={() => loadProductsByFacet(facet.path)}
                />
              ))
            )}
          </View>
        </View>

        {/* Carrossel de Produtos */}
        <ProductCarousel
          products={products}
          loading={isInitialLoading || isLoadingProducts}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </View>
    </Page>
  );
}
