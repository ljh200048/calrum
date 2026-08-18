import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Pages
import { Home } from './pages/Home';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { WriteArticle } from './pages/WriteArticle';
import { EditArticle } from './pages/EditArticle';
import { CategoryPage } from './pages/CategoryPage';
import { AuthorPage } from './pages/AuthorPage';
import { Profile } from './pages/Profile';
import { SearchPage } from './pages/Search';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminArticles } from './pages/Admin/AdminArticles';
import { AdminUsers } from './pages/Admin/AdminUsers';
import { AdminComments } from './pages/Admin/AdminComments';
import { AdminReports } from './pages/Admin/AdminReports';
import { AdminCategories } from './pages/Admin/AdminCategories';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
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
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
