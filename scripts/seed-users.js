// Seed demo users — run: node scripts/seed-users.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const { normalizeUniversity } = require('../utils/university');

const DEMO_UNIVERSITY = 'BIET';

const DEMO_USERS = [
  {
    fullName: 'Vignesh',
    username: 'vignesh',
    email: 'vignesh@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '3',
    section: 'A',
  },
  {
    fullName: 'Kavya',
    username: 'kavya',
    email: 'kavya@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '3',
    section: 'A',
  },
  // BIET — IV Year CSE-B
  {
    fullName: 'Varsha',
    username: 'varsha',
    email: 'varsha@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
  {
    fullName: 'Pranay',
    username: 'pranay',
    email: 'pranay@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
  {
    fullName: 'Varun',
    username: 'varun',
    email: 'varun@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
  {
    fullName: 'Shanmukh Sonu',
    username: 'shanmukhsonu',
    email: 'shanmukhsonu@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
  {
    fullName: 'Nikhila',
    username: 'nikhila',
    email: 'nikhila@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
  {
    fullName: 'Siri',
    username: 'siri',
    email: 'siri@campus.edu',
    password: 'password123',
    university: DEMO_UNIVERSITY,
    department: 'CSE',
    year: '4',
    section: 'B',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-memories');

  for (const data of DEMO_USERS) {
    const existing = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existing) {
      existing.fullName = data.fullName;
      existing.university = normalizeUniversity(data.university);
      existing.username = data.username;
      existing.department = data.department;
      existing.year = data.year;
      existing.section = data.section;
      if (!existing.username) existing.username = data.username;
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(data.password, salt);
      await existing.save();
      console.log(`Updated: ${data.fullName} (@${existing.username}) — ${data.email}`);
      continue;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);
    const user = await User.create({ ...data, password: hashed });
    console.log(`Created: ${user.fullName} (@${user.username}) — ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('\nDone. Login at http://localhost:3000/login');
  console.log('Default password for all demo accounts: password123');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
