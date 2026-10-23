const APP_VERSION = {
  major: 1,
  minor: 0,
  patch: 6,
  label: "",
  buildDate: "2026-10-23"
};

function getAppVersion() {
  const { major, minor, patch, label } = APP_VERSION;
  return `${major}.${minor}.${patch}${label ? "-" + label : ""}`;
}

function showAppVersion() {
  console.log(`Genie AppCore version: ${getAppVersion()}`);
}