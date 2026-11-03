import { test, expect } from '@playwright/test';

/**
 * Checkboxes and radio buttons.
 *
 * Playwright docs:
 * Checkboxes and radio buttons - https://playwright.dev/docs/input#checkboxes-and-radio-buttons
 *   "Using locator.setChecked() is the easiest way to check and uncheck a checkbox or a radio
 *    button. This method can be used with input[type=checkbox], input[type=radio] and
 *    [role=checkbox] elements."
 *
 * check() / uncheck() are better than click() because they:
 *  - do nothing if the element is already in the wanted state
 *  - throw an error if the state did not change after clicking
 *
 * Real practice websites used:
 *  - The Internet checkboxes        https://the-internet.herokuapp.com/checkboxes
 *  - Selenium web form              https://www.selenium.dev/selenium/web/web-form.html
 *  - Selenium form page             https://www.selenium.dev/selenium/web/formPage.html
 *  - W3C ARIA checkbox              https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox/
 *  - W3C ARIA mixed checkbox        https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/
 *  - W3C ARIA radio group           https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio/
 *
 * These are public sites, so tests need an internet connection and can break
 * if a site changes its markup.
 */
const SELENIUM = 'https://www.selenium.dev/selenium/web';
const THE_INTERNET = 'https://the-internet.herokuapp.com';
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns';

