import fetch from 'node-fetch';

async function createAdminUser() {
  try {
    console.log('Attempting to create admin user...');
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin2',
        password: 'password',
        name: 'Admin User 2'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

createAdminUser().catch(console.error);