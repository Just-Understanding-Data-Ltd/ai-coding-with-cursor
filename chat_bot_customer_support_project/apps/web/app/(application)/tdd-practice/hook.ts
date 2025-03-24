import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Simulating API call with mock data
        const mockUsers = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "user",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "admin",
          },
          {
            id: 3,
            name: "Bob Wilson",
            email: "bob@example.com",
            role: "user",
          },
        ];
        setUsers(mockUsers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const addUser = (user: Omit<User, "id">) => {
    setUsers((prev) => [...prev, { ...user, id: prev.length + 1 }]);
  };

  const removeUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return {
    users,
    loading,
    error,
    addUser,
    removeUser,
  };
};
