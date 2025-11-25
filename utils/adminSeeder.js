// Ensures at least one admin account exists using ADMIN_* environment variables
const User = require('../models/User');

const ensureAdminAccount = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_FORCE_PASSWORD_RESET } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    console.warn('[adminSeeder] ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME missing. Skipping admin creation.');
    return;
  }

  const normalizedEmail = ADMIN_EMAIL.toLowerCase();
  let adminUser = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!adminUser) {
    await User.create({
      name: ADMIN_NAME,
      email: normalizedEmail,
      password: ADMIN_PASSWORD,
      role: 'admin',
      goals: 'System administrator account',
    });
    console.info('[adminSeeder] Admin account created.');
    return;
  }

  let updated = false;

  if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    updated = true;
  }

  if (ADMIN_FORCE_PASSWORD_RESET === 'true') {
    adminUser.password = ADMIN_PASSWORD;
    updated = true;
  }

  if (updated) {
    await adminUser.save();
    console.info('[adminSeeder] Admin account updated/promoted.');
  }
};

module.exports = ensureAdminAccount;


