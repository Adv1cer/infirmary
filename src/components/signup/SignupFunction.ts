interface SignupData {
  username: string;
  email: string;
  password: string;
  phone: string;
  token?: string;
}

export async function handleSignup(data: SignupData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/Signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, message: result.message || 'Failed to sign up' };
    }

    return { success: result.success, message: result.message || 'Signup successful' };
  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Signup failed' };
  }
}