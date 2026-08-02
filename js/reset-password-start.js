const SUPABASE_HOSTNAME = "rxsodulayohkhqglpadu.supabase.co";
const VERIFY_PATH = "/auth/v1/verify";

const params = new URLSearchParams(window.location.search);
const confirmationUrl = params.get("confirmation_url");
const continueButton = document.getElementById("continueButton");
const startError = document.getElementById("startError");

function showError(message) {
  startError.textContent = message;
}

function getValidatedConfirmationUrl() {
  if (!confirmationUrl) {
    showError("This password reset request is invalid.");
    return null;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(confirmationUrl);
  } catch {
    showError("This password reset request is invalid.");
    return null;
  }

  const isAllowedDestination =
    parsedUrl.protocol === "https:" &&
    parsedUrl.hostname === SUPABASE_HOSTNAME &&
    parsedUrl.pathname.includes(VERIFY_PATH);

  if (!isAllowedDestination) {
    showError("This password reset request is invalid.");
    return null;
  }

  return parsedUrl.toString();
}

continueButton.addEventListener("click", () => {
  showError("");

  const destination = getValidatedConfirmationUrl();
  if (!destination) {
    return;
  }

  window.location.assign(destination);
});
