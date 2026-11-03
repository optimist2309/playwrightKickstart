import { test, expect } from '@playwright/test';

/**
 * Text input examples in Playwright, run against real practice websites:
 *
 *  - Selenium web form      https://www.selenium.dev/selenium/web/web-form.html
 *  - Selenium form page     https://www.selenium.dev/selenium/web/formPage.html
 *  - Selenium inputs page   https://www.selenium.dev/selenium/web/inputs.html
 *  - Selenium read-only     https://www.selenium.dev/selenium/web/readOnlyPage.html
 *  - Selenium JS page       https://www.selenium.dev/selenium/web/javascriptPage.html
 *  - The Internet           https://the-internet.herokuapp.com
 *
 * These are public sites, so tests need an internet connection and can break
 * if a site changes its markup.
 */
const SELENIUM = 'https://www.selenium.dev/selenium/web';
const THE_INTERNET = 'https://the-internet.herokuapp.com';

test.describe('Selenium web form - basic text inputs', () => {
  /**
   * Playwright docs:
   * locator.fill() - https://playwright.dev/docs/api/class-locator#locator-fill
   *   "Set a value to the input field."
   *   "This method waits for actionability checks, focuses the element, fills it and
   *    triggers an input event after filling."
   * expect(locator).toHaveValue() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value
   *   "Ensures the Locator points to an element with the given input value."
   */
  test('1. fill() - set the value of an input', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.locator('#my-text-id');
    await textInput.fill('harish');
    await expect(textInput).toHaveValue('harish');
  });

  /**
   * Playwright docs:
   * Locators - https://playwright.dev/docs/locators
   *   "page.getByLabel() to locate a form control by associated label's text."
   *   "page.getByPlaceholder() to locate an input by placeholder."
   *   "page.getByRole() to locate by explicit and implicit accessibility attributes."
   * Locate by CSS or XPath - https://playwright.dev/docs/locators#locate-by-css-or-xpath
   *   "CSS and XPath are not recommended as the DOM can often change leading to non
   *    resilient tests."
   */
  test('2. Locate inputs by label, placeholder, role and name', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    // The <label> wraps the input, so getByLabel works
    await page.getByLabel('Text input').fill('byLabel');
    await expect(page.getByLabel('Text input')).toHaveValue('byLabel');

    await page.getByPlaceholder('Type to search...').fill('byPlaceholder');
    await expect(page.getByPlaceholder('Type to search...')).toHaveValue('byPlaceholder');

    await page.getByRole('textbox', { name: 'Text input' }).fill('byRole');
    await expect(page.getByRole('textbox', { name: 'Text input' })).toHaveValue('byRole');

    await page.locator('input[name="my-text"]').fill('byName');
    await expect(page.locator('input[name="my-text"]')).toHaveValue('byName');
  });

  /**
   * Playwright docs:
   * locator.fill() - https://playwright.dev/docs/api/class-locator#locator-fill
   *   "Set a value to the input field."
   *   "This method waits for actionability checks, focuses the element, fills it and
   *    triggers an input event after filling."
   * Note: fill() sets the whole value, so it replaces the old text instead of adding to it.
   */
  test('3. fill() replaces an existing value', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.getByLabel('Text input');
    await textInput.fill('first');
    await textInput.fill('second');
    await expect(textInput).toHaveValue('second');
  });

  /**
   * Playwright docs:
   * locator.inputValue() - https://playwright.dev/docs/api/class-locator#locator-input-value
   *   "If you need to assert input value, prefer expect(locator).toHaveValue() to avoid
   *    flakiness."
   *   "Throws elements that are not an input, textarea or a select."
   */
  test('4. inputValue() - read the current value', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    await page.getByLabel('Text input').fill('readMe');
    const value = await page.getByLabel('Text input').inputValue();
    expect(value).toBe('readMe');
  });

  /**
   * Playwright docs:
   * expect(locator).toHaveAttribute() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-attribute
   *   "Ensures the Locator points to an element with given attribute."
   */
  test('5. Attributes of an input', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.getByLabel('Text input');
    await expect(textInput).toHaveAttribute('type', 'text');
    await expect(textInput).toHaveAttribute('name', 'my-text');
    await expect(textInput).toHaveAttribute('id', 'my-text-id');
    await expect(textInput).toHaveAttribute('myprop', 'myvalue'); // custom attribute
  });

  /**
   * Playwright docs:
   * Text input - https://playwright.dev/docs/input#text-input
   *   "Using locator.fill() is the easiest way to fill out the form fields."
   *   "It focuses the element and triggers an input event with the entered text."
   *   "It works for <input>, <textarea> and [contenteditable] elements."
   * Note: a password input is a text-like <input>, so fill() works the same way.
   */
  test('6. Password input', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const password = page.getByLabel('Password');
    await password.fill('S3cret!');
    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('S3cret!');
  });

  /**
   * Playwright docs:
   * Text input - https://playwright.dev/docs/input#text-input
   *   "Using locator.fill() is the easiest way to fill out the form fields."
   *   "It focuses the element and triggers an input event with the entered text."
   *   "It works for <input>, <textarea> and [contenteditable] elements."
   * expect(locator).toHaveValue() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value
   *   "Ensures the Locator points to an element with the given input value."
   */
  test('7. Textarea with multiple lines', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textarea = page.getByLabel('Textarea');
    await textarea.fill('Line one\nLine two\nLine three');
    await expect(textarea).toHaveValue('Line one\nLine two\nLine three');
  });

  /**
   * Playwright docs:
   * expect(locator).toBeEditable() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-editable
   *   "Ensures the Locator points to an editable element."
   * expect(locator).toBeDisabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled
   *   "Ensures the Locator points to a disabled element."
   *   "Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'."
   * expect(locator).toBeEnabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-enabled
   *   "Ensures the Locator points to an enabled element."
   */
  test('8. Read-only and disabled inputs', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const readOnly = page.getByLabel('Readonly input');
    await expect(readOnly).not.toBeEditable();
    await expect(readOnly).toHaveValue('Readonly input');

    const disabled = page.getByLabel('Disabled input');
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('placeholder', 'Disabled input');

    // Normal inputs are enabled and editable
    await expect(page.getByLabel('Text input')).toBeEnabled();
    await expect(page.getByLabel('Text input')).toBeEditable();
  });

  /**
   * Playwright docs:
   * locator.focus() - https://playwright.dev/docs/api/class-locator#locator-focus
   *   "Calls focus on the matching element."
   * locator.blur() - https://playwright.dev/docs/api/class-locator#locator-blur
   *   "Calls blur on the element."
   * expect(locator).toBeFocused() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-focused
   *   "Ensures the Locator points to a focused DOM node."
   */
  test('9. Focus, blur and Tab navigation', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.getByLabel('Text input');
    await textInput.focus();
    await expect(textInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.getByLabel('Password').blur();
    await expect(page.getByLabel('Password')).not.toBeFocused();
  });

  /**
   * Playwright docs:
   * locator.press() - https://playwright.dev/docs/api/class-locator#locator-press
   *   "Focuses the matching element and presses a combination of the keys."
   *   "key can specify the intended keyboardEvent.key value or a single character to
   *    generate the text for."
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "Shortcuts such as "Control+o" or "Control+Shift+T" are supported as well."
   * locator.press() - https://playwright.dev/docs/api/class-locator#locator-press
   *   "ControlOrMeta resolves to Control on Windows and Linux and to Meta on macOS."
   */
  test('10. Keyboard shortcuts - select all and delete', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.getByLabel('Text input');
    await textInput.fill('delete me');
    await textInput.press('ControlOrMeta+a');
    await textInput.press('Backspace');
    await expect(textInput).toHaveValue('');
  });

  /**
   * Playwright docs:
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "Shortcuts such as "Control+o" or "Control+Shift+T" are supported as well."
   * locator.press() - https://playwright.dev/docs/api/class-locator#locator-press
   *   "ControlOrMeta resolves to Control on Windows and Linux and to Meta on macOS."
   * Note: copy and paste are sent as normal key combinations inside the page.
   */
  test('11. Copy and paste between inputs', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    await page.getByLabel('Text input').fill('copied-text');
    await page.getByLabel('Text input').press('ControlOrMeta+a');
    await page.getByLabel('Text input').press('ControlOrMeta+c');

    await page.getByLabel('Textarea').click();
    await page.getByLabel('Textarea').press('ControlOrMeta+v');
    await expect(page.getByLabel('Textarea')).toHaveValue('copied-text');
  });

  /**
   * Playwright docs:
   * locator.fill() - https://playwright.dev/docs/api/class-locator#locator-fill
   *   "Set a value to the input field."
   *   "This method waits for actionability checks, focuses the element, fills it and
   *    triggers an input event after filling."
   * Note: fill() sets the value in one go rather than pressing keys, so symbols,
   * Hindi text and emoji all work.
   */
  test('12. Special characters and unicode', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const textInput = page.getByLabel('Text input');
    const text = `!@#$%^&*()_+ "quotes" 'single' नमस्ते 😀`;
    await textInput.fill(text);
    await expect(textInput).toHaveValue(text);
  });

  /**
   * Playwright docs:
   * locator.click() - https://playwright.dev/docs/api/class-locator#locator-click
   *   "Click an element."
   *   "Wait for actionability checks on the element, unless force option is set."
   *   "Scroll the element into view if needed."
   *   "Use page.mouse to click in the center of the element, or the specified position."
   * expect(page).toHaveURL() - https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url
   *   "Ensures the page is navigated to the given URL."
   * expect(locator).toBeVisible() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-visible
   *   "Ensures that Locator points to an attached and visible DOM node."
   * expect(locator).toHaveText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text
   *   "Ensures the Locator points to an element with the given text."
   */
  test('13. Submit the form and check the result page', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    await page.getByLabel('Text input').fill('Harish');
    await page.getByLabel('Password').fill('pass123');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/submitted-form\.html/);
    await expect(page).toHaveURL(/my-text=Harish/); // form uses GET, so values go in the URL
    await expect(page.getByRole('heading', { name: 'Form submitted' })).toBeVisible();
    await expect(page.locator('#message')).toHaveText('Received!');
  });

  /**
   * Playwright docs:
   * Locators - https://playwright.dev/docs/locators
   *   "Locators are the central piece of Playwright's auto-waiting and retry-ability."
   *   "In a nutshell, locators represent a way to find element(s) on the page at any moment."
   * Locate by label - https://playwright.dev/docs/locators#locate-by-label
   *   "Most form controls usually have dedicated labels that could be conveniently used
   *    to interact with the form."
   */
  test('14. Fill several inputs in a loop', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const data: Record<string, string> = {
      'Text input': 'loopUser',
      Password: 'loopPass1',
      Textarea: 'Some notes',
    };

    for (const [label, value] of Object.entries(data)) {
      await page.getByLabel(label).fill(value);
    }

    for (const [label, value] of Object.entries(data)) {
      await expect(page.getByLabel(label)).toHaveValue(value);
    }
  });
});

