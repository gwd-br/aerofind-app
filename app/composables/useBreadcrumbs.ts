// composables/useBreadcrumbs.ts
import { computed } from "vue";
import { useRoute, useRouter, type RouteLocationRaw } from "vue-router";

type BreadcrumbMetaItem = {
  label: string;
  /** uma destas formas (todas opcionais p/ item atual): */
  to?: RouteLocationRaw;
  name?: string;
  path?: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
};

type BreadcrumbMeta =
  | string
  | { label: string }
  | BreadcrumbMetaItem[]
  | undefined;

type Crumb = { label: string; href?: string; isCurrent: boolean };

function injectParamsInString(s: string, params: Record<string, any>) {
  // substitui "[param]" ou ":param" por route.params[param]
  return s
    .replace(/\[([^\]]+)\]/g, (_, k) => encodeURIComponent(params[k] ?? ""))
    .replace(/:([A-Za-z0-9_]+)/g, (_, k) =>
      encodeURIComponent(params[k] ?? "")
    );
}

/** substitui placeholders em objetos RouteLocationRaw/params/query */
function injectParamsDeep<T>(val: T, params: Record<string, any>): T {
  if (typeof val === "string") return injectParamsInString(val, params) as any;
  if (Array.isArray(val))
    return val.map((v) => injectParamsDeep(v, params)) as any;
  if (val && typeof val === "object") {
    const out: any = {};
    for (const k in val as any)
      out[k] = injectParamsDeep((val as any)[k], params);
    return out;
  }
  return val;
}

export function useBreadcrumbs() {
  const route = useRoute();
  const router = useRouter();

  const items = computed<Crumb[]>(() => {
    // pegamos o último matched (a page atual) e lemos o meta dele
    const matched = route.matched.filter((m) => m.path && m.path !== "/");
    const last = matched[matched.length - 1];
    const meta = (last?.meta ?? {}) as {
      title?: string;
      breadcrumb?: BreadcrumbMeta;
    };

    // 1) Se o autor definiu um ARRAY em definePageMeta, usamos ele como fonte única
    if (Array.isArray(meta.breadcrumb)) {
      const arr = meta.breadcrumb as BreadcrumbMetaItem[];
      return arr.map((raw, i) => {
        const isCurrent = i === arr.length - 1;
        // label
        const label =
          (raw as any).label ??
          meta.title ??
          last?.name?.toString() ??
          last?.path?.split("/").pop() ??
          "";

        // href (somente se não for o último)
        let href: string | undefined;
        if (!isCurrent) {
          if (raw.to) {
            const to = injectParamsDeep(raw.to, route.params);
            href = router.resolve(to).href;
          } else if (raw.name) {
            const to = {
              name: raw.name as any,
              params: injectParamsDeep(
                raw.params ?? route.params,
                route.params
              ),
              query: injectParamsDeep(raw.query ?? {}, route.params),
            };
            href = router.resolve(to).href;
          } else if (raw.path) {
            href = injectParamsInString(raw.path, route.params);
          }
        }

        return { label, href, isCurrent };
      });
    }

    // 2) Se não houver array, suportamos string/objeto simples como rótulo do item atual…
    if (typeof meta.breadcrumb === "string") {
      return [{ label: meta.breadcrumb, isCurrent: true }];
    }
    if (
      meta.breadcrumb &&
      typeof meta.breadcrumb === "object" &&
      "label" in meta.breadcrumb
    ) {
      return [{ label: (meta.breadcrumb as any).label, isCurrent: true }];
    }

    // 3) Fallback: derivar da árvore de rotas
    return matched.map((rec, idx, arr) => {
      const isCurrent = idx === arr.length - 1;
      const m = (rec.meta ?? {}) as { title?: string };
      const label =
        m.title ??
        rec.name?.toString() ??
        (rec.path.split("/").pop() ?? "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (x) => x.toUpperCase());

      let href: string | undefined;
      if (!isCurrent) {
        if (rec.name) {
          href = router.resolve({
            name: rec.name as any,
            params: route.params,
          }).href;
        } else {
          href = injectParamsInString(rec.path, route.params);
        }
      }

      return { label, href, isCurrent };
    });
  });

  return { items };
}
