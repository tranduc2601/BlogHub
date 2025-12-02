import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/core/errors';
import { ProtectedRoute } from '@/modules/auth';
import { MainLayout } from '@/layout';
import { LoadingSpinner } from '@/shared/ui';
import { preloadCommonRoutes } from './routePreloader';

const HomePage = lazy(() => import('@/modules/posts/pages/HomePage'));
const PostDetailPage = lazy(() => import('@/modules/posts/pages/PostDetailPage'));
const PostsPage = lazy(() => import('@/modules/posts/pages/PostsPage'));
const CreatePostPage = lazy(() => import('@/modules/posts/pages/CreatePostPage'));
const EditPostPage = lazy(() => import('@/modules/posts/pages/EditPostPage'));
const MyPostsPage = lazy(() => import('@/modules/posts/pages/MyPostsPage'));
const SavedPostsPage = lazy(() => import('@/modules/posts/pages/SavedPostsPage'));

const UsersPage = lazy(() => import('@/modules/users/pages/UsersPage'));
const UserDetailPage = lazy(() => import('@/modules/users/pages/UserDetailPage'));
const ProfilePage = lazy(() => import('@/modules/users/pages/ProfilePage'));
const FollowListPage = lazy(() => import('@/modules/users/pages/FollowListPage'));
const ChangePasswordPage = lazy(() => import('@/modules/users/pages/ChangePasswordPage'));

const NotificationsPage = lazy(() => import('@/modules/notifications/pages/NotificationsPage'));

const AdminPage = lazy(() => import('@/modules/admin/pages/AdminPage'));

const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'));

const PrivacyPolicyPage = lazy(() => import('@/modules/posts/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('@/modules/posts/pages/TermsOfServicePage'));

const LoadingFallback = () => <LoadingSpinner fullScreen size="lg" message="Đang tải trang..." />;

export function AppRoutes() {
  useEffect(() => {
    preloadCommonRoutes();
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/userdetail/:userId" element={<UserDetailPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

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
              path="/profile/:userId"
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
              path="/saved-posts"
              element={
                <ProtectedRoute>
                  <SavedPostsPage />
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

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
