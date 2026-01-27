// pages/AccountPage.tsx
import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddAccountModal, {
  AccountFormData,
} from "../../components/modals/AccountModal";
import {
  Account,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useGetAllAccountsQuery,
  CreateAccount,
  AccountType, // Make sure this is imported
} from "../../redux/services/account";
import { toast } from "sonner";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import AccountsTable from "../../components/tables/BasicTables/AccountsTable";

// ✅ CORRECT FORMAT: Convert to {id, name} for SelectDropdown
const accountTypeOptions = [
  { id: AccountType.CASH, name: "Cash" },
  { id: AccountType.BANK, name: "Bank" },
  { id: AccountType.JAZZCASH, name: "Jazzcash" },
  { id: AccountType.EASYPAISA, name: "EasyPaisa" },
];

const AccountPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;

  const { data, isLoading } = useGetAllAccountsQuery({
    search: search || undefined,
    limit,
    skip,
  });

  const [createAccount] = useCreateAccountMutation();
  const [updateAccount] = useUpdateAccountMutation();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting accounts to CSV");
  };

  // Handle form submission for adding
  const handleAddAccount = async (accountData: AccountFormData) => {
    try {
      const payload: CreateAccount = {
        name: accountData.name,
        type: accountData.type,
      };
      const res = await createAccount(payload).unwrap();
      toast.success(`${res.name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Error while creating account");
    }
  };

  // Handle form submission for editing
  const handleEditAccount = async (accountData: AccountFormData) => {
    if (!selectedAccount) return;

    try {
      const payload: CreateAccount = {
        name: accountData.name,
        type: accountData.type,
      };
      const res = await updateAccount({
        id: selectedAccount.id,
        ...payload,
      }).unwrap();
      toast.success(`${res.name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.log(error);
      toast.error("Error while updating account");
    }
  };

  // Handle edit button click
  const handleEditClick = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <PageMeta title="Accounts" description="Manage your accounts" />
      <PageBreadcrumb pageTitle="Accounts" />
      <div className="space-y-6">
        <ComponentCard
          title="Accounts"
          exportButtonText="Export Accounts CSV" // ✅ Changed
          addButtonText="Add New Account" // ✅ Changed
          onExportClick={handleExportCSV}
          onAddClick={() => setIsAddModalOpen(true)}
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search accounts..." // ✅ Changed
            />
          }
        >
          <AccountsTable
            accounts={data?.accounts ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>
      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAccount}
        mode="add"
        types={accountTypeOptions}
      />
      {/* Edit Account Modal */}
      <AddAccountModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleEditAccount} // ✅ Changed from handleEditSupplier
        initialData={selectedAccount}
        mode="edit"
        types={accountTypeOptions}
      />
    </>
  );
};

export default AccountPage;
