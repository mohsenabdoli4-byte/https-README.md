import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Category from './pages/Category.jsx';
import Product from './pages/Product.jsx';
import CustomCake from './pages/CustomCake.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Account from './pages/Account.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import { OurStory, Contact, Faq, Shipping, Privacy, Terms, NotFound } from './pages/InfoPages.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminContent from './pages/admin/AdminContent.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections" element={<Shop />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/custom-cake" element={<CustomCake />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account" element={<Account />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
      </Route>
    </Routes>
  );
}
