const API = "http://localhost:5000";

async function loadUserFromServer() {
  try {
    const res = await fetch(`${API}/user`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    console.error(err);
    localStorage.clear();
    window.location.href = "login.html";
  }
}

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

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
      showToast("Please fill required fields");
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
        showToast(data.message || "Server error");
        return;
      }

      localStorage.setItem("lastLoginId", user.email);
      showToast("Account created successfully");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch {
      showToast("Server error");
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const savedLoginId = localStorage.getItem("lastLoginId");
  if (savedLoginId) {
    document.getElementById("loginId").value = savedLoginId;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!loginId || !password) {
      showToast("Enter login details");
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
        showToast(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      showToast("Logging in...");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch {
      showToast("Server error");
    }
  });
}

const dFullName = document.getElementById("dFullName");
let user = null;

if (dFullName) {
  (async () => {
    user = await loadUserFromServer();

    document.getElementById("greeting").textContent =
      "Good to see you, " + user.fullName.split(" ")[0];

    dFullName.textContent = user.fullName;
    document.getElementById("dAge").textContent = user.age || "";
    document.getElementById("dPhone").textContent = user.phone || "";
    document.getElementById("dEmail").textContent = user.email || "";
    document.getElementById("dAddress").textContent = user.address || "";
    document.getElementById("dPincode").textContent = user.pincode || "";

    setupDashboardActions(user);
  })();
}

function setupDashboardActions(user) {
  const editFullName = document.getElementById("editFullName");
  const editAge = document.getElementById("editAge");
  const editPhone = document.getElementById("editPhone");
  const editAddress = document.getElementById("editAddress");
  const editPincode = document.getElementById("editPincode");

  const updateBtn = document.getElementById("updateProfileBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteBtn = document.getElementById("deleteAccountBtn");

  const passwordModal = document.getElementById("passwordModal");
  const savePasswordBtn = document.getElementById("savePasswordBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const confirmChange = document.getElementById("confirmChange");

  let editing = false;

  updateBtn.addEventListener("click", async () => {
    if (!editing) {
      editFullName.value = user.fullName;
      editAge.value = user.age;
      editPhone.value = user.phone;
      editAddress.value = user.address;
      editPincode.value = user.pincode;

      toggleEdit(true);
      updateBtn.textContent = "Save Profile";
      editing = true;
      return;
    }

    const updatedUser = {
      fullName: editFullName.value,
      age: editAge.value,
      phone: editPhone.value,
      email: editEmail.value,
      address: editAddress.value,
      pincode: editPincode.value,
    };

    const res = await fetch(`${API}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();
    if (!res.ok) return showToast(data.message);

    showToast("Profile updated");
    setTimeout(() => location.reload(), 800);
  });

  changePasswordBtn.addEventListener("click", () => {
    passwordModal.style.display = "flex";
  });

  closeModalBtn.addEventListener("click", () => {
    passwordModal.style.display = "none";
    newPassword.value = "";
    confirmPassword.value = "";
    confirmChange.checked = false;
  });

  savePasswordBtn.addEventListener("click", async () => {
    if (
      !newPassword.value ||
      newPassword.value !== confirmPassword.value ||
      !confirmChange.checked
    ) {
      return showToast("Password confirmation invalid");
    }

    const res = await fetch(`${API}/user/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ password: newPassword.value }),
    });

    const data = await res.json();
    if (!res.ok) return showToast(data.message);

    showToast("Password updated");
    passwordModal.style.display = "none";
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Delete account permanently?")) return;

    await fetch(`${API}/user`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    localStorage.clear();
    window.location.href = "index.html";
  });
}

function toggleEdit(show) {
  const fields = [
    ["dFullName", "editFullName"],
    ["dAge", "editAge"],
    ["dPhone", "editPhone"],
    ["dAddress", "editAddress"],
    ["dPincode", "editPincode"],
  ];

  fields.forEach(([span, input]) => {
    document.getElementById(span).style.display = show ? "none" : "inline";
    document.getElementById(input).style.display = show ? "inline" : "none";
  });
}
