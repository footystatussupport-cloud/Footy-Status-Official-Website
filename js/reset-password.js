import { supabase } from "./supabase-client.js";

const states = ["verifyingState", "formState", "successState", "invalidState"];
const showState = (id) => states.forEach((name) => {
  document.getElementById(name).hidden = name !== id;
});

const form = document.getElementById("resetForm");
const password = document.getElementById("newPassword");
const confirm = document.getElementById("confirmPassword");
const save = document.getElementById("saveButton");
const formError = document.getElementById("formError");
const originalPath = window.location.pathname;

let recoveryEventReceived = false;
let validRecoverySession = false;
let submitting = false;
let exchangePromise = null;
let exchangedCode = null;

const subscription = supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") recoveryEventReceived = true;
}).data.subscription;

function recoveryEvidence(currentUrl = new URL(window.location.href)) {
  const queryType = currentUrl.searchParams.get("type");
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return currentUrl.searchParams.has("code") ||
    currentUrl.searchParams.has("token_hash") ||
    queryType === "recovery" ||
    hash.get("type") === "recovery" ||
    (hash.has("access_token") && hash.has("refresh_token"));
}

function clearErrors() {
  document.getElementById("newPasswordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
  formError.textContent = "";
  password.classList.remove("invalid");
  confirm.classList.remove("invalid");
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

async function establishRecoverySession() {
  if (exchangePromise) return exchangePromise;

  exchangePromise = (async () => {
    showState("verifyingState");

    try {
      const currentUrl = new URL(window.location.href);
      const code = new URLSearchParams(window.location.search).get("code");
      const tokenHash = currentUrl.searchParams.get("token_hash");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const linkError = currentUrl.searchParams.get("error_description") || hash.get("error_description");

      if (linkError || !recoveryEvidence(currentUrl)) {
        showState("invalidState");
        return;
      }

      let session = (await supabase.auth.getSession()).data.session;

      if (!session && tokenHash) {
        const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (result.error) throw result.error;
        session = result.data.session;
      }

      if (!session && code && exchangedCode !== code) {
        exchangedCode = code;
        const result = await supabase.auth.exchangeCodeForSession(code);
        if (result.error) throw result.error;
        session = result.data.session;
      }

      if (!session && hash.get("access_token") && hash.get("refresh_token")) {
        const result = await supabase.auth.setSession({
          access_token: hash.get("access_token"),
          refresh_token: hash.get("refresh_token"),
        });
        if (result.error) throw result.error;
        session = result.data.session;
      }

      if (!session) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        session = (await supabase.auth.getSession()).data.session;
      }

      if (!session?.user && !recoveryEventReceived) {
        showState("invalidState");
        return;
      }

      validRecoverySession = true;
      if (window.location.search || window.location.hash) {
        history.replaceState({}, document.title, originalPath);
      }
      clearErrors();
      showState("formState");
      password.focus();
    } catch {
      validRecoverySession = false;
      showState("invalidState");
    }
  })();

  return exchangePromise;
}

document.querySelectorAll(".toggle-password").forEach((button) => button.addEventListener("click", () => {
  const input = document.getElementById(button.dataset.target);
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  button.textContent = showing ? "Show" : "Hide";
  button.setAttribute("aria-label", `${showing ? "Show" : "Hide"} ${input.id === "newPassword" ? "new" : "confirmed"} password`);
}));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting || !validRecoverySession || !validate()) return;

  submitting = true;
  save.disabled = true;
  save.textContent = "Resetting...";

  try {
    const { error } = await supabase.auth.updateUser({ password: password.value });
    if (error) throw error;

    password.value = "";
    confirm.value = "";
    validRecoverySession = false;
    showState("successState");
  } catch (error) {
    if (/expired|invalid|session|token|code/i.test(error?.message || "")) {
      showState("invalidState");
    } else {
      formError.textContent = error?.message || "We couldn’t update your password. Please try again.";
    }
  } finally {
    submitting = false;
    save.disabled = false;
    save.textContent = "Reset Password";
  }
});

window.addEventListener("pagehide", () => subscription.unsubscribe(), { once: true });
establishRecoverySession();
