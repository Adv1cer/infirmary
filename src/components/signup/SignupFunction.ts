interface SignupData {
  username: string;
  email: string;
  password: string;
  phone: string;
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

    if (!response.ok) {
      throw new Error('Failed to sign up');
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Signup successful' };
  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Signup failed' };
  }
}