const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    registerError.textContent = "";

    const fullName = document.getElementById("fullName").value.trim();
    const age = document.getElementById("age").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!fullName || !email || !password) {
      registerError.textContent = "Full Name, Email and Password are required.";
      return;
    }

    const existingUser = localStorage.getItem("userData");

    if (existingUser) {
      const storedUser = JSON.parse(existingUser);

      if (email === storedUser.email || phone === storedUser.phone) {
        registerError.textContent =
          "User already registered with this Email or Phone.";
        return;
      }
    }

    const userData = {
      fullName,
      age,
      phone,
      email,
      address,
      pincode,
      password,
    };

    localStorage.setItem("userData", JSON.stringify(userData));

    localStorage.setItem("loginId", email || phone);

    window.location.href = "login.html";
  });
}

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
  const savedLoginId = localStorage.getItem("loginId");
  if (savedLoginId) {
    document.getElementById("loginId").value = savedLoginId;
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    loginError.textContent = "";

    const loginId = document.getElementById("loginId").value.trim();
    const loginPassword = document.getElementById("loginPassword").value.trim();

    if (!loginId || !loginPassword) {
      loginError.textContent = "Please enter Email/Phone and Password.";
      return;
    }

    const storedUser = localStorage.getItem("userData");

    if (!storedUser) {
      loginError.textContent = "No account found. Please register first.";
      return;
    }

    const userData = JSON.parse(storedUser);

    if (
      (loginId !== userData.email && loginId !== userData.phone) ||
      loginPassword !== userData.password
    ) {
      loginError.textContent = "Invalid Email/Phone or Password.";
      return;
    }

    window.location.href = "dashboard.html";
  });
}

const fullNameEl = document.getElementById("dFullName");

if (fullNameEl) {
  const storedUser = localStorage.getItem("userData");

  if (!storedUser) {
    window.location.href = "login.html";
  } else {
    const userData = JSON.parse(storedUser);

    document.getElementById("dFullName").textContent = userData.fullName;
    document.getElementById("dAge").textContent = userData.age;
    document.getElementById("dPhone").textContent = userData.phone;
    document.getElementById("dEmail").textContent = userData.email;
    document.getElementById("dAddress").textContent = userData.address;
    document.getElementById("dPincode").textContent = userData.pincode;
  }

  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });
}
