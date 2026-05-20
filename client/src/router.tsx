import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuthStore } from '@/stores/authStore';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';

const rootRoute = createRootRoute({ component: Outlet });

const storeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'store',
  component: StoreLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/san-pham',
  component: ProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/san-pham/$slug',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/gio-hang',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/thanh-toan',
  beforeLoad: () => {
    if (!useAuthStore.getState().user) throw redirect({ to: '/dang-nhap' });
  },
  component: CheckoutPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/don-hang',
  beforeLoad: () => {
    if (!useAuthStore.getState().user) throw redirect({ to: '/dang-nhap' });
  },
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/don-hang/$id',
  beforeLoad: () => {
    if (!useAuthStore.getState().user) throw redirect({ to: '/dang-nhap' });
  },
  component: OrderDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/dang-nhap',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: '/dang-ky',
  component: RegisterPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    if (!useAuthStore.getState().isStaffOrAdmin()) throw redirect({ to: '/dang-nhap' });
  },
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: AdminDashboardPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/san-pham',
  component: AdminProductsPage,
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/danh-muc',
  component: AdminCategoriesPage,
});

const adminInventoryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/kho',
  component: AdminInventoryPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/don-hang',
  component: AdminOrdersPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/nguoi-dung',
  beforeLoad: () => {
    if (!useAuthStore.getState().isAdmin()) throw redirect({ to: '/admin' });
  },
  component: AdminUsersPage,
});

const routeTree = rootRoute.addChildren([
  storeLayoutRoute.addChildren([
    indexRoute,
    productsRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    ordersRoute,
    orderDetailRoute,
    loginRoute,
    registerRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminProductsRoute,
    adminCategoriesRoute,
    adminInventoryRoute,
    adminOrdersRoute,
    adminUsersRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
