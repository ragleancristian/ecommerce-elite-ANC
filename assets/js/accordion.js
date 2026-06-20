document
  .querySelectorAll(".accordion__header")
  .forEach((h) =>
    h.addEventListener("click", () => h.parentElement.classList.toggle("open")),
  );
