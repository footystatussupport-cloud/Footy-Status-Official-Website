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

let authEventSession = null;
let recoveryInitialized = false;
let recoverySessionReady = false;
let submitting = false;
let recoveryCode = null;
let recoveryExchangePromise = null;

save.textContent = "Update Password";

const subscription = supabase.auth.onAuthStateChange((event, session) => {
  console.info("[reset-password] Auth state changed:", event, Boolean(session?.user));

  if (session?.user) {
    authEventSession = session;
  }
}).data.subscription;

function clearErrors() {
  document.getElementById("newPasswordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
  formError.textContent = "";
  password.classList.remove("invalid");
  confirm.classList.remove("invalid");
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

async function getCurrentSession(context) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(`[reset-password] getSession failed ${context}:`, error);
    return null;
  }

  console.info(`[reset-password] Recovery session available ${context}:`, Boolean(session?.user));
  return session?.user ? session : null;
}

async function waitForRecoverySession() {
  if (authEventSession?.user) {
    return authEventSession;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const session = await getCurrentSession(`after code exchange attempt ${attempt + 1}`);
    if (session?.user) {
      return session;
    }

    if (authEventSession?.user) {
      return authEventSession;
    }
  }

  return null;
}

async function initializePasswordRecovery() {
  if (recoveryInitialized) {
    return recoveryExchangePromise;
  }

  recoveryInitialized = true;
  showState("verifyingState");

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  console.info("[reset-password] Recovery code present:", Boolean(code));

  if (!code) {
    console.error("[reset-password] Missing recovery code in reset URL.");
    showInvalidState();
    return Promise.resolve();
  }

  if (recoveryCode === code && recoveryExchangePromise) {
    return recoveryExchangePromise;
  }

  recoveryCode = code;
  recoveryExchangePromise = (async () => {
    console.info("[reset-password] Starting exchangeCodeForSession...");

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[reset-password] Password recovery code exchange failed:", error);

      const sessionAfterError = await waitForRecoverySession();
      if (sessionAfterError?.user) {
        console.info("[reset-password] Continuing with an already-established recovery session.");
        showFormState();
        return;
      }

      showInvalidState();
      return;
    }

    console.info("[reset-password] Code exchange finished. Session returned:", Boolean(data?.session?.user));

    const session = data?.session?.user ? data.session : await waitForRecoverySession();
    if (!session?.user) {
      console.error("[reset-password] Code exchange completed without a recovery session.", data);
      showInvalidState();
      return;
    }

    showFormState();
  })().catch((error) => {
    console.error("[reset-password] Reset flow initialization failed:", error);
    showInvalidState();
  });

  return recoveryExchangePromise;
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
  if (submitting) return;

  await initializePasswordRecovery();
  if (!recoverySessionReady || !validate()) return;

  submitting = true;
  save.disabled = true;
  save.textContent = "Updating...";

  try {
    const { error } = await supabase.auth.updateUser({ password: password.value });

    if (error) {
      console.error("[reset-password] Password update failed:", error);
      throw error;
    }

    password.value = "";
    confirm.value = "";
    clearErrors();
    recoverySessionReady = false;
    window.history.replaceState({}, document.title, originalPath);
    showState("successState");
  } catch (error) {
    const message = error?.message || "We couldn’t update your password. Please try again.";

    if (/expired|invalid|session|token|code|recovery/i.test(message)) {
      showInvalidState();
    } else {
      formError.textContent = message;
    }
  } finally {
    submitting = false;
    save.disabled = false;
    save.textContent = "Update Password";
  }
});

window.addEventListener("pagehide", () => subscription.unsubscribe(), { once: true });
initializePasswordRecovery();
