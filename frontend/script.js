const API = "http://localhost:5000";

// Simple toast helper used across pages (safely attaches to window)
function showToast(message, duration = 1500) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("visible");
  setTimeout(() => {
    t.classList.remove("visible");
    t.textContent = "";
  }, duration);
}
window.showToast = showToast;

/* =========================
   REGISTER PAGE
========================= */
const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.textContent = "";

    const user = {
      fullName: document.getElementById("fullName").value.trim(),
      age: document.getElementById("age").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      pincode: document.getElementById("pincode").value.trim(),
      password: document.getElementById("password").value.trim(),
    };

    if (!user.fullName || !user.email || !user.phone || !user.password) {
      registerError.textContent = "Please fill required fields";
      return;
    }

    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        registerError.textContent = data.message;
        return;
      }

      localStorage.setItem("lastLoginId", user.email);
      window.location.href = "login.html";
    } catch {
      registerError.textContent = "Server error";
    }
  });
}

/* =========================
   LOGIN PAGE
========================= */
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
  const savedLoginId = localStorage.getItem("lastLoginId");
  if (savedLoginId) {
    document.getElementById("loginId").value = savedLoginId;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!loginId || !password) {
      loginError.textContent = "Enter login details";
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.textContent = data.message;
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } catch {
      loginError.textContent = "Server error";
    }
  });
}

/* =========================
   DASHBOARD PAGE
========================= */
const dFullName = document.getElementById("dFullName");
const user = JSON.parse(localStorage.getItem("user"));

/* Run auth check ONLY on dashboard page */
if (dFullName && !user) {
  window.location.href = "login.html";
}

if (dFullName) {
  // `user` already checked above and loaded from localStorage

  // Display user data
  dFullName.textContent = user.fullName;
  document.getElementById("dAge").textContent = user.age;
  document.getElementById("dPhone").textContent = user.phone;
  document.getElementById("dEmail").textContent = user.email;
  document.getElementById("dAddress").textContent = user.address;
  document.getElementById("dPincode").textContent = user.pincode;

  // ===== DOM references used by profile/password features =====
  const editFullName = document.getElementById("editFullName");
  const editAge = document.getElementById("editAge");
  const editPhone = document.getElementById("editPhone");
  const editEmail = document.getElementById("editEmail");
  const editAddress = document.getElementById("editAddress");
  const editPincode = document.getElementById("editPincode");
  const profileSuccess = document.getElementById("profileSuccess");

  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const confirmChange = document.getElementById("confirmChange");
  const passwordError = document.getElementById("passwordError");

  /* ===== UPDATE PROFILE ===== */
  const updateBtn = document.getElementById("updateProfileBtn");
  const profileError = document.getElementById("profileError");
  let editing = false;

  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      if (!editing) {
        fillEditFields(user);
        toggleEdit(true);
        updateBtn.textContent = "Save Profile";
        editing = true;
        return;
      }

      const updatedUser = {
        fullName: editFullName ? editFullName.value : "",
        age: editAge ? editAge.value : "",
        phone: editPhone ? editPhone.value : "",
        address: editAddress ? editAddress.value : "",
        pincode: editPincode ? editPincode.value : "",
      };

      try {
        const res = await fetch(`${API}/user/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });

        const data = await res.json();
        if (!res.ok) {
          if (profileError)
            profileError.textContent = data.message || "Server error";
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        if (profileError) profileError.textContent = "";
        if (profileSuccess)
          profileSuccess.textContent = "Profile updated successfully";

        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        if (profileError) profileError.textContent = "Server error";
        console.error(err);
      }
    });
  }

  function fillEditFields(user) {
    if (editFullName) editFullName.value = user.fullName;
    if (editAge) editAge.value = user.age;
    if (editPhone) editPhone.value = user.phone;
    if (editEmail) editEmail.value = user.email;
    if (editAddress) editAddress.value = user.address;
    if (editPincode) editPincode.value = user.pincode;
  }

  function toggleEdit(show) {
    const fields = [
      ["dFullName", "editFullName"],
      ["dAge", "editAge"],
      ["dPhone", "editPhone"],
      ["dEmail", "editEmail"],
      ["dAddress", "editAddress"],
      ["dPincode", "editPincode"],
    ];
    fields.forEach(([span, input]) => {
      const spanEl = document.getElementById(span);
      const inputEl = document.getElementById(input);
      if (spanEl) spanEl.style.display = show ? "none" : "inline";
      if (inputEl) inputEl.style.display = show ? "inline" : "none";
    });
  }

  /* ===== CHANGE PASSWORD ===== */
  const passwordModal = document.getElementById("passwordModal");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const savePasswordBtn = document.getElementById("savePasswordBtn");

  if (changePasswordBtn && passwordModal) {
    changePasswordBtn.addEventListener(
      "click",
      () => (passwordModal.style.display = "flex")
    );
  }

  if (closeModalBtn && passwordModal) {
    closeModalBtn.addEventListener(
      "click",
      () => (passwordModal.style.display = "none")
    );
  }

  if (savePasswordBtn) {
    savePasswordBtn.addEventListener("click", async () => {
      if (
        !newPassword ||
        !confirmPassword ||
        !confirmChange ||
        !passwordError
      ) {
        console.warn("Password modal elements missing");
        return;
      }

      const newPass = newPassword.value;
      const confirmPass = confirmPassword.value;
      const checked = confirmChange.checked;

      if (!newPass || newPass !== confirmPass || !checked) {
        passwordError.style.color = "red";
        passwordError.textContent = "Invalid password confirmation";
        return;
      }

      try {
        const res = await fetch(`${API}/user/password/${user.email}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPass }),
        });

        const data = await res.json();
        if (!res.ok) {
          passwordError.style.color = "red";
          passwordError.textContent = data.message || "Server error";
          return;
        }

        passwordError.style.color = "green";
        passwordError.textContent = "Password updated successfully";

        setTimeout(() => {
          if (passwordModal) passwordModal.style.display = "none";
          passwordError.textContent = "";
        }, 1200);
      } catch (err) {
        passwordError.style.color = "red";
        passwordError.textContent = "Server error";
        console.error(err);
      }
    });
  }

  /* ===== LOGOUT ===== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (typeof window.showToast === "function")
        window.showToast("Logging out...");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "login.html";
      }, 1000);
    });
  }
}
