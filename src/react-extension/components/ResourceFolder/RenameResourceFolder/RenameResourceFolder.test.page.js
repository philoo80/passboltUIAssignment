
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

import {fireEvent, render, waitFor} from "@testing-library/react";
import React from "react";
import AppContext from "../../../contexts/AppContext";
import MockTranslationProvider from "../../../test/mock/components/Internationalisation/MockTranslationProvider";
import RenameResourceFolder from "./RenameResourceFolder";

/**
 * The RenameResourceFolderPage component represented as a page
 */
export default class RenameResourceFolderPage {
  /**
   * Default constructor
   * @param appContext An app context
   * @param props Props to attach
   */
  constructor(appContext, props) {
    this._page = render(
      <MockTranslationProvider>
        <AppContext.Provider  value={appContext}>
          <RenameResourceFolder {...props}></RenameResourceFolder>
        </AppContext.Provider>
      </MockTranslationProvider>
    );
  }


  /**
   * Set a name to the folder name input
   */
  set name(value) {
    const input = this._page.container.querySelector('#folder-name-input');
    fireEvent.change(input, {target: {value}});
  }

  /**
   * Returns true it the folder name is invalid
   */
  get hasInvalidName() {
    return Boolean(this._page.container.querySelector('.error.message'));
  }

  /**
   * Returns true it one can cancel the operation
   */
  get canCancel() {
    return !Boolean(this._page.container.querySelector('.cancel.disabled')).valueOf();
  }

  /**
   * Returns true it one can close the dialog
   */
  get canClose() {
    return !Boolean(this._page.container.querySelector('.dialog-close.disabled')).valueOf();
  }

  /**
   * Returns true it one can submit the create operation
   */
  get canSubmit() {
    return !Boolean(this._page.container.querySelector('input[type="submit"].disabled')).valueOf();
  }

  /**
   * Returns true it one can change the data
   */
  get canChangeData() {
    return !this._page.container.querySelector('#folder-name-input').hasAttribute('disabled');
  }

  /**
   * Returns the save button element
   */
  get saveButton() {
    return this._page.container.querySelector('input[type=\"submit\"]');
  }

  /**
   * Returns the cancel button element
   */
  get cancelButton() {
    return this._page.container.querySelector(".submit-wrapper .cancel");
  }

  /**
   * Returns the close button element
   */
  get closeButton() {
    return this._page.container.querySelector(".dialog-close");
  }

  /**
   * Rename a folder with the given information
   * @param folder The folder information to rename
   * @param inProgressFn Function called while we wait for React stability
   */
  async rename(folder, inProgressFn = () => {}) {
    this.name = folder.name;
    const leftClick = {button: 0};
    fireEvent.click(this.saveButton, leftClick);
    await waitFor(inProgressFn);
  }

  /**
   * Cancels the create operation
   */
  async cancel() {
    const leftClick = {button: 0};
    fireEvent.click(this.cancelButton, leftClick);
    await waitFor(() => {});
  }


  /**
   * Close the create operation
   */
  async close() {
    const leftClick = {button: 0};
    fireEvent.click(this.closeButton, leftClick);
    await waitFor(() => {});
  }
}
