import { matchRoutes } from 'react-router';
export async function hydrateLazyRoutes(routes, basePath) {
    // Determine if any of the initial routes are lazy
    const lazyMatches = matchRoutes(routes, window.location, basePath)?.filter((m) => m.route.lazy);
    // Load the lazy matches and update the routes before creating your router
    // so we can hydrate the SSR-rendered content synchronously
    if (lazyMatches && lazyMatches?.length > 0) {
        await Promise.all(lazyMatches.map(async (m) => {
            const routeModule = await m.route.lazy();
            Object.assign(m.route, {
                ...routeModule,
                lazy: undefined,
            });
        }));
    }
}
//# sourceMappingURL=hydrateLazyRoutes.js.map