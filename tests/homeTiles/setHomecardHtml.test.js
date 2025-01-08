
jest.mock('../../src/toolbox/getModUrl.js');

import {getModUrl} from "../../src/toolbox/getModUrl.js";

import {renderHomeCardHtmlAsync} from "../../src/renderHomeCardHtmlAsync.js";

describe('setHomecardHtml',  () => {
  it('should generate the correct HTML structure for a module card with completed items', async() => {
    const name = 'Module 1: Introduction';
    const state = 'locked';

    const mod = { name, state, items: [
        { completion_requirement: { completed: true } },
        { completion_requirement: { completed: true } },
        { completion_requirement: { completed: true } },
        { completion_requirement: { completed: false } },
        { completion_requirement: { completed: false } }
      ]
    };

    const result = await renderHomeCardHtmlAsync(mod, {
      getOrigin: jest.fn(() => 'https://example.com/'),
      getModImgURL: jest.fn(() => 'https://example.com/img/module1.jpg'),
    });

    expect(result).toContain('<a class="cbt-module-card cbt-module-locked"');
    expect(result).toContain('title="Module 1: Introduction"');
    expect(result).not.toContain('href="https://example.com/module1"');
    expect(result).toContain('<img src="https://example.com/img/module1.jpg"');
    expect(result).toContain('<p>Module 1</p>');
    expect(result).toContain('<h3>Introduction</h3>');
    expect(result).toContain('<b>3/5</b> complete');
    expect(result).toContain('width:60%');
  });
  it('should generate urls for nonlocked modules', async() => {
    const name = 'Module 1: Introduction';
    const state = 'active';
    const mod = { name, state, items: [
        { completion_requirement: { completed: true }, html_url: 'https://example.com/' },
        { completion_requirement: { completed: true } },
        { completion_requirement: { completed: true } },
        { completion_requirement: { completed: false } },
        { completion_requirement: { completed: false } }
      ]
    };

    getModUrl.mockImplementationOnce(() => 'https://example.com/module1');
    const result = await renderHomeCardHtmlAsync(mod, {
      getOrigin: jest.fn(() => 'https://example.com/'),
      getModImgURL: jest.fn(() => 'https://example.com/img/module1.jpg'),
    });

    expect(result).toContain('<a class="cbt-module-card"');
    expect(result).toContain('title="Module 1: Introduction"');
    expect(result).toContain('href="https://example.com/module1"');
    expect(result).toContain('<img src="https://example.com/img/module1.jpg"');
    expect(result).toContain('<p>Module 1</p>');
    expect(result).toContain('<h3>Introduction</h3>');
    expect(result).toContain('<b>3/5</b> complete');
    expect(result).toContain('width:60%');
  });


});
