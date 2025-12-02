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

export const preloadRoute = (route: RouteKey) => {
  const loader = preloadableRoutes[route];
  if (loader) {
    loader().catch((error) => {
      console.warn(`Failed to preload route: ${route}`, error);
    });
  }
};

export const preloadRoutes = (routes: RouteKey[]) => {
  routes.forEach((route) => preloadRoute(route));
};

export const preloadCommonRoutes = () => {
  setTimeout(() => {
    preloadRoutes(['posts', 'users', 'createPost']);
  }, 2000);
};

export const useRoutePreloader = () => {
  return {
    onMouseEnter: (route: RouteKey) => () => preloadRoute(route),
    onTouchStart: (route: RouteKey) => () => preloadRoute(route),
  };
};
