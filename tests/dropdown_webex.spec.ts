import { test, expect } from '@playwright/test';

/**
 * Dropdown (<select>) examples in Playwright, run against real practice websites:
 *
 *  - The Internet dropdown  https://the-internet.herokuapp.com/dropdown
 *  - Selenium web form      https://www.selenium.dev/selenium/web/web-form.html
 *  - Selenium form page     https://www.selenium.dev/selenium/web/formPage.html
 *
 * These are public sites, so tests need an internet connection and can break
 * if a site changes its markup.
 */
const SELENIUM = 'https://www.selenium.dev/selenium/web';
const THE_INTERNET = 'https://the-internet.herokuapp.com';

test.describe('The Internet - simple dropdown', () => {
  /**
   * Playwright docs:
   * Select options - https://playwright.dev/docs/input#select-options
   *   "Selects one or multiple options in the <select> element with locator.selectOption()."
   *   "You can specify option value, or label to select."
   * expect(locator).toHaveValue() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value
   *   "Ensures the Locator points to an element with the given input value."
   */
  test('1. selectOption() by value', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/dropdown`);
    const dropdown = page.locator('#dropdown');

    await dropdown.selectOption('1');
    await expect(dropdown).toHaveValue('1');
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "String values are matching both values and labels."
   * Note: { label: '...' } matches only the visible text, { value: '...' } only the
   * value attribute. ':checked' is a CSS selector for the selected <option>.
   */
  test('2. selectOption() by label, then check the selected text', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/dropdown`);
    const dropdown = page.locator('#dropdown');

    await dropdown.selectOption({ label: 'Option 2' });
    await expect(dropdown).toHaveValue('2');
    await expect(dropdown.locator('option:checked')).toHaveText('Option 2');
  });

  /**
   * Playwright docs:
   * expect(locator).toBeDisabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled
   *   "Ensures the Locator points to a disabled element."
   *   "Note that only native control elements such as HTML button, input, select,
   *    textarea, option, optgroup can be disabled by setting "disabled" attribute."
   */
  test('3. Default selection and the disabled placeholder option', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/dropdown`);
    const dropdown = page.locator('#dropdown');

    await expect(dropdown.locator('option:checked')).toHaveText('Please select an option');
    await expect(dropdown).toHaveValue('');
    await expect(dropdown.locator('option').first()).toBeDisabled();
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveCount() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count
   *   "Ensures the Locator resolves to an exact number of DOM nodes."
   * expect(locator).toHaveText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text
   *   "If you pass an array as an expected value, the expectations are:"
   *   "Elements from the list have text matching expected array values, one by one, in order."
   * locator.allTextContents() - https://playwright.dev/docs/api/class-locator#locator-all-text-contents
   *   "Returns an array of node.textContent values for all matching nodes."
   *   "If you need to assert text on the page, prefer expect(locator).toHaveText() to
   *    avoid flakiness."
   */
  test('4. Read all the options', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/dropdown`);
    const options = page.locator('#dropdown option');

    await expect(options).toHaveCount(3);
    await expect(options).toHaveText(['Please select an option', 'Option 1', 'Option 2']);

    // allTextContents() gives you a plain array to use in your own code
    const texts = (await options.allTextContents()).map((t) => t.trim());
    expect(texts).toContain('Option 1');
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "Returns the array of option values that have been successfully selected."
   *   "Triggers a change and input event once all the provided options have been selected."
   */
  test('5. selectOption() returns the selected values', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/dropdown`);

    const selected = await page.locator('#dropdown').selectOption('Option 2');
    expect(selected).toEqual(['2']);
  });
});

test.describe('Selenium web form - select and datalist', () => {
  /**
   * Playwright docs:
   * Locate by label - https://playwright.dev/docs/locators#locate-by-label
   *   "Most form controls usually have dedicated labels that could be conveniently used
   *    to interact with the form."
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "String values are matching both values and labels."
   * Locate by role - https://playwright.dev/docs/locators#locate-by-role
   *   "The page.getByRole() locator reflects how users and assistive technology perceive
   *    the page, for example whether some element is a button or a checkbox."
   * Note: a <select> has the implicit ARIA role 'combobox'.
   */
  test('6. Find the dropdown by label or role', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);

    await page.getByLabel('Dropdown (select)').selectOption('Two');
    await expect(page.getByLabel('Dropdown (select)')).toHaveValue('2');

    // An <input list="..."> is also a 'combobox', so add the name to pick the right one
    const byRole = page.getByRole('combobox', { name: 'Dropdown (select)' });
    await byRole.selectOption('3');
    await expect(byRole).toHaveValue('3');
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "This method waits for actionability checks, waits until all specified options are
   *    present in the <select> element and selects these options."
   */
  test('7. Select every option in a loop', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const dropdown = page.getByLabel('Dropdown (select)');

    const options: Record<string, string> = { One: '1', Two: '2', Three: '3' };
    for (const [label, value] of Object.entries(options)) {
      await dropdown.selectOption({ label });
      await expect(dropdown).toHaveValue(value);
    }
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "If the target element is not a <select> element, this method throws an error."
   * Text input - https://playwright.dev/docs/input#text-input
   *   "Using locator.fill() is the easiest way to fill out the form fields."
   * Note: a <datalist> is just suggestions for an <input>, so you type into it with
   * fill() instead of selectOption().
   */
  test('8. Datalist - an input with suggestions', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const input = page.getByLabel('Dropdown (datalist)');

    await input.fill('Seattle');
    await expect(input).toHaveValue('Seattle');

    const suggestions = page.locator('#my-options option');
    await expect(suggestions).toHaveCount(5);
    const values = await suggestions.evaluateAll((opts: HTMLOptionElement[]) => opts.map((o) => o.value));
    expect(values).toEqual(['San Francisco', 'New York', 'Seattle', 'Los Angeles', 'Chicago']);
  });
});

test.describe('Selenium form page - multi-select, index and disabled', () => {
  /**
   * Playwright docs:
   * expect(locator).toHaveValues() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-values
   *   "Ensures the Locator points to multi-select/combobox (i.e. a select with the multiple
   *    attribute) and the specified values are selected."
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "If the <select> has the multiple attribute, all matching options are selected,
   *    otherwise only the first option matching one of the passed options is selected."
   */
  test('9. Multi-select - pick several options', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const multi = page.locator('#multi');

    // Eggs and Sausages are pre-selected in the page's HTML
    await expect(multi).toHaveValues(['eggs', 'sausages']);

    await multi.selectOption(['ham', 'onion gravy']);
    await expect(multi).toHaveValues(['ham', 'onion gravy']);
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveValues() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-values
   *   "Ensures the Locator points to multi-select/combobox (i.e. a select with the multiple
   *    attribute) and the specified values are selected."
   * Note: selectOption() with an empty array deselects every option.
   */
  test('10. Multi-select - clear the selection', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const multi = page.locator('#multi');

    await multi.selectOption([]);
    await expect(multi).toHaveValues([]);
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "Selects option or options in <select>."
   * Note: besides a value or label, you can pass { index: n } (0-based).
   */
  test('11. selectOption() by index', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const dropdown = page.locator('select[name="selectomatic"]');

    await expect(dropdown).toHaveValue('one');
    await dropdown.selectOption({ index: 2 });
    await expect(dropdown).toHaveValue('four');
  });

  /**
   * Playwright docs:
   * expect(locator).toBeDisabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled
   *   "Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'."
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "This method waits for actionability checks, ..."
   * Note: a disabled <select> never passes the "enabled" check, so selectOption()
   * keeps waiting until it times out.
   */
  test('12. Disabled dropdown cannot be changed', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const disabled = page.locator('select[name="no-select"]');

    await expect(disabled).toBeDisabled();
    await expect(disabled.selectOption('bar', { timeout: 1000 })).rejects.toThrow();
    await expect(disabled).toHaveValue('foo');
  });

  /**
   * Playwright docs:
   * expect(locator).toBeDisabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled
   *   "Note that only native control elements such as HTML button, input, select,
   *    textarea, option, optgroup can be disabled by setting "disabled" attribute."
   */
  test('13. Disabled option inside an enabled dropdown', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const dropdown = page.locator('select[name="single_disabled"]');

    await expect(dropdown).toBeEnabled();
    await expect(dropdown.locator('option[value="disabled"]')).toBeDisabled();
    await expect(dropdown.locator('option[value="enabled"]')).toBeEnabled();
  });

  /**
   * Playwright docs:
   * locator.selectOption() - https://playwright.dev/docs/api/class-locator#locator-select-option
   *   "String values are matching both values and labels."
   * Note: the browser trims and collapses spaces in an option's label, and an
   * <option> with no value attribute uses that text as its value.
   */
  test('14. Options with extra spaces and no value attribute', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const dropdown = page.locator('select[name="select_with_spaces"]');

    await dropdown.selectOption({ label: 'Two' });
    await expect(dropdown).toHaveValue('Two');

    await dropdown.selectOption({ label: 'Still learning how to count, apparently' });
    await expect(dropdown).toHaveValue('Still learning how to count, apparently');
  });
});
