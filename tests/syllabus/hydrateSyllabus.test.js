import { hydrateSyllabus } from '../../src/toolbox/hydrateSyllabus.js';

const row = (key, value) => `<tr><td>${key}</td><td>${value}</td></tr>`;

const page = (rows) => {
    document.body.innerHTML = `
        <table data-course-meta><tbody>${rows}</tbody></table>
        <p><span data-course-field="course-title">&nbsp;</span></p>
        <div><span data-course-field="course-outcomes">&nbsp;</span></div>
        <div><span data-course-field="textbook">&nbsp;</span></div>`;
};

const run = () => {
    hydrateSyllabus();
    jest.advanceTimersByTime(100);
};

const textbook = () => document.querySelector('[data-course-field="textbook"]');

describe('hydrateSyllabus', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        delete window.__curioSyllabusHydratorInstalled;
        delete window.__curioSyllabusHydratorSchedule;
    });
    afterEach(() => jest.useRealTimers());

    test('plain fields are filled as text', () => {
        page(row('course-title', 'BIO 101'));
        run();
        expect(document.querySelector('[data-course-field="course-title"]').textContent).toBe('BIO 101');
    });

    test('outcomes become a numbered list', () => {
        page(row('course-outcomes', 'One | Two | Three'));
        run();
        const items = [...document.querySelectorAll('[data-course-field="course-outcomes"] ol li')];
        expect(items.map((li) => li.textContent)).toEqual(['One', 'Two', 'Three']);
    });

    test('several textbook items become a bulleted list, and links and italics survive', () => {
        page(row('textbook',
            'Meadows (2008) <i>Thinking in Systems</i>, free: <a href="https://example.edu/a.pdf">https://example.edu/a.pdf</a> | Stroh (2015) Systems Thinking'));
        run();
        const lis = [...textbook().querySelectorAll('ul > li')];
        expect(lis).toHaveLength(2);
        expect(lis[0].querySelector('i').textContent).toBe('Thinking in Systems');
        expect(lis[0].querySelector('a').getAttribute('href')).toBe('https://example.edu/a.pdf');
        expect(lis[1].textContent).toBe('Stroh (2015) Systems Thinking');
        expect(textbook().textContent).not.toContain('|');
    });

    test('a single textbook item is not a list but keeps its link', () => {
        page(row('textbook', 'Free text: <a href="https://example.edu/book">the book</a>'));
        run();
        expect(textbook().querySelector('ul')).toBeNull();
        expect(textbook().querySelector('a').getAttribute('href')).toBe('https://example.edu/book');
        expect(textbook().textContent).toBe('Free text: the book');
    });

    test('a "|" inside emphasis splits the items and keeps the emphasis on both sides', () => {
        page(row('textbook', '<i>First | Second</i>'));
        run();
        const lis = [...textbook().querySelectorAll('li')];
        expect(lis.map((li) => li.textContent)).toEqual(['First', 'Second']);
        lis.forEach((li) => expect(li.querySelector('i')).not.toBeNull());
    });

    test('unsafe content is reduced to text: no scripts, handlers, or javascript: links', () => {
        page(row('textbook',
            '<a href="javascript:alert(1)" onclick="x()">bad link</a> | <img src=x onerror="x()"> ok <a href="https://example.edu" onclick="x()">good</a>'));
        run();
        expect(textbook().querySelector('script, img')).toBeNull();
        const links = [...textbook().querySelectorAll('a')];
        expect(links).toHaveLength(1);
        expect(links[0].getAttribute('href')).toBe('https://example.edu');
        expect(links[0].hasAttribute('onclick')).toBe(false);
        expect(textbook().textContent).toContain('bad link');
    });

    test('hydrating again does not duplicate content, and an edited cell is picked up', () => {
        page(row('textbook', 'A | B'));
        run();
        jest.advanceTimersByTime(200);
        expect(textbook().querySelectorAll('li')).toHaveLength(2);

        const cell = document.querySelectorAll('table[data-course-meta] td')[1];
        cell.textContent = 'A | B | C';
        run();
        expect([...textbook().querySelectorAll('li')].map((li) => li.textContent)).toEqual(['A', 'B', 'C']);
    });
});
