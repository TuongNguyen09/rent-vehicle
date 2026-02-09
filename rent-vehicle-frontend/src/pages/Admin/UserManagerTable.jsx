import React from 'react';

const UserManagerTable = ({ users }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm border-b">
            <th className="p-4 font-bold">ID</th>
            <th className="p-4 font-bold">Họ tên</th>
            <th className="p-4 font-bold">Email</th>
            <th className="p-4 font-bold">Role</th>
            <th className="p-4 font-bold">Trạng thái</th>
            <th className="p-4 font-bold text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">{user.id}</td>
              <td className="p-4 font-bold text-gray-800">{user.fullName}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.role}</td>
              <td className="p-4">{user.status}</td>
              <td className="p-4 text-right">
                {/* TODO: Thêm nút sửa/xóa nếu cần */}
                <span className="text-xs text-gray-400">(Chưa có chức năng)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagerTable;
