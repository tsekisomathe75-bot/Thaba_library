import { useState } from 'react';
import useApi from '../hooks/useApi';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import Notice from '../components/Notice';

// the admin view: add / update / delete users
function UserManagement() {
  const { user: me } = useAuth();
  const { data: users, loading, error, reload } = useApi('/users');
  const [editing, setEditing] = useState(null);

  const saveUser = async (values) => {
    if (editing) {
      await api(`/users/${editing.id}`, { method: 'PUT', body: values });
      setEditing(null);
    } else {
      await api('/users', { method: 'POST', body: values });
    }
    reload();
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete ${u.name} (${u.membership_id})?`)) return;
    try {
      await api(`/users/${u.id}`, { method: 'DELETE' });
      if (editing?.id === u.id) setEditing(null);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <p className="kicker">Thaba Library · Members &amp; staff</p>
        <h1>User management</h1>
        <p>Admin only. Add people, change their role, or remove them.</p>
      </div>

      <UserForm editing={editing} onSubmit={saveUser} onCancel={() => setEditing(null)} />

      <Notice kind="error">{error}</Notice>
      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <UserList
          users={users}
          currentUserId={me.id}
          onEdit={(u) => {
            setEditing(u);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={deleteUser}
        />
      )}
    </>
  );
}

// what a normal member sees here
function MyAccount({ user }) {
  return (
    <>
      <div className="page-head">
        <p className="kicker">Thaba Library · Your account</p>
        <h1>Hello, {user.name.split(' ')[0]}.</h1>
        <p>Only admins can manage other users.</p>
      </div>
      <section className="panel account-details">
        <div><span>Name</span><strong>{user.name}</strong></div>
        <div><span>Membership ID</span><strong className="mono">{user.membershipId}</strong></div>
        <div><span>Role</span><strong><span className={`role role-${user.role}`}>{user.role}</span></strong></div>
      </section>
    </>
  );
}

// one page, three states: logged out -> login form, member -> account, admin -> management
export default function Users() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="auth-wrap">
        <LoginForm />
      </div>
    );
  }
  return isAdmin ? <UserManagement /> : <MyAccount user={user} />;
}
