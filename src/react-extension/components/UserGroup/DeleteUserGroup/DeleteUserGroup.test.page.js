
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
import ManageDialogs from "../../Common/Dialog/ManageDialogs/ManageDialogs";
import DialogContextProvider from "../../../contexts/DialogContext";
import AppContext from "../../../contexts/AppContext";
import MockTranslationProvider from "../../../test/mock/components/Internationalisation/MockTranslationProvider";
import DeleteUserGroup from "./DeleteUserGroup";

/**
 * The DeleteUserGroup component represented as a page
 */
export default class DeleteUserGroupTestPage {
  /**
   * Default constructor
   * @param appContext An app context
   * @param props Props to attach
   */
  constructor(appContext, props) {
    this._page = render(
      <MockTranslationProvider>
        <AppContext.Provider value={appContext}>
          <DialogContextProvider>
            <ManageDialogs/>
            <DeleteUserGroup {...props}/>
          </DialogContextProvider>
        </AppContext.Provider>
      </MockTranslationProvider>
    );
    this.setupPageObjects();
  }

  /**
   * Set up the objects of the page
   */
  setupPageObjects() {
    this._displayDeleteGroupDialog = new DeleteGroupDialogPageObject(this._page.container);
  }

  /**
   * Returns the page object of display delete group dialog
   */
  get displayDeleteGroupDialog() {
    return this._displayDeleteGroupDialog;
  }
}

/**
 * Page object for the TitleHeader element
 */
class DeleteGroupDialogPageObject {
  /**
   * Default constructor
   * @param container The container which includes the delete user dialog Component
   */
  constructor(container) {
    this._container = container;
  }

  /**
   * Returns the menu elements
   */
  get dialogTitle() {
    return this._container.querySelector('.dialog-header h2 span');
  }

  /**
   * Returns the close button elements
   */
  get closeButton() {
    return this._container.querySelector('.dialog-close');
  }

  /**
   * Returns the save button elements
   */
  get saveButton() {
    return this._container.querySelector('.submit-wrapper [type=\"submit\"]');
  }

  /**
   * Returns the save button processing elements
   */
  get saveButtonProcessing() {
    return this._container.querySelector('.submit-wrapper [type=\"submit\"].processing');
  }

  /**
   * Returns the cancel button elements
   */
  get cancelButton() {
    return this._container.querySelector('.submit-wrapper .cancel');
  }

  /**
   * Returns the cancel button disabled elements
   */
  get cancelButtonDisabled() {
    return this._container.querySelector('.submit-wrapper .cancel.disabled');
  }

  /**
   * Returns the error dialog
   */
  get errorDialog() {
    return this._container.querySelector('.error-dialog');
  }

  /**
   * Returns the error dialog message
   */
  get errorDialogMessage() {
    return this._container.querySelector('.error-dialog .dialog .dialog-content .form-content');
  }

  /**
   * Returns the user first name, last name, (username)
   */
  get groupName() {
    return this._container.querySelector('.form-content p strong');
  }

  /**
   * Returns true if the page object exists in the container
   */
  exists() {
    return this.dialogTitle !== null;
  }

  /**
   * Click on the element
   * @param element
   */
  async click(element)  {
    const leftClick = {button: 0};
    fireEvent.click(element, leftClick);
    await waitFor(() => {});
  }

  /**
   * Click on the element without wait for
   * @param element
   */
  clickWithoutWaitFor(element)  {
    const leftClick = {button: 0};
    fireEvent.click(element, leftClick);
  }
}
