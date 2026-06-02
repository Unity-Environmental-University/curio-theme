export const hydrateSyllabus = () => {
  function hydrate() {
    const metaTable = document.querySelector("table[data-course-meta]");
    if (!metaTable) return;

    const courseData = {};
    metaTable.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length === 2) {
        courseData[cells[0].textContent.trim()] = cells[1].textContent.trim();
      }
    });

    document.querySelectorAll("[data-course-field]").forEach((el) => {
      const key = el.getAttribute("data-course-field");
      if (courseData[key] === undefined) return;

      if (key === "course-outcomes") {
        const ol = document.createElement("ol");
        courseData[key].split("|").forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.trim();
          ol.appendChild(li);
        });
        el.appendChild(ol);
      } else {
        el.textContent = courseData[key];
      }
    });
  }

  const metaTable = document.querySelector("table[data-course-meta]");
  if (metaTable) {
    hydrate();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector("table[data-course-meta]")) {
      hydrate();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