test.describe('The Internet - checkboxes with no labels', () => {
  /**
   * Playwright docs:
   * locator.check() - https://playwright.dev/docs/api/class-locator#locator-check
   * toBeChecked()   - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-checked
   *
   * These checkboxes have no <label>, so we find them by position with nth().
   */
  test('1. check() and uncheck()', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/checkboxes`);
    const boxes = page.locator('#checkboxes input[type="checkbox"]');
    const first = boxes.nth(0);
    const second = boxes.nth(1);

    // Starting state: box 1 unchecked, box 2 checked
    await expect(first).not.toBeChecked();
    await expect(second).toBeChecked();

    await first.check();
    await second.uncheck();

    await expect(first).toBeChecked();
    await expect(second).not.toBeChecked();
  });

  /**
   * check() on a box that is already checked does nothing.
   * click() always toggles, so clicking a checked box unchecks it.
   */
  test('2. check() is safe to repeat, click() toggles', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/checkboxes`);
    const second = page.locator('#checkboxes input[type="checkbox"]').nth(1);

    await second.check(); // already checked - no change
    await expect(second).toBeChecked();

    await second.click(); // toggles - now unchecked
    await expect(second).not.toBeChecked();
  });

  /**
   * Playwright docs:
   * locator.setChecked() - https://playwright.dev/docs/api/class-locator#locator-set-checked
   *   Handy when the wanted state comes from a variable (true / false).
   */
  test('3. setChecked() with a true / false value', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/checkboxes`);
    const boxes = page.locator('#checkboxes input[type="checkbox"]');

    const wanted = [true, false];
    for (let i = 0; i < wanted.length; i++) {
      await boxes.nth(i).setChecked(wanted[i]);
      await expect(boxes.nth(i)).toBeChecked({ checked: wanted[i] });
    }
  });

  /**
   * Playwright docs:
   * locator.isChecked() - https://playwright.dev/docs/api/class-locator#locator-is-checked
   *   Returns true / false right now, with no waiting. Use it for if/else logic,
   *   and use expect(...).toBeChecked() for assertions.
   */
  test('4. Check every box and count the checked ones', async ({ page }) => {
    await page.goto(`${THE_INTERNET}/checkboxes`);
    const boxes = page.locator('#checkboxes input[type="checkbox"]');

    for (const box of await boxes.all()) {
      if (!(await box.isChecked())) {
        await box.check();
      }
    }

    await expect(page.locator('#checkboxes input:checked')).toHaveCount(2);
  });
});

test.describe('Selenium web form - labelled checkboxes and radios', () => {
  /**
   * Playwright docs:
   * Locate by label - https://playwright.dev/docs/locators#locate-by-label
   * Locate by role  - https://playwright.dev/docs/locators#locate-by-role
   *
   * Here each <input> is inside a <label>, so getByLabel() and getByRole() both work.
   */
  test('5. Find checkboxes by label and by role', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);

    await expect(page.getByLabel('Checked checkbox')).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Default checkbox' })).not.toBeChecked();

    await page.getByLabel('Default checkbox').check();
    await page.getByRole('checkbox', { name: 'Checked checkbox' }).uncheck();

    await expect(page.getByLabel('Default checkbox')).toBeChecked();
    await expect(page.getByLabel('Checked checkbox')).not.toBeChecked();
  });

  /**
   * Radios with the same name form a group: only one can be checked at a time.
   * Checking one radio unchecks the others automatically.
   */
  test('6. Radio buttons - only one in a group is checked', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const checkedRadio = page.getByRole('radio', { name: 'Checked radio' });
    const defaultRadio = page.getByRole('radio', { name: 'Default radio' });

    await expect(checkedRadio).toBeChecked();
    await expect(defaultRadio).not.toBeChecked();

    await defaultRadio.check();
    await expect(defaultRadio).toBeChecked();
    await expect(checkedRadio).not.toBeChecked();
  });

  /**
   * A radio cannot be unchecked by clicking it - you have to pick another radio.
   * So Playwright's uncheck() throws on a radio button.
   */
  test('7. uncheck() on a radio throws an error', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);
    const checkedRadio = page.getByRole('radio', { name: 'Checked radio' });

    await expect(checkedRadio.uncheck({ timeout: 1000 })).rejects.toThrow();
    await expect(checkedRadio).toBeChecked();
  });

  /**
   * Submit the form and check which values were sent.
   * The form uses GET, so checked boxes show up in the URL as my-check=on.
   */
  test('8. Submit the form with checkboxes and a radio', async ({ page }) => {
    await page.goto(`${SELENIUM}/web-form.html`);

    await page.getByLabel('Checked checkbox').uncheck();
    await page.getByLabel('Default checkbox').check();
    await page.getByLabel('Default radio').check();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/submitted-form\.html/);
    await expect(page).toHaveURL(/my-check=on/);
    await expect(page).toHaveURL(/my-radio=on/);
  });
});

test.describe('Selenium form page - groups, values and disabled', () => {
  /**
   * These radios have no <label>, just text after the input, so we use the id.
   * toHaveValue() checks the value attribute that gets sent with the form.
   */
  test('9. Radio group - find the checked one and its value', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const snacks = page.locator('input[name="snack"]');

    await expect(snacks).toHaveCount(5);
    await expect(page.locator('input[name="snack"]:checked')).toHaveValue('cheese and peas');

    await page.locator('#peas').check();
    await expect(page.locator('input[name="snack"]:checked')).toHaveValue('peas');
    await expect(page.locator('#cheese_and_peas')).not.toBeChecked();
  });

  /**
   * Playwright docs:
   * toBeDisabled() - https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled
   *
   * Any value in the disabled attribute disables the element - even disabled="somerandomstring".
   * check() waits for the element to be enabled, so with a short timeout it throws.
   */
  test('10. Disabled checkboxes cannot be changed', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const disabled = page.locator('#disabledchecky');
    const randomlyDisabled = page.locator('#randomly_disabled_checky');

    await expect(disabled).toBeDisabled();
    await expect(randomlyDisabled).toBeDisabled();
    await expect(randomlyDisabled).toBeChecked();

    await expect(disabled.check({ timeout: 1000 })).rejects.toThrow();
    await expect(disabled).not.toBeChecked();
  });

  test('11. Disabled radio buttons', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);

    await expect(page.locator('#nothing')).toBeDisabled();
    await expect(page.locator('#peas')).toBeEnabled();

    // Disabled AND checked - the state is fixed
    const lone = page.locator('#lone_disabled_selected_radio');
    await expect(lone).toBeDisabled();
    await expect(lone).toBeChecked();
  });

  /**
   * Clicking a <label for="..."> toggles its checkbox, just like a real user would.
   */
  test('12. Click the label to check the box', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const box = page.locator('#checkbox-with-label');

    await expect(box).not.toBeChecked();
    await page.locator('#label-for-checkbox-with-label').click();
    await expect(box).toBeChecked();
  });

  /**
   * Space toggles a focused checkbox - the keyboard way to use it.
   */
  test('13. Toggle a checkbox with the Space key', async ({ page }) => {
    await page.goto(`${SELENIUM}/formPage.html`);
    const box = page.locator('#checky');

    await box.focus();
    await box.press('Space');
    await expect(box).toBeChecked();
    await box.press('Space');
    await expect(box).not.toBeChecked();
  });
});

test.describe('W3C custom checkboxes and radios (div with role and aria-checked)', () => {
  // www.w3.org's bot protection often shows a "security verification" page to
  // Playwright's WebKit instead of the example, so these tests run in Chromium only.
  test.skip(({ browserName }) => browserName === 'webkit', 'www.w3.org bot check blocks WebKit');

  /**
   * These are <div role="checkbox" aria-checked="true|false">, not <input>.
   * Playwright's check(), uncheck() and toBeChecked() still work, because they
   * understand role="checkbox" and aria-checked.
   */
  test('14. Custom checkbox built from a div', async ({ page }) => {
    await page.goto(`${APG}/checkbox/examples/checkbox/`);
    const group = page.getByRole('group', { name: 'Sandwich Condiments' });
    const lettuce = group.getByRole('checkbox', { name: 'Lettuce' });
    const tomato = group.getByRole('checkbox', { name: 'Tomato' });

    await expect(group.getByRole('checkbox')).toHaveCount(4);
    await expect(tomato).toBeChecked();
    await expect(lettuce).toHaveAttribute('aria-checked', 'false');

    await lettuce.check();
    await tomato.uncheck();

    await expect(lettuce).toHaveAttribute('aria-checked', 'true');
    await expect(tomato).not.toBeChecked();
  });

  /**
   * A tri-state ("mixed") checkbox: some but not all of its children are checked.
   * toBeChecked({ indeterminate: true }) checks for aria-checked="mixed".
   */
  test('15. Tri-state "select all" checkbox', async ({ page }) => {
    await page.goto(`${APG}/checkbox/examples/checkbox-mixed/`);
    const all = page.getByRole('checkbox', { name: 'All condiments' });
    const children = page.locator('fieldset.checkbox-mixed input[type="checkbox"]');

    await expect(all).toBeChecked({ indeterminate: true }); // only Tomato is checked
    await expect(children).toHaveCount(4);

    await all.click(); // mixed -> all checked
    await expect(all).toHaveAttribute('aria-checked', 'true');
    for (const child of await children.all()) {
      await expect(child).toBeChecked();
    }

    await all.click(); // checked -> none checked
    await expect(all).not.toBeChecked();
    await expect(page.locator('fieldset.checkbox-mixed input:checked')).toHaveCount(0);
  });

  /**
   * Custom radio group: <div role="radiogroup"> with <div role="radio"> inside.
   * Arrow keys move to the next radio AND check it.
   */
  test('16. Custom radio group with mouse and arrow keys', async ({ page }) => {
    await page.goto(`${APG}/radio/examples/radio/`);
    const crust = page.getByRole('radiogroup', { name: 'Pizza Crust' });
    const regular = crust.getByRole('radio', { name: 'Regular crust' });
    const deepDish = crust.getByRole('radio', { name: 'Deep dish' });
    const thin = crust.getByRole('radio', { name: 'Thin crust' });

    await regular.check();
    await expect(regular).toBeChecked();

    await regular.press('ArrowDown');
    await expect(deepDish).toBeChecked();
    await expect(deepDish).toBeFocused();
    await expect(regular).not.toBeChecked();

    await thin.click();
    await expect(thin).toBeChecked();
    await expect(crust.getByRole('radio', { checked: true })).toHaveCount(1);
  });
});
