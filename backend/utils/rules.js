// Account rules, shared by registration and the admin user routes.
//   membership ID -> Member1, Member2 ...  or  Admin1, Admin2 ...
//   password      -> exactly 5 digits

const ID_PATTERNS = {
  member: /^Member\d{1,6}$/,
  admin: /^Admin\d{1,6}$/,
};

function idProblem(id, role) {
  if (!id) return 'Membership ID is required';
  if (!ID_PATTERNS[role]) return 'Role must be admin or member';
  if (!ID_PATTERNS[role].test(id)) {
    return role === 'admin'
      ? 'Admin IDs must look like Admin1, Admin2 ...'
      : 'Member IDs must look like Member1, Member2 ...';
  }
  return null;
}

function passwordProblem(pw) {
  if (typeof pw !== 'string' || !/^\d{5}$/.test(pw)) {
    return 'Password must be exactly 5 digits';
  }
  return null;
}

module.exports = { idProblem, passwordProblem };