test.describe('Selenium form page - pre-filled values and validation', () => {
  /**
   * Playwright docs:
   * locator.clear() - https://playwright.dev/docs/api/class-locator#locator-clear
   *   "This method waits for actionability checks, focuses the element, clears it and
   *    triggers an input event after clearing."
   * expect(locator).toBeEmpty() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-empty
   *   "Ensures the Locator points to an empty editable element or to a DOM node that has no text."
   */
  test('15. clear() - empty an input that already has a value', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const input = page.locator('#inputWithText');
    await expect(input).toHaveValue('Example text');

    await input.clear();
    await expect(input).toHaveValue('');
    await expect(input).toBeEmpty();
  });

  /**
   * Playwright docs:
   * keyboard.type() - https://playwright.dev/docs/api/class-keyboard#keyboard-type
   *   "Sends a keydown, keypress/input, and keyup event for each character in the text."
   *   "To press a special key, like Control or ArrowDown, use keyboard.press()."
   *   "In most cases, you should use locator.fill() instead."
   * Note: on macOS Chromium, 'End' does not move the cursor to the end of an input,
   * so this test fails there (Cmd+ArrowRight is the Mac equivalent).
   */
  test('16. Append text to an existing value', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const input = page.locator('#inputWithText');
    await input.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' appended');
    await expect(input).toHaveValue('Example text appended');
  });

  /**
   * Playwright docs:
   * locator.fill() - https://playwright.dev/docs/api/class-locator#locator-fill
   *   "Set a value to the input field."
   *   "This method waits for actionability checks, focuses the element, fills it and
   *    triggers an input event after filling."
   * expect(locator).toHaveValue() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value
   *   "Ensures the Locator points to an element with the given input value."
   */
  test('17. Pre-filled textarea', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const textarea = page.locator('#withText');
    await expect(textarea).toHaveValue('Example text');
    await textarea.fill('New textarea text');
    await expect(textarea).toHaveValue('New textarea text');
  });

  /**
   * Playwright docs:
   * locator.evaluate() - https://playwright.dev/docs/api/class-locator#locator-evaluate
   *   "Execute JavaScript code in the page, taking the matching element as an argument."
   *   "Returns the return value of pageFunction, called with the matching element as a
   *    first argument"
   * Note: here it calls the browser's own checkValidity() to test HTML5 validation.
   */
  test('18. HTML5 validation on an email field', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const email = page.locator('#email');

    await email.fill('not-an-email');
    expect(await email.evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(false);

    await email.fill('valid@example.com');
    expect(await email.evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(true);
  });
});

