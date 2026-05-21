// Authentication handlers for login and signup pages
//test change

const handleLogin = async (e) => {
  e.preventDefault();
  hideAlert('alert');
  showLoading(true);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    setUser(data.user);
    go('/dashboard');
  } catch (error) {
    showAlert('alert', error.message);
  } finally {
    showLoading(false);
  }
};

const handleSignup = async (e) => {
  e.preventDefault();
  hideAlert('alert');
  showLoading(true);

  const form = document.getElementById('signupForm');
  const formData = new FormData(form);

  try {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: formData,
    });

    setToken(data.token);
    setUser(data.user);
    go('/dashboard');
  } catch (error) {
    showAlert('alert', error.message);
  } finally {
    showLoading(false);
  }
};
