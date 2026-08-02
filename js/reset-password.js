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

let recoveryEventSession = null;
let validRecoverySession = false;
let submitting = false;
let exchangePromise = null;
let exchangedCode = null;

const subscription = supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY" && session) {
    recoveryEventSession = session;
    console.info("[reset-password] Recovery event received with session:", Boolean(session));
    return;
  }

  if (event === "SIGNED_IN" && session) {
    recoveryEventSession = session;
    console.info("[reset-password] Sign-in event received during reset flow.");
  }
}).data.subscription;

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

async function waitForSessionAfterExchange() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("[reset-password] getSession failed after exchangeCodeForSession:", error);
      throw error;
    }

    console.info(`[reset-password] Recovery session exists after exchange attempt ${attempt + 1}:`, Boolean(session));
    if (session?.user) return session;
  }

  if (recoveryEventSession?.user) {
    console.info("[reset-password] Using recovery session from auth event fallback.");
    return recoveryEventSession;
  }

  return null;
}

async function establishRecoverySession() {
  if (exchangePromise) return exchangePromise;

  exchangePromise = (async () => {
    showState("verifyingState");

    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      console.info("[reset-password] Recovery code found:", Boolean(code));

      if (code) {
        if (exchangedCode !== code) {
          exchangedCode = code;
          console.info("[reset-password] Starting exchangeCodeForSession...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("[reset-password] Password recovery code exchange failed:", error);
            showState("invalidState");
            return;
          }

          console.info("[reset-password] Code exchange succeeded. Session returned:", Boolean(data?.session));

          let session = data?.session ?? null;
          if (!session?.user) {
            session = await waitForSessionAfterExchange();
          }

          if (!session?.user) {
            console.error("[reset-password] No recovery session was available after a successful code exchange.");
            showState("invalidState");
            return;
          }

          validRecoverySession = true;
          window.history.replaceState({}, document.title, originalPath);
          clearErrors();
          showState("formState");
          password.focus();
          return;
        }

        console.info("[reset-password] Code exchange already started for this recovery code.");
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[reset-password] getSession failed without a code:", error);
        showState("invalidState");
        return;
      }

      console.info("[reset-password] Recovery session exists without code:", Boolean(session));

      if (!session?.user) {
        showState("invalidState");
        return;
      }

      validRecoverySession = true;
      clearErrors();
      showState("formState");
      password.focus();
    } catch (error) {
      validRecoverySession = false;
      console.error("[reset-password] Reset flow initialization failed:", error);
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
    if (error) {
      console.error("[reset-password] updateUser failed:", error);
      throw error;
    }

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
