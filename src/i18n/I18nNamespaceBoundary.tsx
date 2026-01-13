import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function I18nNamespaceBoundary({
  ns,
  children,
  fallback = null,
}: {
  ns: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const namespaces = useMemo(() => (Array.isArray(ns) ? ns : [ns]), [ns]);
  const [ready, setReady] = useState(() => namespaces.every((n) => i18n.hasLoadedNamespace(n)));

  useEffect(() => {
    let mounted = true;
    i18n.loadNamespaces(namespaces, () => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, [i18n, namespaces]);

  if (!ready) return <>{fallback}</>;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
