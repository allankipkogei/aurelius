import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'users.json');

// Helper to read from file
const getStoredUsers = () => {
  if (!fs.existsSync(filePath)) return {};
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper to write to file
const saveUsers = (users: any) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

export const users = {
  has: (email: string) => !!getStoredUsers()[email],
  set: (email: string, userData: any) => {
    const allUsers = getStoredUsers();
    allUsers[email] = userData;
    saveUsers(allUsers);
  },
  get: (email: string) => getStoredUsers()[email]
};