/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.11.0
 */

/**
 * Unit tests on CreateResource in regard of specifications
 */
import {ActionFeedbackContext} from "../../../contexts/ActionFeedbackContext";
import PassboltApiFetchError from "../../../../shared/lib/Error/PassboltApiFetchError";
import {waitFor} from "@testing-library/react";
import {defaultAppContext, defaultProps} from "./CreateResource.test.data";
import CreateResourcePage from "./CreateResource.test.page";
import "../../../test/lib/crypto/cryptoGetRandomvalues";

beforeEach(() => {
  jest.resetModules();
});

describe("See the Create Resource", () => {
  let page; // The page to test against
  const context = defaultAppContext(); // The applicative context
  const props = defaultProps(); // The props to pass
  const resourceCreateDialogProps = {
    folderParentId: null
  };

  const mockContextRequest = implementation => jest.spyOn(context.port, 'request').mockImplementation(implementation);

  describe('As LU I can start adding a password', () => {
    /**
     * I should see the create password dialog
     */
    beforeEach(() => {
      context.setContext({resourceCreateDialogProps});
      page = new CreateResourcePage(context, props);
    });

    it('matches the styleguide', () => {
      // Dialog title exists and correct
      expect(page.passwordCreate.exists()).toBeTruthy();
      expect(page.title.header.textContent).toBe("Create a password");

      // Close button exists
      expect(page.passwordCreate.dialogClose).not.toBeNull();

      // Name input field exists.
      expect(page.passwordCreate.name.value).toBe("");
      // Uri input field exists.
      expect(page.passwordCreate.uri.value).toBe("");
      // Username input field exists.
      expect(page.passwordCreate.username.value).toBe("");
      // Password input field exists
      expect(page.passwordCreate.password).not.toBeNull();
      expect(page.passwordCreate.password.value).toBe("");
      expect(page.passwordCreate.password.getAttribute("type")).toBe("password");
      const passwordInputStyle = window.getComputedStyle(page.passwordCreate.password);
      expect(passwordInputStyle.background).toBe("white");
      expect(passwordInputStyle.color).toBe("");

      // Complexity label exists but is not yet defined.
      expect(page.passwordCreate.complexityText.textContent).toBe("complexity: n/a");

      // Security token element exists.
      expect(page.passwordCreate.securityToken.textContent).toBe("TST");
      // And the default style is applied.
      const securityTokenStyle = window.getComputedStyle(page.passwordCreate.securityToken);
      expect(securityTokenStyle.background).toBe("rgb(0, 0, 0)");
      expect(securityTokenStyle.color).toBe("rgb(255, 255, 255)");

      // Password view button exists.
      expect(page.passwordCreate.passwordViewButton).not.toBeNull();
      expect(page.passwordCreate.passwordViewButton.classList.contains("selected")).toBe(false);

      // Password generate button exists.
      expect(page.passwordCreate.passwordGenerateButton).not.toBeNull();

      // Description textarea field exists
      expect(page.passwordCreate.description.value).toBe("");

      // Save button exists
      expect(page.passwordCreate.saveButton.value).toBe("Create");

      // Cancel button exists
      expect(page.passwordCreate.cancelButton.textContent).toBe("Cancel");
    });

    it('changes the style of its security token when the password input get or lose focus when the password is already decrypted', async() => {
      /*
       * Password input got focus.
       * Assert style change.
       */
      page.passwordCreate.focusInput(page.passwordCreate.password);
      let securityTokenStyle = window.getComputedStyle(page.passwordCreate.securityToken);
      let passwordInputStyle = window.getComputedStyle(page.passwordCreate.password);
      expect(passwordInputStyle.background).toBe("rgb(0, 0, 0)");
      expect(passwordInputStyle.color).toBe("rgb(255, 255, 255)");
      expect(securityTokenStyle.background).toBe("rgb(255, 255, 255)");
      expect(securityTokenStyle.color).toBe("rgb(0, 0, 0)");

      /*
       * Password input lost focus.
       * Assert style
       */
      page.passwordCreate.blurInput(page.passwordCreate.password);
      securityTokenStyle = window.getComputedStyle(page.passwordCreate.securityToken);
      passwordInputStyle = window.getComputedStyle(page.passwordCreate.password);
      expect(passwordInputStyle.background).toBe("white");
      expect(passwordInputStyle.color).toBe("");
      expect(securityTokenStyle.background).toBe("rgb(0, 0, 0)");
      expect(securityTokenStyle.color).toBe("rgb(255, 255, 255)");
    });

    it('generates password when clicking on the generate button.', async() => {
      page.passwordCreate.focusInput(page.passwordCreate.password);
      await page.passwordCreate.click(page.passwordCreate.passwordGenerateButton);
      expect(page.passwordCreate.complexityText.textContent).not.toBe("complexity: n/a");
      expect(page.passwordCreate.progressBar.classList.contains("not_available")).toBe(false);
    });

    it('views password when clicking on the view button.', async() => {
      const passwordValue = "secret-decrypted";
      page.passwordCreate.fillInput(page.passwordCreate.password, passwordValue);
      // View password
      await page.passwordCreate.click(page.passwordCreate.passwordViewButton);
      expect(page.passwordCreate.password.value).toBe(passwordValue);
      let passwordInputType = page.passwordCreate.password.getAttribute("type");
      expect(passwordInputType).toBe("text");
      expect(page.passwordCreate.passwordViewButton.classList.contains("selected")).toBe(true);

      // Hide password
      await page.passwordCreate.click(page.passwordCreate.passwordViewButton);
      expect(page.passwordCreate.password.value).toBe(passwordValue);
      passwordInputType = page.passwordCreate.password.getAttribute("type");
      expect(passwordInputType).toBe("password");
      expect(page.passwordCreate.passwordViewButton.classList.contains("selected")).toBe(false);
    });

    it('requests the addon to create a resource with encrypted description when clicking on the submit button.', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      const createdResourceId = "f2b4047d-ab6d-4430-a1e2-3ab04a2f4fb9";
      // create password
      const resourceMeta = {
        name: "Password name",
        uri: "https://uri.dev",
        username: "Password username",
        password: "password-value",
        description: "Password description"
      };
      // Fill the form
      page.passwordCreate.fillInput(page.passwordCreate.name, resourceMeta.name);
      page.passwordCreate.fillInput(page.passwordCreate.uri, resourceMeta.uri);
      page.passwordCreate.fillInput(page.passwordCreate.username, resourceMeta.username);
      page.passwordCreate.fillInput(page.passwordCreate.password, resourceMeta.password);
      expect(page.passwordCreate.complexityText.textContent).not.toBe("complexity: n/a");
      expect(page.passwordCreate.progressBar.classList.contains("not_available")).toBe(false);
      page.passwordCreate.fillInput(page.passwordCreate.description, resourceMeta.description);
      await page.passwordCreate.click(page.passwordCreate.descriptionEncryptedLock);

      const requestMockImpl = jest.fn((message, data) => Object.assign({id: createdResourceId}, data));
      mockContextRequest(requestMockImpl);
      jest.spyOn(context.port, 'emit').mockImplementation(jest.fn());
      jest.spyOn(ActionFeedbackContext._currentValue, 'displaySuccess').mockImplementation(() => {});

      const onApiUpdateResourceMeta = {
        folder_parent_id: null,
        name: resourceMeta.name,
        uri: resourceMeta.uri,
        username: resourceMeta.username,
        description: resourceMeta.description,
        resource_type_id: "669f8c64-242a-59fb-92fc-81f660975fd3"
      };

      await page.passwordCreate.click(page.passwordCreate.saveButton);
      expect(context.port.request).toHaveBeenCalledWith("passbolt.resources.create", onApiUpdateResourceMeta, resourceMeta.password);
      expect(ActionFeedbackContext._currentValue.displaySuccess).toHaveBeenCalled();
      expect(context.port.emit).toHaveBeenNthCalledWith(1, "passbolt.resources.select-and-scroll-to", createdResourceId);
      expect(props.onClose).toBeCalled();
    });

    it('requests the addon to create a resource with non encrypted description when clicking on the submit button.', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      const createdResourceId = "f2b4047d-ab6d-4430-a1e2-3ab04a2f4fb9";
      // create password
      const resourceMeta = {
        name: "Password name",
        uri: "https://uri.dev",
        username: "Password username",
        password: "password-value",
        description: "Password description"
      };
      // Fill the form
      page.passwordCreate.fillInput(page.passwordCreate.name, resourceMeta.name);
      page.passwordCreate.fillInput(page.passwordCreate.uri, resourceMeta.uri);
      page.passwordCreate.fillInput(page.passwordCreate.username, resourceMeta.username);
      page.passwordCreate.fillInput(page.passwordCreate.password, resourceMeta.password);
      expect(page.passwordCreate.complexityText.textContent).not.toBe("complexity: n/a");
      expect(page.passwordCreate.progressBar.classList.contains("not_available")).toBe(false);
      page.passwordCreate.fillInput(page.passwordCreate.description, resourceMeta.description);

      const requestMockImpl = jest.fn((message, data) => Object.assign({id: createdResourceId}, data));
      mockContextRequest(requestMockImpl);
      jest.spyOn(context.port, 'emit').mockImplementation(jest.fn());
      jest.spyOn(ActionFeedbackContext._currentValue, 'displaySuccess').mockImplementation(() => {});

      const onApiUpdateResourceDto = {
        folder_parent_id: null,
        name: resourceMeta.name,
        uri: resourceMeta.uri,
        username: resourceMeta.username,
        resource_type_id: "a28a04cd-6f53-518a-967c-9963bf9cec51"
      };
      const onApiUpdateSecretDto = {
        description: resourceMeta.description,
        password: resourceMeta.password
      };

      await page.passwordCreate.click(page.passwordCreate.saveButton);

      expect(context.port.request).toHaveBeenCalledWith("passbolt.resources.create", onApiUpdateResourceDto, onApiUpdateSecretDto);
      expect(ActionFeedbackContext._currentValue.displaySuccess).toHaveBeenCalled();
      expect(context.port.emit).toHaveBeenNthCalledWith(1, "passbolt.resources.select-and-scroll-to", createdResourceId);
      expect(props.onClose).toBeCalled();
    });

    it('As LU I shouldn’t be able to submit the form if there is an invalid field', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      await page.passwordCreate.click(page.passwordCreate.saveButton);

      // Throw error message
      expect(page.passwordCreate.nameErrorMessage.textContent).toBe("A name is required.");
      expect(page.passwordCreate.passwordErrorMessage.textContent).toBe("A password is required.");
    });

    it('As LU I can stop createing a password by clicking on the cancel button', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      await page.passwordCreate.click(page.passwordCreate.cancelButton);
      expect(props.onClose).toBeCalled();
    });

    it('As LU I cannot update the form fields and I should see a processing feedback while submitting the form', async() => {
      // Mock the request function to make it the expected result
      let updateResolve;
      const requestMockImpl = jest.fn(() => new Promise(resolve => {
        updateResolve = resolve;
      }));

      page.passwordCreate.fillInput(page.passwordCreate.name, "name");
      page.passwordCreate.fillInput(page.passwordCreate.password, "password");

      // Mock the request function to make it the expected result
      mockContextRequest(requestMockImpl);
      page.passwordCreate.clickWithoutWaitFor(page.passwordCreate.saveButton);
      // API calls are made on submit, wait they are resolved.
      await waitFor(() => {
        expect(page.passwordCreate.name.getAttribute("disabled")).not.toBeNull();
        expect(page.passwordCreate.uri.getAttribute("disabled")).not.toBeNull();
        expect(page.passwordCreate.username.getAttribute("disabled")).not.toBeNull();
        expect(page.passwordCreate.password.getAttribute("disabled")).not.toBeNull();
        expect(page.passwordCreate.saveButton.getAttribute("disabled")).not.toBeNull();
        expect(page.passwordCreate.saveButton.className).toBe("button primary disabled processing");
        expect(page.passwordCreate.cancelButton.className).toBe("cancel disabled");
        updateResolve();
      });
    });

    it('As LU I can stop createing a password by closing the dialog', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      await page.passwordCreate.click(page.passwordCreate.dialogClose);
      expect(props.onClose).toBeCalled();
    });

    it('As LU I can stop adding a password with the keyboard (escape)', async() => {
      expect(page.passwordCreate.exists()).toBeTruthy();
      await page.passwordCreate.escapeKey(page.passwordCreate.dialogClose);
      expect(props.onClose).toBeCalled();
    });

    it('As LU I should see an error dialog if the submit operation fails for an unexpected reason', async() => {
      // Mock the request function to make it return an error.
      page.passwordCreate.fillInput(page.passwordCreate.name, "name");
      page.passwordCreate.fillInput(page.passwordCreate.password, "password");

      jest.spyOn(context.port, 'request').mockImplementationOnce(() => {
        throw new PassboltApiFetchError("Jest simulate API error.");
      });

      await page.passwordCreate.click(page.passwordCreate.saveButton);

      // Throw general error message
      expect(page.passwordCreate.errorDialog).not.toBeNull();
      expect(page.passwordCreate.errorDialogMessage).not.toBeNull();
    });
  });
});
