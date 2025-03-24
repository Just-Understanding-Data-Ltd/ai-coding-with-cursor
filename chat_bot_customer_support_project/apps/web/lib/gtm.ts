// @ts-nocheck

export const gtmPageView = (props: { [key: string]: any }) => {
  if (typeof window !== "undefined" && (window as Window).dataLayer) {
    (window as Window).dataLayer.push({
      event: "page_view",
      page_path: window.location.pathname,
      ...props,
    });
  }
};
