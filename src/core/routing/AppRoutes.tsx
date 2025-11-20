import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/core/errors';
import { ProtectedRoute } from '@/modules/auth';
import { MainLayout } from '@/layout';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/modules/posts/pages/HomePage'));
const PostDetailPage = lazy(() => import('@/modules/posts/pages/PostDetailPage'));
const PostsPage = lazy(() => import('@/modules/posts/pages/PostsPage'));
const CreatePostPage = lazy(() => import('@/modules/posts/pages/CreatePostPage'));
const EditPostPage = lazy(() => import('@/modules/posts/pages/EditPostPage'));
const MyPostsPage = lazy(() => import('@/modules/posts/pages/MyPostsPage'));

const UsersPage = lazy(() => import('@/modules/users/pages/UsersPage'));
const UserDetailPage = lazy(() => import('@/modules/users/pages/UserDetailPage'));
const ProfilePage = lazy(() => import('@/modules/users/pages/ProfilePage'));
const FollowListPage = lazy(() => import('@/modules/users/pages/FollowListPage'));
const ChangePasswordPage = lazy(() => import('@/modules/users/pages/ChangePasswordPage'));

const NotificationsPage = lazy(() => import('@/modules/notifications/pages/NotificationsPage'));

const AdminPage = lazy(() => import('@/modules/admin/pages/AdminPage'));

const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage'));

const PrivacyPolicyPage = lazy(() => import('@/modules/posts/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('@/modules/posts/pages/TermsOfServicePage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Đang tải...</p>
    </div>
  </div>
);

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes with layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/userdetail/:userId" element={<UserDetailPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Protected routes */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditPostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <ProtectedRoute>
                  <MyPostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-list"
              element={
                <ProtectedRoute>
                  <FollowListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin route */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
