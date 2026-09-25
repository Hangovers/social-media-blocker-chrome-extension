// Chrome exposes `chrome`, Firefox/Floorp expose `browser`.
const extApi = globalThis.browser ?? globalThis.chrome;

const startTime = document.querySelector("#start_time");
const endTime = document.querySelector("#end_time");
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const submit = document.querySelector("#submit");
const saveStatus = document.querySelector("#save-status");

extApi.storage.sync.get("socialMediaBlockerOptions", (data) => {
  const savedOptions = data.socialMediaBlockerOptions || {};

  startTime.value = savedOptions.startTime || "12:00";
  endTime.value = savedOptions.endTime || "06:00";
  for (const checkbox of checkboxes) {
    checkbox.checked = Boolean(savedOptions[checkbox.name]);
  }
});

submit.addEventListener("click", () => {
  const socialMediaBlockerOptions = {
    startTime: startTime.value,
    endTime: endTime.value,
  };

  for (const checkbox of checkboxes) {
    socialMediaBlockerOptions[checkbox.name] = checkbox.checked;
  }

  extApi.storage.sync.set({ socialMediaBlockerOptions }, () => {
    saveStatus.textContent = "Options saved successfully!";
  });
});
