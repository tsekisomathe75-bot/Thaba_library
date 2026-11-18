import useApi from '../hooks/useApi';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import TransactionForm from '../components/TransactionForm';
import TransactionLog from '../components/TransactionLog';
import Notice from '../components/Notice';

export default function Transactions() {
  const { isAdmin } = useAuth();
  const books = useApi('/books');
  const users = useApi('/users', isAdmin);   // only admins are allowed to list users
  const log = useApi('/transactions');

  // stock numbers and the log both change after any of these
  const refresh = () => {
    books.reload();
    log.reload();
  };

  const record = async (payload) => {
    const result = await api('/transactions', { method: 'POST', body: payload });
    refresh();
    return result;
  };

  const updateTransaction = async (id, values) => {
    await api(`/transactions/${id}`, { method: 'PUT', body: values });
    refresh();
  };

  const deleteTransaction = async (t) => {
    if (!window.confirm(`Delete this record for "${t.book_title}"? Its stock change will be reversed.`)) return;
    try {
      await api(`/transactions/${t.id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <p className="kicker">Thaba Library · Stock movements</p>
        <h1>Transactions</h1>
        <p>{isAdmin ? 'Everything that moved in or out. Fix a wrong entry and the stock corrects itself.' : 'Borrow or return a book. Your history is below.'}</p>
      </div>

      <Notice kind="error">{books.error || log.error}</Notice>

      <TransactionForm books={books.data} users={users.data} isAdmin={isAdmin} onSubmit={record} />

      <h2 className="section-title">History</h2>
      {log.loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <TransactionLog
          rows={log.data}
          showUser={isAdmin}
          canEdit={isAdmin}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
      )}
    </>
  );
}
