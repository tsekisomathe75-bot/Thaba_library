import { formatDate } from '../utils/format';

export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (users.length === 0) return <p className="empty">No users yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="Name"><strong>{u.name}</strong></td>
              <td data-label="Membership ID" className="mono">{u.membership_id}</td>
              <td data-label="Role">
                <span className={`role role-${u.role}`}>{u.role}</span>
              </td>
              <td data-label="Joined">{formatDate(u.created_at)}</td>
              <td className="actions">
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(u)}>Update</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(u)}
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? "You can't delete yourself" : ''}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
