# Thaba Library – Stock Desk

BIWA2110 Web Application Development lab test.
A small library stock management system: React on the front, Express + MySQL on the back.

## What it does

- **Dashboard** – every book as a catalogue card, search/genre filter, and anything with fewer than 2 copies is flagged red with a LOW / OUT stamp.
- **Books** – add, update (inline) and delete books (title, author, genre, ISBN, quantity).
- **Transactions** – borrow, return, or add new stock. Stock is updated and every movement is written to a history log. Admins can correct or delete a record and the stock is adjusted to match.
- **User Management page** – the login form lives here. Logged out you see the login form, members see their account details, admins get the add / update / delete forms.
- **Accounts** – anyone can sign up from the *Join the library* page (members only). Admins can add / update / delete users from the Users page.
- Admins can do everything. Members can browse, borrow and return, and only see their own history.

## Folder layout

```
backend/    Express API + MySQL
  server.js           app setup (express.json, cors, routes)
  db.js               MySQL connection pool
  db/schema.sql       tables
  db/setup.js         creates tables + sample data
  middleware/auth.js  JWT check, admin check
  routes/             auth (login + register), books, users, transactions
  utils/rules.js      membership ID + password rules

frontend/   React (Vite)
  src/pages/          Dashboard, Books, Transactions, Users (with login), Register
  src/components/     BookCard, BookForm, BookList, UserForm, UserList,
                      TransactionForm, TransactionLog, Navbar, ...
  src/context/        AuthContext (who is logged in)
  src/hooks/useApi.js small data-loading hook
  src/api.js          fetch wrapper
  src/utils/          validators, formatting, constants
```

## Running it

You need Node 18+ and MySQL running locally.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then put your MySQL password in .env
npm run setup-db          # builds library_db and adds sample data
npm run dev               # http://localhost:5000
```
# then add new terminal while beckend is still open

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Test logins

| Name          | Membership ID | Password | Role   |
|---------------|---------------|----------|--------|
| Chere         | Admin1        | 12345    | admin  |
| Lerato Mohapi | Member1       | 11111    | member |

### Account rules

- Membership ID: `Member1`, `Member2` … for members, `Admin1`, `Admin2` … for admins.
- Password: exactly 5 digits.
- Self-registration always creates a **member**; the role is never taken from the request. Only an admin can create another admin (Users page).

## API

| Method | Route               | Who          |
|--------|---------------------|--------------|
| POST   | /auth/login         | anyone       |
| POST   | /auth/register      | anyone (creates a member) |
| GET    | /books, /books/:id  | logged in    |
| POST   | /books              | admin        |
| PUT    | /books/:id          | admin        |
| DELETE | /books/:id          | admin        |
| GET    | /transactions       | logged in (members: own only) |
| POST   | /transactions       | logged in (restock = admin)   |
| PUT    | /transactions/:id   | admin (stock is corrected)    |
| DELETE | /transactions/:id   | admin (stock change reversed) |
| GET    | /users              | admin        |
| POST   | /users              | admin        |
| PUT    | /users/:id          | admin        |
| DELETE | /users/:id          | admin        |

## Notes

- Passwords are hashed with bcrypt; login returns a JWT that the frontend sends as a Bearer token.
- Borrowing uses a DB transaction with `SELECT ... FOR UPDATE` so two people can't take the last copy at once.
- Editing or deleting a transaction undoes its old effect on stock and applies the new one inside a DB transaction. If that would make stock negative, it is refused.
- Low stock threshold lives in `frontend/src/utils/constants.js`.
