import { test, expect } from '@playwright/test';

/**
 * Custom dropdowns - built from <div>, <ul>, <li> and <button>, NOT a <select> tag.
 * selectOption() only works on <select>, so here you click / hover / type instead.
 *
 * Real practice websites used:
 *  - W3C ARIA select-only combobox   https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
 *  - W3C ARIA autocomplete combobox  https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
 *  - W3C ARIA menu button            https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions/
 *  - jQuery UI selectmenu            https://jqueryui.com/resources/demos/selectmenu/default.html
 *  - jQuery UI autocomplete          https://jqueryui.com/resources/demos/autocomplete/default.html
 *  - The Internet jQuery UI menu     https://the-internet.herokuapp.com/jqueryui/menu
 *
 * These are public sites, so tests need an internet connection and can break
 * if a site changes its markup.
 */
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns';
const JQUERY_UI = 'https://jqueryui.com/resources/demos';
const THE_INTERNET = 'https://the-internet.herokuapp.com';

test.describe('W3C select-only combobox (div with role="combobox")', () => {
  // www.w3.org's bot protection often shows a "security verification" page to
  // Playwright's WebKit instead of the example, so these tests run in Chromium only.
  test.skip(({ browserName }) => browserName === 'webkit', 'www.w3.org bot check blocks WebKit');

  /**
   * Playwright docs:
   * Locate by role - https://playwright.dev/docs/locators#locate-by-role
   *   "The page.getByRole() locator reflects how users and assistive technology perceive
   *    the page, for example whether some element is a button or a checkbox."
   * locator.click() - https://playwright.dev/docs/api/class-locator#locator-click
   *   "Wait for actionability checks on the element, unless force option is set."
   *   "Scroll the element into view if needed."
   *   "Use page.mouse to click in the center of the element, or the specified position."
   * Note: the usual pattern is 1) click the dropdown to open it, 2) click the option.
   */
  test('1. Click to open, then click an option', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-select-only/`);
    const combobox = page.getByRole('combobox', { name: 'Favorite Fruit' });

    await expect(combobox).toHaveText('Choose a Fruit');
    await combobox.click();
    await page.getByRole('option', { name: 'Banana' }).click();

    await expect(combobox).toHaveText('Banana');
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveAttribute() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-attribute
   *   "Ensures the Locator points to an element with given attribute."
   * expect(locator).toBeVisible() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-visible
   *   "Ensures that Locator points to an attached and visible DOM node."
   * expect(locator).toBeHidden() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-hidden
   *   "Ensures that Locator either does not resolve to any DOM node, or resolves to a
   *    non-visible one."
   * Note: aria-expanded tells you whether a custom dropdown is open or closed.
   */
  test('2. Check open / closed state with aria-expanded', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-select-only/`);
    const combobox = page.getByRole('combobox', { name: 'Favorite Fruit' });
    const listbox = page.getByRole('listbox', { name: 'Favorite Fruit' });

    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect(listbox).toBeHidden();

    await combobox.click();
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox).toBeVisible();

    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect(listbox).toBeHidden();
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveCount() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count
   *   "Ensures the Locator resolves to an exact number of DOM nodes."
   * expect(locator).toHaveText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text
   *   "Elements from the list have text matching expected array values, one by one, in order."
   */
  test('3. Read all the options', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-select-only/`);
    await page.getByRole('combobox', { name: 'Favorite Fruit' }).click();

    const options = page.getByRole('option');
    await expect(options).toHaveCount(13);
    await expect(options).toHaveText([
      'Choose a Fruit', 'Apple', 'Banana', 'Blueberry', 'Boysenberry', 'Cherry', 'Cranberry',
      'Durian', 'Eggplant', 'Fig', 'Grape', 'Guava', 'Huckleberry',
    ]);
  });

  /**
   * Playwright docs:
   * locator.press() - https://playwright.dev/docs/api/class-locator#locator-press
   *   "Focuses the matching element and presses a combination of the keys."
   *   "key can specify the intended keyboardEvent.key value or a single character to
   *    generate the text for."
   * Note: on this widget ArrowDown opens the list, ArrowDown again moves to the next
   * option, and Enter picks it - just like a keyboard user would.
   */
  test('4. Choose an option with the keyboard', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-select-only/`);
    const combobox = page.getByRole('combobox', { name: 'Favorite Fruit' });

    await combobox.focus();
    await combobox.press('ArrowDown'); // open
    await combobox.press('ArrowDown'); // move to "Apple"
    await combobox.press('Enter'); // select
    await expect(combobox).toHaveText('Apple');
  });
});