test.describe('Selenium inputs page - different input types', () => {
  /**
   * Playwright docs:
   * Text input - https://playwright.dev/docs/input#text-input
   *   "Using locator.fill() is the easiest way to fill out the form fields."
   *   "It focuses the element and triggers an input event with the entered text."
   *   "It works for <input>, <textarea> and [contenteditable] elements."
   * Locate by role - https://playwright.dev/docs/locators#locate-by-role
   *   "The page.getByRole() locator reflects how users and assistive technology perceive
   *    the page, for example whether some element is a button or a checkbox."
   * Note: <input type="search"> has the implicit role 'searchbox'.
   */
  test('19. Text-like input types (search, email, tel, url)', async ({ page }) => {
    await page.goto(`${SELENIUM}/inputs.html`);

    const inputs: Record<string, string> = {
      search_input: 'playwright',
      email_input: 'harish@example.com',
      tel_input: '+91 9876543210',
      url_input: 'https://playwright.dev',
    };

    for (const [name, value] of Object.entries(inputs)) {
      const input = page.locator(`input[name="${name}"]`);
      await input.fill(value);
      await expect(input).toHaveValue(value);
    }

    // search inputs have the "searchbox" role
    await expect(page.getByRole('searchbox')).toHaveValue('playwright');
  });
});

