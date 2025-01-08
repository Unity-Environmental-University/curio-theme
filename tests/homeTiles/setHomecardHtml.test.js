import {generateHomecardHtml} from "../../src/generateHomecardHtml.js";

describe('setHomecardHtml', () => {
  it('should generate the correct HTML structure for a module card with completed items', () => {
    const name = 'Module 1: Introduction';
    const modUrl = 'https://example.com/module1';
    const imgUrl = 'https://example.com/img/module1.jpg';
    const completedItems = 3;
    const totalItems = 5;
    const state = 'locked';

    const result = generateHomecardHtml(name, modUrl, imgUrl, completedItems, totalItems, state);

    expect(result).toContain('<a class="cbt-module-card cbt-module-locked"');
    expect(result).toContain('title="Module 1: Introduction"');
    expect(result).toContain('href="https://example.com/module1"');
    expect(result).toContain('<img src="https://example.com/img/module1.jpg"');
    expect(result).toContain('<p>Module 1</p>');
    expect(result).toContain('<h3>Introduction</h3>');
    expect(result).toContain('<b>3/5</b> complete');
    expect(result).toContain('width:60%');
  });
});
