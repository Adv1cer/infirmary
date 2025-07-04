import { signIn } from 'next-auth/react';

interface LoginData {
  email: string;
  password: string;
}

export async function handleLogin(data: LoginData): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    // Using NextAuth's signIn method instead of calling the API directly
    const response = await signIn("credentials", {
      redirect: false,  // Prevent automatic redirect
      email: data.email,
      password: data.password,
    });

    if (response?.error) {
      // Show a friendly message for all credential errors
      return { success: false, message: "Invalid email or password" };
    }

    // Assuming JWT or session is successfully generated by NextAuth
    const token = response?.ok ? 'token' : undefined;  

    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: "Internal server error" };
  }
}