test.describe('W3C autocomplete combobox (type to filter)', () => {
  // www.w3.org's bot protection often shows a "security verification" page to
  // Playwright's WebKit instead of the example, so these tests run in Chromium only.
  test.skip(({ browserName }) => browserName === 'webkit', 'www.w3.org bot check blocks WebKit');

  /**
   * Playwright docs:
   * locator.pressSequentially() - https://playwright.dev/docs/api/class-locator#locator-press-sequentially
   *   "Focuses the element, and then sends a keydown, keypress/input, and keyup event
   *    for each character in the text."
   *   "In most cases, you should use locator.fill() instead. You only need to press keys
   *    one by one if there is special keyboard handling on the page."
   * Note: autocomplete dropdowns filter on every key, so typing key by key is the
   * safest way to make the suggestions appear.
   */
  test('5. Type to filter, then click a suggestion', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-autocomplete-list/`);
    const input = page.getByRole('combobox', { name: 'State' });

    await input.pressSequentially('C');
    await expect(page.getByRole('option')).toHaveText(['California', 'Colorado', 'Connecticut']);

    await page.getByRole('option', { name: 'Colorado' }).click();
    await expect(input).toHaveValue('Colorado');
  });

  /**
   * Playwright docs:
   * page.getByRole() - https://playwright.dev/docs/api/class-page#page-get-by-role
   *   exact: "Whether name and description are matched exactly: case-sensitive and
   *   whole-string. Defaults to false."
   * Note: without exact, name 'Virginia' would also match 'West Virginia'.
   */
  test('6. Open the full list with the arrow button', async ({ page }) => {
    await page.goto(`${APG}/combobox/examples/combobox-autocomplete-list/`);

    await page.getByRole('button', { name: 'States' }).click();
    await expect(page.getByRole('listbox', { name: 'States' })).toBeVisible();

    await page.getByRole('option', { name: 'Virginia', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'State' })).toHaveValue('Virginia');
  });
});

test.describe('W3C menu button (button + role="menu")', () => {
  // www.w3.org's bot protection often shows a "security verification" page to
  // Playwright's WebKit instead of the example, so these tests run in Chromium only.
  test.skip(({ browserName }) => browserName === 'webkit', 'www.w3.org bot check blocks WebKit');

  /**
   * Playwright docs:
   * Locate by role - https://playwright.dev/docs/locators#locate-by-role
   *   "The page.getByRole() locator reflects how users and assistive technology perceive
   *    the page, for example whether some element is a button or a checkbox."
   * Note: a menu button opens a list of actions, so its items have role 'menuitem'
   * instead of 'option'.
   */
  test('7. Click the button, then click a menu item', async ({ page }) => {
    await page.goto(`${APG}/menu-button/examples/menu-button-actions/`);
    const button = page.getByRole('button', { name: 'Actions' });

    await button.click();
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('menuitem')).toHaveCount(4);

    await page.getByRole('menuitem', { name: 'Action 3' }).click();
    await expect(page.getByLabel('Last Action')).toHaveValue('Action 3');
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeHidden();
  });

  /**
   * Playwright docs:
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "The locator.press() method focuses the selected element and produces a single keystroke."
   * expect(locator).toBeFocused() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-focused
   *   "Ensures the Locator points to a focused DOM node."
   */
  test('8. Use the menu with the keyboard', async ({ page }) => {
    await page.goto(`${APG}/menu-button/examples/menu-button-actions/`);

    await page.getByRole('button', { name: 'Actions' }).press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Action 1' })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Action 2' })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Last Action')).toHaveValue('Action 2');
  });
});

test.describe('jQuery UI selectmenu (hidden <select> behind a custom widget)', () => {
  /**
   * Playwright docs:
   * expect(locator).toBeHidden() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-hidden
   *   "Ensures that Locator either does not resolve to any DOM node, or resolves to a
   *    non-visible one."
   * expect(locator).toHaveValue() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value
   *   "Ensures the Locator points to an element with the given input value."
   * Note: jQuery UI hides the real <select> and shows a <span role="combobox"> instead.
   * Interact with what the user sees; the widget keeps the hidden <select> in sync.
   */
  test('9. Pick an option in the custom widget', async ({ page }) => {
    await page.goto(`${JQUERY_UI}/selectmenu/default.html`);
    const button = page.locator('#speed-button');

    await expect(page.locator('#speed')).toBeHidden(); // the real <select>
    await expect(button).toHaveText('Medium');

    await button.click();
    await page.getByRole('option', { name: 'Fast', exact: true }).click();

    await expect(button).toHaveText('Fast');
    await expect(page.locator('#speed')).toHaveValue('Fast');
  });

  /**
   * Playwright docs:
   * page.getByRole() - https://playwright.dev/docs/api/class-page#page-get-by-role
   *   exact: "Whether name and description are matched exactly: case-sensitive and
   *   whole-string. Defaults to false."
   * Note: this menu has groups (Scripts / Other files). Options are still role
   * 'option', and the hidden <select> gets the option's value attribute.
   */
  test('10. Grouped options', async ({ page }) => {
    await page.goto(`${JQUERY_UI}/selectmenu/default.html`);

    await page.locator('#files-button').click();
    await page.getByRole('option', { name: 'Some unknown file' }).click();

    await expect(page.locator('#files-button')).toHaveText('Some unknown file');
    await expect(page.locator('#files')).toHaveValue('somefile');
  });
});

test.describe('jQuery UI autocomplete (suggestions with no ARIA roles)', () => {
  /**
   * Playwright docs:
   * locator.pressSequentially() - https://playwright.dev/docs/api/class-locator#locator-press-sequentially
   *   "You only need to press keys one by one if there is special keyboard handling on the page."
   * page.getByText() - https://playwright.dev/docs/api/class-page#page-get-by-text
   *   "Allows locating elements that contain given text."
   * Note: these suggestion items have no role, so we find them with CSS + getByText.
   */
  test('11. Type, then click a suggestion', async ({ page }) => {
    await page.goto(`${JQUERY_UI}/autocomplete/default.html`);
    const input = page.getByLabel('Tags');

    await input.pressSequentially('ja');
    const suggestions = page.locator('ul.ui-autocomplete li');
    await expect(suggestions).toHaveText(['Java', 'JavaScript']);

    await suggestions.getByText('JavaScript', { exact: true }).click();
    await expect(input).toHaveValue('JavaScript');
    await expect(suggestions.first()).toBeHidden();
  });

  /**
   * Playwright docs:
   * keyboard.press() - https://playwright.dev/docs/api/class-keyboard#keyboard-press
   *   "key can specify the intended keyboardEvent.key value or a single character to
   *    generate the text for."
   */
  test('12. Choose a suggestion with ArrowDown and Enter', async ({ page }) => {
    await page.goto(`${JQUERY_UI}/autocomplete/default.html`);
    const input = page.getByLabel('Tags');

    await input.pressSequentially('ja');
    await expect(page.locator('ul.ui-autocomplete li')).toHaveCount(2);

    await page.keyboard.press('ArrowDown'); // Java
    await page.keyboard.press('ArrowDown'); // JavaScript
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('JavaScript');
  });
});

test.describe('The Internet - hover menu (nested dropdown)', () => {
  /**
   * Playwright docs:
   * locator.hover() - https://playwright.dev/docs/api/class-locator#locator-hover
   *   "Hover over the matching element."
   *   "Use page.mouse to hover over the center of the element, or the specified position."
   * Note: some dropdowns open on mouse hover instead of click.
   */
  test('13. Hover to open nested menus', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/jqueryui/menu`);

    await expect(page.getByRole('menuitem', { name: 'Downloads' })).toBeHidden();

    await page.getByRole('menuitem', { name: 'Enabled' }).hover();
    await expect(page.getByRole('menuitem', { name: 'Downloads' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Downloads' }).hover();
    await expect(page.getByRole('menuitem', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'CSV' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Excel' })).toBeVisible();
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveAttribute() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-attribute
   *   "Ensures the Locator points to an element with given attribute."
   * Note: custom widgets can't use the native `disabled` attribute on a <li>,
   * so they mark it with aria-disabled="true" instead.
   */
  test('14. Disabled menu item', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/jqueryui/menu`);
    const disabled = page.getByRole('menuitem', { name: 'Disabled' });

    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await disabled.hover();
    await expect(page.getByRole('menuitem', { name: 'Should not see this' })).toBeHidden();
  });

  /**
   * Playwright docs:
   * Downloads - https://playwright.dev/docs/downloads
   *   "For every attachment downloaded by the page, page.on('download') event is emitted."
   *   "You can obtain the download url, file name and payload stream using the Download
   *    object from the event."
   * Note: start waiting for the download BEFORE clicking (no await), then await it.
   */
  test('15. Pick a menu item that downloads a file', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/jqueryui/menu`);

    await page.getByRole('menuitem', { name: 'Enabled' }).hover();
    await page.getByRole('menuitem', { name: 'Downloads' }).hover();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: 'PDF' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('menu.pdf');
  });
});
