export const hydrateSyllabus = () => {
  if (window.__curioSyllabusHydratorInstalled) {
    window.__curioSyllabusHydratorSchedule?.();
    return;
  }

  window.__curioSyllabusHydratorInstalled = true;

  let hydrateQueued = false;

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
        if (el.dataset.hydratedCourseValue === courseData[key]) return;

        el.textContent = "";
        const ol = document.createElement("ol");
        courseData[key].split("|").forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.trim();
          ol.appendChild(li);
        });
        el.appendChild(ol);
        el.dataset.hydratedCourseValue = courseData[key];
      } else {
        if (el.textContent === courseData[key]) return;

        el.textContent = courseData[key];
      }
    });
  }

  const scheduleHydrate = () => {
    if (hydrateQueued) return;

    hydrateQueued = true;
    window.setTimeout(() => {
      hydrateQueued = false;
      hydrate();
    }, 50);
  };

  window.__curioSyllabusHydratorSchedule = scheduleHydrate;

  const observer = new MutationObserver(() => {
    scheduleHydrate();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const isSyllabusSave =
        target instanceof HTMLElement &&
        target.matches('button[type="submit"].btn.btn-primary') &&
        target.textContent.trim() === "Update Syllabus";

      if (isSyllabusSave) {
        window.setTimeout(scheduleHydrate, 150);
        window.setTimeout(scheduleHydrate, 500);
      }
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      const submitter = event.submitter;
      const isSyllabusSave =
        submitter?.matches('button[type="submit"].btn.btn-primary') &&
        submitter.textContent.trim() === "Update Syllabus";

      if (isSyllabusSave) {
        window.setTimeout(scheduleHydrate, 150);
        window.setTimeout(scheduleHydrate, 500);
      }
    },
    true
  );

  scheduleHydrate();
};
