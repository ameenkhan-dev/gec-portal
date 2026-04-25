/**
 * In-Memory User Store (for testing without database)
 * Stores users in memory - useful for quick testing
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user database
let users = [];

async function initializeMemoryUsers() {
  console.log('⚠️ Using in-memory user store (for testing only!)');
  
  // Create test users
  const testUsers = [
    { name: 'Admin User', email: 'admin@gec.ac.in', password: 'Admin123', role: 'super_admin' },
    { name: 'Test Student', email: 'student@gec.ac.in', password: 'Student123', role: 'student' },
    { name: 'Club Admin', email: 'clubadmin@gec.ac.in', password: 'ClubAdmin123', role: 'club_admin' }
  ];

  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    users.push({
      user_id: users.length + 1,
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role
    });
  }

  console.log(`✓ Initialized ${users.length} in-memory users`);
}

async function loginWithMemory(email, password) {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
  };
}

async function registerWithMemory(name, email, password, role) {
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    user_id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    role: role || 'student'
  };

  users.push(newUser);
  return { message: 'User registered successfully' };
}

module.exports = {
  initializeMemoryUsers,
  loginWithMemory,
  registerWithMemory,
  getMemoryUsers: () => users
};
