// Run once with:  npm run setup-db
// Builds the tables from schema.sql and puts in some starter data.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);
  console.log('tables created');

  const users = [
    ['Chere', 'Admin1', 'admin', '12345'],
    ['Lerato Mohapi', 'Member1', 'member', '11111'],
    ['Thabo Letsie', 'Member2', 'member', '22222'],
  ];
  for (const [name, mid, role, pw] of users) {
    const hash = await bcrypt.hash(pw, 10);
    await conn.query(
      'INSERT INTO library_db.users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      [name, mid, role, hash]
    );
  }

  const books = [
    ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 6],
    ['Mine Boy', 'Peter Abrahams', 'Fiction', '9780435900397', 1],
    ['Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '9780262046305', 3],
    ['Clean Code', 'Robert C. Martin', 'Computer Science', '9780132350884', 2],
    ['Long Walk to Freedom', 'Nelson Mandela', 'Biography', '9780316548182', 4],
    ['Chaka', 'Thomas Mofolo', 'Historical', '9780435905927', 0],
    ['Principles of Accounting', 'Belverd Needles', 'Business', '9781305087972', 5],
    ['Learning React', 'Alex Banks', 'Computer Science', '9781492051725', 1],
  ];
  for (const b of books) {
    await conn.query(
      'INSERT INTO library_db.books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      b
    );
  }

  await conn.query(
    `INSERT INTO library_db.transactions (book_id, user_id, type, quantity, note) VALUES
     (1, 1, 'restock', 6, 'Opening stock'),
     (2, 1, 'restock', 2, 'Opening stock'),
     (2, 2, 'borrow', 1, NULL)`
  );

  console.log('sample data added');
  console.log('admin login -> Admin1 / 12345');
  await conn.end();
}

main().catch((err) => {
  console.error('setup failed:', err.message);
  process.exit(1);
});
