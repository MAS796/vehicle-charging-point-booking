import { useEffect } from "react";

const DESCRIPTION_SELECTOR = 'meta[name="description"]';

export default function Seo({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    const existingMeta = document.head.querySelector(DESCRIPTION_SELECTOR);
    const previousDescription = existingMeta?.getAttribute("content") ?? null;

    let managedMeta = existingMeta;

    if (title) {
      document.title = title;
    }

    if (description) {
      if (!managedMeta) {
        managedMeta = document.createElement("meta");
        managedMeta.setAttribute("name", "description");
        document.head.appendChild(managedMeta);
      }

      managedMeta.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;

      if (!managedMeta) {
        return;
      }

      if (previousDescription === null) {
        managedMeta.remove();
        return;
      }

      managedMeta.setAttribute("content", previousDescription);
    };
  }, [title, description]);

  return null;
}
