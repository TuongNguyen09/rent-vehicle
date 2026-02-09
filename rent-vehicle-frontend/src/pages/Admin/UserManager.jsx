import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';
import UserManagerTable from './UserManagerTable';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await userService.getAllUsers();
        setUsers(res.result || []);
      } catch (err) {
        setError('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <UserManagerTable users={users} />
      )}
    </div>
  );
};

export default UserManager;
