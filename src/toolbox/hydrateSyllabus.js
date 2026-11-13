export const hydrateSyllabus = () => {
  if (window.__curioSyllabusHydratorInstalled) {
    window.__curioSyllabusHydratorSchedule?.();
    return;
  }

  window.__curioSyllabusHydratorInstalled = true;

  let hydrateQueued = false;

  // Fields whose table value is a pipe-separated list, and the list tag to render.
  const LIST_FIELDS = { "course-outcomes": "ol", textbook: "ul" };

  // Fields whose cell may contain links and basic emphasis, which are kept
  // (everything else in the cell is reduced to its text).
  const RICH_FIELDS = new Set(["textbook"]);
  const KEEP_TAGS = new Set(["I", "EM", "B", "STRONG", "A", "SPAN"]);
  const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

  // Canvas decorates external links on the page (including the ones in the
  // hidden table) with a screen-reader note ("Links to an external site.") and
  // an icon. Copying those would show the note as ordinary text, so they are
  // left behind; Canvas decorates the copied link on its own.
  const isCanvasLinkDecoration = (el) =>
    el.tagName === "SVG" ||
    el.classList.contains("screenreader-only") ||
    el.classList.contains("external_link_icon") ||
    el.classList.contains("ui-icon");

  // Copy a cell node into `parent`, keeping only links/emphasis. Anything else
  // contributes its text only.
  function appendSafe(node, parent) {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (isCanvasLinkDecoration(node)) return;
      const ok =
        KEEP_TAGS.has(node.tagName) &&
        (node.tagName !== "A" || SAFE_HREF.test(node.getAttribute("href") || ""));
      let target = parent;
      if (ok) {
        target = document.createElement(node.tagName.toLowerCase());
        if (node.tagName === "A") {
          target.setAttribute("href", node.getAttribute("href"));
        }
        parent.appendChild(target);
      }
      node.childNodes.forEach((child) => appendSafe(child, target));
    }
  }

  // Split a cell on "|" (in text only, so link targets are unaffected) into
  // one <div> per item, keeping links/emphasis that wrap the break intact.
  function splitRichCell(cell) {
    const safe = document.createElement("div");
    cell.childNodes.forEach((child) => appendSafe(child, safe));
    // A link with no text (left over from pasting) would show only Canvas's external-link note.
    safe.querySelectorAll("a").forEach((a) => {
      if (!a.textContent.trim()) a.remove();
    });

    const items = [];
    // `level` is the nesting depth: "|" starts a top-level item (0), "||" one
    // level in (1), "|||" two levels in, and so on.
    const startItem = (ancestors, level = 0) => {
      const root = document.createElement("div");
      let cur = root;
      ancestors.forEach((a) => {
        const copy = a.cloneNode(false);
        cur.appendChild(copy);
        cur = copy;
      });
      items.push({ root, cur, level });
    };
    const last = () => items[items.length - 1];

    const walk = (node, ancestors) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Odd entries are runs of "|"; the run length sets the next item's level.
        node.textContent.split(/(\|+)/).forEach((part, i) => {
          if (i % 2 === 1) startItem(ancestors, part.length - 1);
          else if (part) last().cur.appendChild(document.createTextNode(part));
        });
      } else if (!node.textContent.includes("|")) {
        last().cur.appendChild(node.cloneNode(true));
      } else {
        // The item break falls inside this element: re-create its shell in each item.
        const copy = node.cloneNode(false);
        last().cur.appendChild(copy);
        last().cur = copy;
        node.childNodes.forEach((child) => walk(child, ancestors.concat(node)));
        last().cur = last().cur.parentNode;
      }
    };

    startItem([]);
    safe.childNodes.forEach((child) => walk(child, []));

    return items
      .map(({ root, level }) => {
        // Trim whitespace at both edges, even when it sits inside a link or <i>.
        const edge = (side) => {
          let n = root;
          while (n && n.nodeType !== Node.TEXT_NODE) n = n[side];
          return n;
        };
        const first = edge("firstChild");
        const lastNode = edge("lastChild");
        if (first) first.textContent = first.textContent.trimStart();
        if (lastNode) lastNode.textContent = lastNode.textContent.trimEnd();
        return { node: root, level };
      })
      .filter(({ node }) => node.textContent.trim() !== "");
  }

  // Build a (possibly nested) list. An item can sit at most one level deeper
  // than the item before it, so "A | B ||| C" nests C one level under B.
  function buildList(listType, items, fill) {
    const root = document.createElement(listType);
    const lists = [root]; // lists[d] is the open list at depth d
    let prevLi = null;
    items.forEach((item) => {
      let depth = prevLi ? Math.min(item.level, lists.length) : 0;
      if (depth === lists.length) {
        const sub = document.createElement(listType);
        prevLi.appendChild(sub);
        lists.push(sub);
      } else {
        lists.length = depth + 1;
      }
      const li = document.createElement("li");
      fill(li, item);
      lists[depth].appendChild(li);
      prevLi = li;
    });
    return root;
  }

  function hydrate() {
    const metaTable = document.querySelector("table[data-course-meta]");
    if (!metaTable) return;

    const courseData = {};
    const courseCells = {};
    metaTable.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length === 2) {
        const key = cells[0].textContent.trim();
        courseData[key] = cells[1].textContent.trim();
        courseCells[key] = cells[1];
      }
    });

    document.querySelectorAll("[data-course-field]").forEach((el) => {
      const key = el.getAttribute("data-course-field");
      if (courseData[key] === undefined) return;

      const listType = LIST_FIELDS[key];
      const rich = RICH_FIELDS.has(key);
      // Rich cells are compared by their markup so a changed link re-hydrates.
      const signature = rich ? courseCells[key].innerHTML : courseData[key];

      // Outcomes are always a numbered list. Textbook is a bulleted list only
      // when it has more than one pipe-separated item; a single item is text.
      let items = null;
      if (rich) {
        items = splitRichCell(courseCells[key]);
      } else if (listType) {
        items = courseData[key]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((text) => ({ text, level: 0 }));
      }

      if (listType && (key === "course-outcomes" || items.length > 1)) {
        if (el.dataset.hydratedCourseValue === signature) return;

        el.textContent = "";
        el.appendChild(
          buildList(listType, items, (li, item) => {
            if (rich) li.append(...item.node.childNodes);
            else li.textContent = item.text;
          })
        );
        el.dataset.hydratedCourseValue = signature;
      } else if (rich) {
        if (el.dataset.hydratedCourseValue === signature) return;

        el.textContent = "";
        if (items.length) el.append(...items[0].node.childNodes);
        el.dataset.hydratedCourseValue = signature;
      } else {
        delete el.dataset.hydratedCourseValue;
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
