/**
 * Injeta estilos globais no documento
 * Útil para estilos dinâmicos que não podem ser incluídos via CSS estático
 */
export const injectGlobalStyles = () => {
  const style = `
    @layer utilities {
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .animate-fade-in-down {
      animation: fadeInDown 0.3s ease-in-out;
    }
  `;

  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;
  document.head.appendChild(styleTag);
};
