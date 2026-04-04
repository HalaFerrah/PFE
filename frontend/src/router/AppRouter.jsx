import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import InsuranceDurationPage from "../features/quote/pages/InsuranceDurationPage";
import BoatDetailsPage from "../features/quote/pages/BoatDetailsPage";
import GuaranteeCalculationPage from "../features/quote/pages/GuaranteeCalculationPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import PaymentPage from "../features/payment/pages/PaymentPage";
import LoginPage from "../features/auth/pages/LoginPage";
import TestAccessPage from "../features/test/pages/TestAccessPage";
import HomePage from "../features/home/pages/HomePage";
import AboutPage from "../features/company/pages/AboutPage";
import NosDevisPage from "../features/devis/pages/NosDevisPage";
import AccountPage from "../features/account/pages/AccountPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import ContractDetailPage from "../features/contracts/pages/ContractDetailPage";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/qui-sommes-nous" element={<AboutPage />} />
        <Route path="/nos-devis" element={<NosDevisPage />} />
        <Route path="/quote/duration" element={<InsuranceDurationPage />} />
        <Route path="/quote/boat" element={<BoatDetailsPage />} />
        <Route path="/quote/guarantee" element={<GuaranteeCalculationPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
        <Route path="/admin/contracts" element={<AdminDashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestAccessPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default AppRouter;
