import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Direct load for instantaneous home render
import { Home } from './pages/Home';

// Lazy load secondary & heavy pages for fast initial bundle
const Articles = lazy(() => import('./pages/Articles').then((m) => ({ default: m.Articles })));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail').then((m) => ({ default: m.ArticleDetail })));
const WriteArticle = lazy(() => import('./pages/WriteArticle').then((m) => ({ default: m.WriteArticle })));
const EditArticle = lazy(() => import('./pages/EditArticle').then((m) => ({ default: m.EditArticle })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const AuthorPage = lazy(() => import('./pages/AuthorPage').then((m) => ({ default: m.AuthorPage })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const SearchPage = lazy(() => import('./pages/Search').then((m) => ({ default: m.SearchPage })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const SetupAdmin = lazy(() => import('./pages/SetupAdmin').then((m) => ({ default: m.SetupAdmin })));

// Admin Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminArticles = lazy(() => import('./pages/Admin/AdminArticles').then((m) => ({ default: m.AdminArticles })));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminComments = lazy(() => import('./pages/Admin/AdminComments').then((m) => ({ default: m.AdminComments })));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports').then((m) => ({ default: m.AdminReports })));
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories').then((m) => ({ default: m.AdminCategories })));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));

// Lightweight Route Fallback
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/:id" element={<ArticleDetail />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/author/:id" element={<AuthorPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/setup/admin" element={<SetupAdmin />} />

                {/* Protected Member Routes */}
                <Route
                  path="/write"
                  element={
                    <ProtectedRoute>
                      <WriteArticle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articles/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditArticle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
