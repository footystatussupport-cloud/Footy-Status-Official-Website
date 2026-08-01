import { supabase } from "./supabase-client.js";

const states = ["verifyingState", "formState", "successState", "invalidState"];
const showState = id => states.forEach(name => { document.getElementById(name).hidden = name !== id; });
const form = document.getElementById("resetForm");
const password = document.getElementById("newPassword");
const confirm = document.getElementById("confirmPassword");
const save = document.getElementById("saveButton");
const formError = document.getElementById("formError");
const originalUrl = new URL(window.location.href);
let recoveryEventReceived = false;
let validRecoverySession = false;
let submitting = false;

const subscription = supabase.auth.onAuthStateChange(event => {
  if (event === "PASSWORD_RECOVERY") recoveryEventReceived = true;
}).data.subscription;

function recoveryEvidence() {
  const queryType = originalUrl.searchParams.get("type");
  const hash = new URLSearchParams(originalUrl.hash.replace(/^#/, ""));
  return originalUrl.searchParams.has("code") ||
    originalUrl.searchParams.has("token_hash") ||
    queryType === "recovery" || hash.get("type") === "recovery" ||
    (hash.has("access_token") && hash.has("refresh_token"));
}

async function establishRecoverySession() {
  try {
    if (!recoveryEvidence()) return showState("invalidState");

    const code = originalUrl.searchParams.get("code");
    const tokenHash = originalUrl.searchParams.get("token_hash");
    const hash = new URLSearchParams(originalUrl.hash.replace(/^#/, ""));

    let session = (await supabase.auth.getSession()).data.session;
    if (!session && tokenHash) {
      const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (result.error) throw result.error;
      session = result.data.session;
    }
    if (!session && code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      if (result.error) throw result.error;
      session = result.data.session;
    }
    if (!session && hash.get("access_token") && hash.get("refresh_token")) {
      const result = await supabase.auth.setSession({ access_token: hash.get("access_token"), refresh_token: hash.get("refresh_token") });
      if (result.error) throw result.error;
      session = result.data.session;
    }
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 350));
      session = (await supabase.auth.getSession()).data.session;
    }
    if (!session?.user || (!recoveryEventReceived && !recoveryEvidence())) return showState("invalidState");

    validRecoverySession = true;
    history.replaceState({}, document.title, "/reset-password/");
    showState("formState");
    password.focus();
  } catch {
    showState("invalidState");
  }
}

document.querySelectorAll(".toggle-password").forEach(button => button.addEventListener("click", () => {
  const input = document.getElementById(button.dataset.target);
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  button.textContent = showing ? "Show" : "Hide";
  button.setAttribute("aria-label", `${showing ? "Show" : "Hide"} ${input.id === "newPassword" ? "new" : "confirmed"} password`);
}));

function validate() {
  const firstError = document.getElementById("newPasswordError");
  const secondError = document.getElementById("confirmPasswordError");
  firstError.textContent = ""; secondError.textContent = ""; formError.textContent = "";
  password.classList.remove("invalid"); confirm.classList.remove("invalid");
  if (!password.value) { firstError.textContent = "Enter a new password."; password.classList.add("invalid"); return false; }
  if (password.value.length < 8) { firstError.textContent = "Password must be at least 8 characters."; password.classList.add("invalid"); return false; }
  if (!confirm.value) { secondError.textContent = "Confirm your new password."; confirm.classList.add("invalid"); return false; }
  if (password.value !== confirm.value) { secondError.textContent = "Passwords do not match."; confirm.classList.add("invalid"); return false; }
  return true;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submitting || !validRecoverySession || !validate()) return;
  submitting = true; save.disabled = true; save.textContent = "Saving…";
  try {
    const result = await supabase.auth.updateUser({ password: password.value });
    if (result.error) throw result.error;
    password.value = ""; confirm.value = ""; validRecoverySession = false;
    showState("successState");
  } catch {
    formError.textContent = "We couldn’t update your password. The link may have expired or there may be a network problem. Request a new link and try again.";
  } finally {
    submitting = false; save.disabled = false; save.textContent = "Save New Password";
  }
});

window.addEventListener("pagehide", () => subscription.unsubscribe(), { once: true });
establishRecoverySession();