test.describe('Keystroke-by-keystroke typing', () => {
  /**
   * Playwright docs:
   * locator.pressSequentially() - https://playwright.dev/docs/api/class-locator#locator-press-sequentially
   *   "Focuses the element, and then sends a keydown, keypress/input, and keyup event
   *    for each character in the text."
   *   "In most cases, you should use locator.fill() instead. You only need to press keys
   *    one by one if there is special keyboard handling on the page."
   *   delay: "Time to wait between key presses in milliseconds. Defaults to 0."
   */
  test('20. pressSequentially() - page reacts to every key', async ({ page }) => {
    // On this page each keyup copies the input's value into #resultParagraph
    await page.goto(`${SELENIUM}/javascriptPage.html`);
    const keyUp = page.locator('#keyUp');

    await keyUp.pressSequentially('hello', { delay: 50 });
    await expect(keyUp).toHaveValue('hello');
    await expect(page.locator('#resultParagraph')).toHaveText('hello');
  });

  /**
   * Playwright docs:
   * locator.press() - https://playwright.dev/docs/api/class-locator#locator-press
   *   "Focuses the matching element and presses a combination of the keys."
   *   "key can specify the intended keyboardEvent.key value or a single character to
   *    generate the text for."
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "This character is case-sensitive, so "a" and "A" will produce different results."
   */
  test('21. press() - check which key was pressed', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/key_presses`);
    const target = page.locator('#target');

    await target.press('A');
    await expect(page.locator('#result')).toHaveText('You entered: A');

    await target.press('Tab');
    await expect(page.locator('#result')).toHaveText('You entered: TAB');
  });
});

test.describe('Other real-world inputs', () => {
  /**
   * Playwright docs:
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "The locator.press() method focuses the selected element and produces a single keystroke."
   *   "It accepts the logical key names that are emitted in the keyboardEvent.key property
   *    of the keyboard events"
   * Note: ArrowUp / ArrowDown step a number input's value up or down by 1.
   */
  test('22. Number input with arrow keys', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/inputs`);
    const number = page.locator('input[type="number"]');

    await number.fill('30');
    await expect(number).toHaveValue('30');

    // Arrow keys step the value up and down
    await number.press('ArrowUp');
    await expect(number).toHaveValue('31');
    await number.press('ArrowDown');
    await number.press('ArrowDown');
    await expect(number).toHaveValue('29');
  });

  /**
   * Playwright docs:
   * Text input - https://playwright.dev/docs/input#text-input
   *   "Using locator.fill() is the easiest way to fill out the form fields."
   *   "It focuses the element and triggers an input event with the entered text."
   *   "It works for <input>, <textarea> and [contenteditable] elements."
   * expect(locator).toHaveText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text
   *   "Ensures the Locator points to an element with the given text."
   */
  test('23. contenteditable element', async ({ page }) => {
    await page.goto(`${SELENIUM}/readOnlyPage.html`);
    const editor = page.locator('#content-editable-blank');

    await editor.fill('Typed into a contenteditable div');
    await expect(editor).toHaveText('Typed into a contenteditable div');
  });

  /**
   * Playwright docs:
   * Keys and shortcuts - https://playwright.dev/docs/input#keys-and-shortcuts
   *   "The locator.press() method focuses the selected element and produces a single keystroke."
   * expect(locator).toContainText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text
   *   "Ensures the Locator points to an element that contains the given text."
   * Note: pressing Enter in a form field submits the form.
   */
  test('24. Login form - press Enter to submit', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/login`);

    await page.getByLabel('Username').fill('tomsmith');
    await page.getByLabel('Password').fill('SuperSecretPassword!');
    await page.getByLabel('Password').press('Enter');

    await expect(page).toHaveURL(/\/secure/);
    await expect(page.locator('#flash')).toContainText('You logged into a secure area!');
  });

  /**
   * Playwright docs:
   * Locate by role - https://playwright.dev/docs/locators#locate-by-role
   *   "The page.getByRole() locator reflects how users and assistive technology perceive
   *    the page, for example whether some element is a button or a checkbox."
   * expect(locator).toContainText() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text
   *   "Ensures the Locator points to an element that contains the given text."
   */
  test('25. Login form - wrong password shows an error', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/login`);

    await page.getByLabel('Username').fill('tomsmith');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('#flash')).toContainText('Your password is invalid!');
  });
});
