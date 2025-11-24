/**
 * Route preloader utility
 * Preload specific routes for better user experience
 */

// Import lazy-loaded routes for preloading
const preloadableRoutes = {
  home: () => import('@/modules/posts/pages/HomePage'),
  posts: () => import('@/modules/posts/pages/PostsPage'),
  postDetail: () => import('@/modules/posts/pages/PostDetailPage'),
  createPost: () => import('@/modules/posts/pages/CreatePostPage'),
  users: () => import('@/modules/users/pages/UsersPage'),
  userDetail: () => import('@/modules/users/pages/UserDetailPage'),
  profile: () => import('@/modules/users/pages/ProfilePage'),
  myPosts: () => import('@/modules/posts/pages/MyPostsPage'),
  notifications: () => import('@/modules/notifications/pages/NotificationsPage'),
  admin: () => import('@/modules/admin/pages/AdminPage'),
};

type RouteKey = keyof typeof preloadableRoutes;

/**
 * Preload a specific route
 */
export const preloadRoute = (route: RouteKey) => {
  const loader = preloadableRoutes[route];
  if (loader) {
    loader().catch((error) => {
      console.warn(`Failed to preload route: ${route}`, error);
    });
  }
};

/**
 * Preload multiple routes
 */
export const preloadRoutes = (routes: RouteKey[]) => {
  routes.forEach((route) => preloadRoute(route));
};

/**
 * Preload commonly accessed routes after initial page load
 */
export const preloadCommonRoutes = () => {
  // Delay preloading to not interfere with initial load
  setTimeout(() => {
    preloadRoutes(['posts', 'users', 'createPost']);
  }, 2000);
};

/**
 * Hook to preload route on hover (for link optimization)
 */
export const useRoutePreloader = () => {
  return {
    onMouseEnter: (route: RouteKey) => () => preloadRoute(route),
    onTouchStart: (route: RouteKey) => () => preloadRoute(route),
  };
};
