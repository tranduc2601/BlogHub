import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { DropdownProvider } from "./context/DropdownContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import UsersPage from "./pages/UsersPage";
import UserPostsPage from "./pages/UserPostsPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./components/forms/LoginPage";
import RegisterPage from "./components/forms/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MyPostsPage from "./pages/MyPostsPage";
import PostsPage from "./pages/PostsPage";
import FollowListPage from "./pages/FollowListPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotificationsPage from "./pages/NotificationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DropdownProvider>
          <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/posts" element={<PostsPage />} />


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
              path="/users" 
              element={<UsersPage />}
            />

            {/* User Posts Page */}
            <Route 
              path="/users/:userId/posts" 
              element={<UserPostsPage />}
            />

            {/* Follow List Page */}
            <Route 
              path="/follow-list" 
              element={
                <ProtectedRoute>
                  <FollowListPage />
                </ProtectedRoute>
              }
            />

            {/* Change Password Page */}
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            {/* Notifications Page */}
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
        </Routes>
        </DropdownProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
