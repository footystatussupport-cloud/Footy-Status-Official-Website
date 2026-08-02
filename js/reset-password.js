import { supabase } from "./supabase-client.js";

const states = ["continueState", "verifyingState", "formState", "successState", "invalidState"];
const showState = (id) => states.forEach((name) => {
  document.getElementById(name).hidden = name !== id;
});

const form = document.getElementById("resetForm");
const continueButton = document.getElementById("continueButton");
const continueError = document.getElementById("continueError");
const password = document.getElementById("newPassword");
const confirm = document.getElementById("confirmPassword");
const save = document.getElementById("saveButton");
const formError = document.getElementById("formError");
const originalPath = window.location.pathname;

const params = new URLSearchParams(window.location.search);
const tokenHash = params.get("token_hash");
const recoveryType = params.get("type");
const errorCode = params.get("error_code");

let verificationStarted = false;
let recoverySessionReady = false;
let passwordUpdateStarted = false;

function clearErrors() {
  continueError.textContent = "";
  document.getElementById("newPasswordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
  formError.textContent = "";
  password.classList.remove("invalid");
  confirm.classList.remove("invalid");
}

function showContinueState() {
  recoverySessionReady = false;
  clearErrors();
  showState("continueState");
}

function showFormState() {
  recoverySessionReady = true;
  clearErrors();
  showState("formState");
  password.focus();
}

function showInvalidState() {
  recoverySessionReady = false;
  showState("invalidState");
}

function setContinueButtonDisabled(disabled) {
  continueButton.disabled = disabled;
  continueButton.textContent = disabled ? "Verifying..." : "Continue to Password Reset";
}

function setUpdateButtonDisabled(disabled) {
  save.disabled = disabled;
  save.textContent = disabled ? "Updating..." : "Update Password";
}

function validate() {
  clearErrors();

  if (!password.value) {
    document.getElementById("newPasswordError").textContent = "Enter a new password.";
    password.classList.add("invalid");
    return false;
  }

  if (password.value.length < 8) {
    document.getElementById("newPasswordError").textContent = "Password must be at least 8 characters.";
    password.classList.add("invalid");
    return false;
  }

  if (!confirm.value) {
    document.getElementById("confirmPasswordError").textContent = "Confirm your new password.";
    confirm.classList.add("invalid");
    return false;
  }

  if (password.value !== confirm.value) {
    document.getElementById("confirmPasswordError").textContent = "Passwords do not match.";
    confirm.classList.add("invalid");
    return false;
  }

  return true;
}

function initializeRecoveryPage() {
  if (errorCode === "otp_expired") {
    console.error("[reset-password] Recovery link already expired before verification.", { errorCode });
    showInvalidState();
    return;
  }

  if (!tokenHash || recoveryType !== "recovery") {
    console.error("[reset-password] Reset link missing required recovery parameters.", {
      hasTokenHash: Boolean(tokenHash),
      recoveryType,
      errorCode,
    });
    showInvalidState();
    return;
  }

  showContinueState();
}

async function handleContinueToReset() {
  if (verificationStarted) return;

  if (!tokenHash || recoveryType !== "recovery") {
    showInvalidState();
    return;
  }

  verificationStarted = true;
  setContinueButtonDisabled(true);
  clearErrors();
  showState("verifyingState");

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (error) {
      console.error("[reset-password] Recovery token verification failed:", {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      showInvalidState();
      return;
    }

    console.info("[reset-password] Recovery verification complete.", {
      hasSession: Boolean(data?.session),
      hasUser: Boolean(data?.user),
    });

    if (!data?.session || !data?.user) {
      console.error("[reset-password] Recovery verification returned no session.");
      showInvalidState();
      return;
    }

    showFormState();
  } catch (error) {
    console.error("[reset-password] Unexpected recovery verification error:", error);
    showInvalidState();
  } finally {
    setContinueButtonDisabled(false);
  }
}

document.querySelectorAll(".toggle-password").forEach((button) => button.addEventListener("click", () => {
  const input = document.getElementById(button.dataset.target);
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  button.textContent = showing ? "Show" : "Hide";
  button.setAttribute("aria-label", `${showing ? "Show" : "Hide"} ${input.id === "newPassword" ? "new" : "confirmed"} password`);
}));

continueButton.addEventListener("click", handleContinueToReset);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (passwordUpdateStarted || !recoverySessionReady || !validate()) return;

  passwordUpdateStarted = true;
  setUpdateButtonDisabled(true);

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password.value,
    });

    if (error) {
      console.error("[reset-password] Password update failed:", {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      formError.textContent = error.message || "Unable to update your password.";
      passwordUpdateStarted = false;
      return;
    }

    console.info("[reset-password] Password update complete.", {
      hasUser: Boolean(data?.user),
    });

    password.value = "";
    confirm.value = "";
    clearErrors();
    recoverySessionReady = false;
    window.history.replaceState({}, document.title, originalPath);

    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.info("[reset-password] Sign-out after password update failed.", signOutError);
    }

    showState("successState");
  } catch (error) {
    console.error("[reset-password] Unexpected password update error:", error);
    formError.textContent = "Unable to update your password.";
    passwordUpdateStarted = false;
  } finally {
    setUpdateButtonDisabled(false);
  }
});

initializeRecoveryPage();
