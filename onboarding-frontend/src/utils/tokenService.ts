let logoutTimer: any = null;

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export function startAutoLogoutTimer(token: string) {

  const decoded = parseJwt(token);

  if (!decoded || !decoded.exp) return;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  const timeout = expirationTime - currentTime;

  if (timeout <= 0) {
    logoutNow();
    return;
  }

  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }

  logoutTimer = setTimeout(() => {
    logoutNow();
  }, timeout);
}

export function logoutNow() {
  console.log("🚨 Token expiré → Logout automatique");

  localStorage.removeItem("jwt_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");

  window.location.href = "/login";
}