// Script tạo password hash cho admin
// Chạy: node generateHash.js

import bcrypt from 'bcrypt';

const password = 'admin123'; // Đổi password tại đây
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('\n🔐 Password Hash Generated:\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n📝 Copy hash này vào schema.sql để thay thế password admin\n');
});
