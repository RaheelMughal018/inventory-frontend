import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/HOC/ProtectedRoute";
import PublicRoute from "./components/HOC/PublicRoute";
import SupplierPage from "./pages/Supplier/page";
import CustomerPage from "./pages/Customer/page";
import CategoryPage from "./pages/Category/page";
import ItemPage from "./pages/Item/page";
import AccountPage from "./pages/Accounts/page";
import PurchaseInvoicePage from "./pages/PurchaseInvoice/page";
import CreatePurchaseInvoicePage from "./pages/CreatePurchaseInvoice/page";
import ViewPurchaseInvoicePage from "./pages/ViewPurchaseInvoice";
import FinancialLedgerPage from "./pages/FinancialLedger/page";
import StockLedgerPage from "./pages/StockLedger/page";
import ExpenseCategoryPage from "./pages/ExpenseCategory/page";
import ExpensePage from "./pages/Expense/page";
import RecipePage from "./pages/Recipe/page";
import ProductionPage from "./pages/Production/page";
import ViewProductionBatch from "./pages/ViewProductionBatch";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/supplier" element={<SupplierPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/items" element={<ItemPage />} />
              <Route path="/accounts" element={<AccountPage />} />
              <Route path="/purchase" element={<PurchaseInvoicePage />} />
              <Route path="/financial-ledger" element={<FinancialLedgerPage />} />
              <Route path="/stock-ledger" element={<StockLedgerPage />} />
              <Route path="/expense-categories" element={<ExpenseCategoryPage />} />
              <Route path="/expenses" element={<ExpensePage />} />
              <Route path="/recipes" element={<RecipePage />} />
              <Route path="/production" element={<ProductionPage />} />
              <Route
                path="/production/batches/view/:id"
                element={<ViewProductionBatch />}
              />
              <Route
                path="/purchase/create"
                element={<CreatePurchaseInvoicePage />}
              />
              <Route
                path="/purchase-invoices/view/:id"
                element={<ViewPurchaseInvoicePage />}
              />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Public  Routes */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
