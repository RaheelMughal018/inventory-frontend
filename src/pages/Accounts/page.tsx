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
  useTransferAccountMutation,
  CreateAccount,
  AccountType,
} from "../../redux/services/account";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import AccountsTable from "../../components/tables/BasicTables/AccountsTable";
import TransferAccountModal from "../../components/modals/TransferAccountModal";
import Button from "../../components/ui/button/Button";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

// Account type options for dropdown
const accountTypeOptions = [
  { id: AccountType.IN_HAND, name: "In Hand" },
  { id: AccountType.BANK, name: "Bank" },
  { id: AccountType.JAZZCASH, name: "JazzCash" },
  { id: AccountType.EASYPAISA, name: "EasyPaisa" },
];

const AccountPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);

  const { data, isLoading } = useGetAllAccountsQuery({
    search: search || undefined,
    page,
    limit,
  });

  const [createAccount] = useCreateAccountMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [transferAccount, { isLoading: isTransferring }] = useTransferAccountMutation();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleTransferSubmit = async (payload: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    transfer_date?: string;
    notes?: string;
  }) => {
    try {
      const res = await transferAccount(payload).unwrap();
      handleApiSuccess(`Transfer ${res.data.reference} completed`);
      setIsTransferModalOpen(false);
    } catch (error) {
      handleApiError(error, "Transfer failed");
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting accounts to CSV");
    // TODO: Implement CSV export functionality
  };

  // Handle form submission for adding
  const handleAddAccount = async (accountData: AccountFormData) => {
    try {
      const payload: CreateAccount = {
        name: accountData.name,
        account_type: accountData.account_type,
        opening_balance: accountData.opening_balance ?? 0,
      };

      // Add bank-specific fields if BANK type
      if (accountData.account_type === AccountType.BANK) {
        payload.account_number = accountData.account_number;
        payload.bank_name = accountData.bank_name;
      }

      const res = await createAccount(payload).unwrap();
      handleApiSuccess(`${res.data.name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create account");
    }
  };

  // Handle form submission for editing
  const handleEditAccount = async (accountData: AccountFormData) => {
    if (!selectedAccount) return;

    try {
      const payload: any = {
        id: selectedAccount.id,
        name: accountData.name,
      };

      // Add bank-specific fields if BANK type
      if (accountData.account_type === AccountType.BANK) {
        payload.account_number = accountData.account_number;
        payload.bank_name = accountData.bank_name;
      }

      const res = await updateAccount(payload).unwrap();
      handleApiSuccess(`${res.data.name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      handleApiError(error, "Failed to update account");
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
          exportButtonText="Export Accounts CSV"
          addButtonText="Add New Account"
          onExportClick={handleExportCSV}
          onAddClick={() => setIsAddModalOpen(true)}
          extra={
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                placeholder="Search accounts..."
              />
              <Button
                variant="outline"
                onClick={() => setIsTransferModalOpen(true)}
                disabled={(data?.data?.length ?? 0) < 2}
              >
                Transfer
              </Button>
            </div>
          }
        >
          <AccountsTable
            accounts={data?.data ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.meta?.totalItems ?? 0}
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
        onSubmit={handleEditAccount}
        initialData={selectedAccount}
        mode="edit"
        types={accountTypeOptions}
      />

      <TransferAccountModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleTransferSubmit}
        accounts={data?.data ?? []}
        isLoading={isTransferring}
      />
    </>
  );
};

export default AccountPage;
