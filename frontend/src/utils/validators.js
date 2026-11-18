// Each validator returns an object like { fieldName: 'message' }.
// Empty object = all good.

const ID_PATTERNS = {
  member: /^Member\d{1,6}$/,
  admin: /^Admin\d{1,6}$/,
};
const PASSWORD_PATTERN = /^\d{5}$/;

export function validateBook(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Title is required';
  if (!v.author.trim()) errors.author = 'Author is required';
  if (!v.genre.trim()) errors.genre = 'Genre is required';

  const isbn = v.isbn.replace(/[-\s]/g, '');
  if (!isbn) errors.isbn = 'ISBN is required';
  else if (!/^\d{10}(\d{3})?$/.test(isbn)) errors.isbn = 'ISBN should be 10 or 13 digits';

  const qty = Number(v.quantity);
  if (v.quantity === '' || v.quantity === null) errors.quantity = 'Enter a quantity (0 is fine)';
  else if (!Number.isInteger(qty) || qty < 0) errors.quantity = 'Use a whole number, 0 or more';

  return errors;
}

function checkId(id, role) {
  if (!id.trim()) return 'Membership ID is required';
  if (!ID_PATTERNS[role].test(id.trim())) {
    return role === 'admin'
      ? 'Admin IDs look like Admin1, Admin2 …'
      : 'Member IDs look like Member1, Member2 …';
  }
  return null;
}

// admin adding / editing someone from the Users page
export function validateUser(v, { isNew }) {
  const errors = {};
  if (!v.name.trim()) errors.name = 'Name is required';

  const idMsg = checkId(v.membershipId, v.role);
  if (idMsg) errors.membershipId = idMsg;

  if (isNew && !v.password) errors.password = 'Set a password for the new user';
  else if (v.password && !PASSWORD_PATTERN.test(v.password)) errors.password = 'Exactly 5 digits';
  return errors;
}

// public sign-up form (members only)
export function validateRegister(v) {
  const errors = {};
  if (!v.name.trim()) errors.name = 'Please enter your name';

  const idMsg = checkId(v.membershipId, 'member');
  if (idMsg) errors.membershipId = idMsg;

  if (!v.password) errors.password = 'Choose a password';
  else if (!PASSWORD_PATTERN.test(v.password)) errors.password = 'Use exactly 5 digits, numbers only';

  if (v.confirm !== v.password) errors.confirm = 'The two passwords do not match';
  return errors;
}

export function validateTransaction(v, book) {
  const errors = {};
  if (!v.bookId) errors.bookId = 'Choose a book';
  const qty = Number(v.quantity);
  if (!Number.isInteger(qty) || qty < 1) errors.quantity = 'Enter a whole number, 1 or more';
  else if (v.type === 'borrow' && book && qty > book.quantity) {
    errors.quantity = `Only ${book.quantity} in stock`;
  }
  return errors;
}
