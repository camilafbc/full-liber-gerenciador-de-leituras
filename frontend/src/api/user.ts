export const getUser = async (token: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["show-user-data"],
    },
  });
  const result = await response.json();
  return result;
};

export const updateUserData = async (
  token: string,
  name?: string,
  password?: string,
) => {
  const data = {};

  if (name) data.name = name;
  if (password) data.password = password;

  if (Object.keys(data).length === 0) return null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  return await response.json();
};
