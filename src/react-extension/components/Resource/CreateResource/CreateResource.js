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
 * @since         2.14.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";

import {withAppContext} from "../../../contexts/AppContext";
import Icon from "../../Common/Icons/Icon";
import Tooltip from "../../Common/Tooltip/Tooltip";
import SecretComplexity from "../../../../shared/lib/Secret/SecretComplexity";
import {withActionFeedback} from "../../../contexts/ActionFeedbackContext";
import NotifyError from "../../Common/Error/NotifyError/NotifyError";
import {withDialog} from "../../../contexts/DialogContext";
import {withRouter} from "react-router-dom";
import DialogWrapper from "../../Common/Dialog/DialogWrapper/DialogWrapper";
import FormSubmitButton from "../../Common/Inputs/FormSubmitButton/FormSubmitButton";
import FormCancelButton from "../../Common/Inputs/FormSubmitButton/FormCancelButton";

import {Trans, withTranslation} from "react-i18next";

/** Resource password max length */
const RESOURCE_PASSWORD_MAX_LENGTH = 4096;

/** Resource description max length */
const RESOURCE_DESCRIPTION_MAX_LENGTH = 10000;

class CreateResource extends Component {
  constructor() {
    super();
    this.state = this.getDefaultState();
    this.initEventHandlers();
    this.createInputRef();
  }

  getDefaultState() {
    return {
      name: "",
      nameError: "",
      username: "",
      usernameError: "",
      uri: "",
      uriError: "",
      password: "",
      passwordError: "",
      passwordWarning: "",
      description: "",
      descriptionError: "",
      descriptionWarning: "",
      viewPassword: false,
      passwordInputHasFocus: false,
      encryptDescription: false,
      hasAlreadyBeenValidated: false // True if the form has already been submitted once
    };
  }

  initEventHandlers() {
    this.handleClose = this.handleClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePasswordInputFocus = this.handlePasswordInputFocus.bind(this);
    this.handlePasswordInputBlur = this.handlePasswordInputBlur.bind(this);
    this.handleNameInputKeyUp = this.handleNameInputKeyUp.bind(this);
    this.handlePasswordInputKeyUp = this.handlePasswordInputKeyUp.bind(this);
    this.handleViewPasswordButtonClick = this.handleViewPasswordButtonClick.bind(this);
    this.handleGeneratePasswordButtonClick = this.handleGeneratePasswordButtonClick.bind(this);
    this.handleDescriptionToggle = this.handleDescriptionToggle.bind(this);
    this.handleDescriptionInputKeyUp = this.handleDescriptionInputKeyUp.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.nameInputRef = React.createRef();
    this.passwordInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.isEncryptedDescriptionEnabled()) {
      this.setState({encryptDescription: true});
    }
  }

  /*
   * =============================================================
   *  Resource type helpers
   * =============================================================
   */
  isEncryptedDescriptionEnabled() {
    return this.props.context.resourceTypesSettings.isEncryptedDescriptionEnabled();
  }

  isLegacyResourceTypeEnabled() {
    return this.props.context.resourceTypesSettings.isLegacyResourceTypeEnabled();
  }

  areResourceTypesEnabled() {
    return this.props.context.resourceTypesSettings.areResourceTypesEnabled();
  }

  /*
   * =============================================================
   *  Form submit
   * =============================================================
   */
  /**
   * Handle form submit event.
   * @params {ReactEvent} The react event
   * @return {Promise}
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    if (this.state.processing) {
      return;
    }

    await this.setState({hasAlreadyBeenValidated: true});
    await this.toggleProcessing();

    if (!await this.validate()) {
      await this.toggleProcessing();
      this.focusFirstFieldError();
      return;
    }

    try {
      const resource = await this.createResource();
      await this.handleSaveSuccess(resource);
    } catch (error) {
      await this.toggleProcessing();
      await this.handleSaveError(error);
    }
  }

  /**
   * Toggle processing state when validating / saving
   * @returns {Promise<void>}
   */
  async toggleProcessing() {
    const prev = this.state.processing;
    return new Promise(resolve => {
      this.setState({processing: !prev}, resolve());
    });
  }

  /*
   * =============================================================
   *  Validation
   * =============================================================
   */
  /**
   * Validate the form.
   * @return {Promise<boolean>}
   */
  async validate() {
    // Reset the form errors.
    this.setState({
      nameError: "",
      uriError: "",
      usernameError: "",
      passwordError: "",
      descriptionError: ""
    });

    // Validate the form inputs.
    await Promise.all([
      this.validateNameInput(),
      this.validatePasswordInput()
    ]);

    return this.state.nameError === "" && this.state.passwordError === "";
  }

  /**
   * Validate the password input.
   * @return {Promise}
   */
  validatePasswordInput() {
    const password = this.state.password;
    let passwordError = "";
    if (!password.length) {
      passwordError = this.translate("A password is required.");
    }

    return new Promise(resolve => {
      this.setState({passwordError: passwordError}, resolve);
    });
  }

  /**
   * Validate the name input.
   * @return {Promise}
   */
  validateNameInput() {
    const name = this.state.name.trim();
    let nameError = "";
    if (!name.length) {
      nameError = this.translate("A name is required.");
    }

    return new Promise(resolve => {
      this.setState({nameError: nameError}, resolve);
    });
  }

  /*
   * =============================================================
   *  Create resource
   * =============================================================
   */
  /**
   * Create the resource
   * @returns {Promise<Object>} returns the newly created resource
   */
  async createResource() {
    const resourceDto = {
      name: this.state.name,
      username: this.state.username,
      uri: this.state.uri,
      folder_parent_id: this.props.context.resourceCreateDialogProps.folderParentId
    };

    // No resource types, legacy case
    if (!this.areResourceTypesEnabled()) {
      return this.createResourceLegacy(resourceDto, this.state.password);
    }

    // Resource types enabled but legacy type requested
    if (!this.state.encryptDescription) {
      return this.createWithoutEncryptedDescription(resourceDto, this.state.password);
    }

    // Resource type with encrypted description
    return this.createWithEncryptedDescription(resourceDto, {
      description: this.state.description,
      password: this.state.password
    });
  }

  /**
   * Create legacy resource with no resource type
   *
   * @param resourceDto
   * @param {string} secretString
   * @returns {Promise<*>}
   * @deprecated will be removed when v2 support is dropped
   */
  async createResourceLegacy(resourceDto, secretString) {
    resourceDto.description = this.state.description;

    return this.props.context.port.request("passbolt.resources.create", resourceDto, secretString);
  }

  /**
   * Create with encrypted description type
   *
   * @param {object} resourceDto
   * @param {object} secretDto
   * @returns {Promise<*>}
   */
  async createWithEncryptedDescription(resourceDto, secretDto) {
    resourceDto.resource_type_id = this.props.context.resourceTypesSettings.findResourceTypeIdBySlug(
      this.props.context.resourceTypesSettings.DEFAULT_RESOURCE_TYPES_SLUGS.PASSWORD_AND_DESCRIPTION
    );

    return this.props.context.port.request("passbolt.resources.create", resourceDto, secretDto);
  }

  /**
   * Create with legacy secret type
   *
   * @param {object} resourceDto
   * @param {string} secretString
   * @returns {Promise<*>}
   */
  async createWithoutEncryptedDescription(resourceDto, secretString) {
    resourceDto.resource_type_id = this.props.context.resourceTypesSettings.findResourceTypeIdBySlug(
      this.props.context.resourceTypesSettings.DEFAULT_RESOURCE_TYPES_SLUGS.PASSWORD_STRING
    );
    resourceDto.description = this.state.description;

    return this.props.context.port.request("passbolt.resources.create", resourceDto, secretString);
  }

  /**
   * Handle save operation success.
   */
  async handleSaveSuccess(resource) {
    await this.props.actionFeedbackContext.displaySuccess(this.translate("The password has been added successfully"));
    if (resource.folder_parent_id) {
      // TODO and select resource inside that folder
      this.selectAndScrollToFolder(resource.folder_parent_id);
    } else {
      this.selectAndScrollToResource(resource.id);
    }
    this.props.context.setContext({passwordEditDialogProps: null});
    this.props.history.push(`/app/passwords/view/${resource.id}`);
    this.props.onClose();
  }

  /*
   * =============================================================
   *  Error handling
   * =============================================================
   */
  /**
   * Handle save operation error.
   * @param {object} error The returned error
   */
  async handleSaveError(error) {
    // It can happen when the user has closed the passphrase entry dialog by instance.
    if (error.name === "UserAbortsOperationError") {
      // Do nothing
    } else {
      // Unexpected error occurred.
      console.error(error);
      this.handleError(error);
    }
  }

  /**
   * handle error to display the error dialog
   * @param error
   */
  handleError(error) {
    const errorDialogProps = {
      title: this.translate("There was an unexpected error..."),
      message: error.message
    };
    this.props.context.setContext({errorDialogProps});
    this.props.dialogContext.open(NotifyError);
  }

  /**
   * Focus the first field of the form which is in error state.
   */
  focusFirstFieldError() {
    if (this.state.nameError) {
      this.nameInputRef.current.focus();
    } else if (this.state.passwordError) {
      this.passwordInputRef.current.focus();
    }
  }

  /*
   * =============================================================
   *  Out of dialog actions
   * =============================================================
   */
  /**
   * Select and scroll to a given resource.
   * @param {string} id The resource id.
   */
  selectAndScrollToResource(id) {
    this.props.context.port.emit("passbolt.resources.select-and-scroll-to", id);
  }

  /**
   * Select and scroll to a given resource.
   * @param {string} id The resource id.
   * @returns {void}
   */
  selectAndScrollToFolder(id) {
    this.props.context.port.emit("passbolt.folders.select-and-scroll-to", id);
  }

  /*
   * =============================================================
   *  Dialog actions event handlers
   * =============================================================
   */
  /**
   * Handle form input change.
   * @params {ReactEvent} The react event.
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  /**
   * Handle password input focus.
   */
  handlePasswordInputFocus() {
    const passwordInputHasFocus = true;
    this.setState({passwordInputHasFocus: passwordInputHasFocus});
  }

  /**
   * Handle password input blur.
   */
  handlePasswordInputBlur() {
    const passwordInputHasFocus = false;
    this.setState({passwordInputHasFocus: passwordInputHasFocus});
  }

  /**
   * Handle name input keyUp event.
   */
  handleNameInputKeyUp() {
    if (this.state.hasAlreadyBeenValidated) {
      const state = this.validateNameInput();
      this.setState(state);
    }
  }

  /**
   * Handle password input keyUp event.
   */
  handlePasswordInputKeyUp() {
    if (this.state.hasAlreadyBeenValidated) {
      const state = this.validatePasswordInput();
      this.setState(state);
    } else {
      const hasResourcePasswordMaxLength = this.state.password.length >= RESOURCE_PASSWORD_MAX_LENGTH;
      const warningMessage = this.translate("Warning: this is the maximum size for this field, make sure your data was not truncated");
      const passwordWarning = hasResourcePasswordMaxLength ? warningMessage : '';
      this.setState({passwordWarning});
    }
  }

  /**
   * Handle view password button click.
   */
  handleViewPasswordButtonClick() {
    if (this.state.processing) {
      return;
    }
    this.setState({viewPassword: !this.state.viewPassword});
  }

  /**
   * Handle generate password button click.
   */
  handleGeneratePasswordButtonClick() {
    if (this.state.processing) {
      return;
    }
    const password = SecretComplexity.generate();
    this.setState({
      password: password,
      passwordError: ""
    });
  }

  /**
   * Handle close
   */
  handleClose() {
    this.props.onClose();
    this.props.context.setContext({resourceCreateDialogProps: null});
  }

  /**
   * Switch to toggle description field encryption
   */
  handleDescriptionToggle() {
    const isCurrentlyEncrypted = this.state.encryptDescription;
    if (isCurrentlyEncrypted && this.isLegacyResourceTypeEnabled()) {
      return this.setState({encryptDescription: false});
    }
    if (!isCurrentlyEncrypted && this.isEncryptedDescriptionEnabled()) {
      return this.setState({encryptDescription: true});
    }
  }

  /**
   * Whenever the user input keys in the description area
   */
  handleDescriptionInputKeyUp() {
    if (!this.state.hasAlreadyBeenValidated) {
      const hasResourceDescriptionMaxLength = this.state.description.length >= RESOURCE_DESCRIPTION_MAX_LENGTH;

      const warningMessage = this.translate("Warning: this is the maximum size for this field, make sure your data was not truncated");
      const descriptionWarning = hasResourceDescriptionMaxLength ? warningMessage : '';
      this.setState({descriptionWarning});
    }
  }

  /*
   * =============================================================
   *  Security token style
   * =============================================================
   */
  /**
   * Get the password input style.
   * @return {Object}
   */
  getPasswordInputStyle() {
    if (this.state.passwordInputHasFocus) {
      const backgroundColor = this.props.context.userSettings.getSecurityTokenBackgroundColor();
      const textColor = this.props.context.userSettings.getSecurityTokenTextColor();

      return {
        background: backgroundColor,
        color: textColor
      };
    }

    return {
      background: "",
      color: "",
    };
  }

  /**
   * Get the security token style.
   * @return {Object}
   */
  getSecurityTokenStyle() {
    const backgroundColor = this.props.context.userSettings.getSecurityTokenBackgroundColor();
    const textColor = this.props.context.userSettings.getSecurityTokenTextColor();

    if (this.state.passwordInputHasFocus) {
      return {
        background: textColor,
        color: backgroundColor,
      };
    }

    return {
      background: backgroundColor,
      color: textColor,
    };
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  /*
   * =============================================================
   *  Render view
   * =============================================================
   */
  render() {
    const passwordInputStyle = this.getPasswordInputStyle();
    const securityTokenStyle = this.getSecurityTokenStyle();
    const securityTokenCode = this.props.context.userSettings.getSecurityTokenCode();
    const passwordStrength = SecretComplexity.getStrength(this.state.password);
    /*
     * The parser can't find the translation for passwordStrength.label
     * To fix that we can use it in comment
     * this.translate("n/a")
     * this.translate("very weak")
     * this.translate("weak")
     * this.translate("fair")
     * this.translate("strong")
     * this.translate("very strong")
     */

    return (
      <DialogWrapper title={this.translate("Create a password")} className="create-password-dialog"
        disabled={this.state.processing} onClose={this.handleClose}>
        <form onSubmit={this.handleFormSubmit} noValidate>
          <div className="form-content">
            <div className={`input text required ${this.state.nameError ? "error" : ""}`}>
              <label htmlFor="create-password-form-name"><Trans>Name</Trans></label>
              <input id="create-password-form-name" name="name" type="text" value={this.state.name}
                onKeyUp={this.handleNameInputKeyUp} onChange={this.handleInputChange}
                disabled={this.state.processing} ref={this.nameInputRef} className="required fluid" maxLength="64"
                required="required" autoComplete="off" autoFocus={true} placeholder={this.translate("Name")}/>
              {this.state.nameError &&
              <div className="name error message">{this.state.nameError}</div>
              }
            </div>
            <div className={`input text ${this.state.uriError ? "error" : ""}`}>
              <label htmlFor="create-password-form-uri"><Trans>URI</Trans></label>
              <input id="create-password-form-uri" name="uri" className="fluid" maxLength="1024" type="text"
                autoComplete="off" value={this.state.uri} onChange={this.handleInputChange} placeholder={this.translate("URI")}
                disabled={this.state.processing}/>
              {this.state.uriError &&
              <div className="error message">{this.state.uriError}</div>
              }
            </div>
            <div className={`input text ${this.state.usernameError ? "error" : ""}`}>
              <label htmlFor="create-password-form-username"><Trans>Username</Trans></label>
              <input id="create-password-form-username" name="username" type="text" className="fluid" maxLength="64"
                autoComplete="off" value={this.state.username} onChange={this.handleInputChange} placeholder={this.translate("Username")}
                disabled={this.state.processing}/>
              {this.state.usernameError &&
              <div className="error message">{this.state.usernameError}</div>
              }
            </div>
            <div className={`input-password-wrapper input required ${this.state.passwordError ? "error" : ""}`}>
              <label htmlFor="create-password-form-password"><Trans>Password</Trans></label>
              <div className="input text password">
                <input id="create-password-form-password" name="password" className="required" maxLength="4096"
                  placeholder={this.translate("Password")} required="required" type={this.state.viewPassword ? "text" : "password"}
                  onKeyUp={this.handlePasswordInputKeyUp} value={this.state.password}
                  onFocus={this.handlePasswordInputFocus} onBlur={this.handlePasswordInputBlur}
                  onChange={this.handleInputChange} disabled={this.state.processing}
                  style={passwordInputStyle} ref={this.passwordInputRef}/>
                <div className="security-token"
                  style={securityTokenStyle}>{securityTokenCode}</div>

              </div>
              <ul className="actions inline">
                <li>
                  <a onClick={this.handleViewPasswordButtonClick}
                    className={`password-view button button-icon toggle ${this.state.viewPassword ? "selected" : ""}`}>
                    <Icon name='eye-open' big={true}/>
                    <span className="visually-hidden">view</span>
                  </a>
                </li>
                <li>
                  <a onClick={this.handleGeneratePasswordButtonClick}
                    className="password-generate button-icon button">
                    <Icon name='magic-wand' big={true}/>
                    <span className="visually-hidden">generate</span>
                  </a>
                </li>
              </ul>
              <div className={`password-complexity ${passwordStrength.id}`}>
                <span className="progress">
                  <span className={`progress-bar ${passwordStrength.id}`} />
                </span>
                <span className="complexity-text"><Trans>complexity:</Trans> <strong>{this.translate(passwordStrength.label)}</strong></span>
              </div>
              {this.state.passwordError &&
              <div className="input text">
                <div className="password message error">{this.state.passwordError}</div>
              </div>
              }
              {this.state.passwordWarning &&
              <div className="input text">
                <div className="password warning message">{this.state.passwordWarning}</div>
              </div>
              }
            </div>
            <div className="input textarea">
              <label htmlFor="create-password-form-description"><Trans>Description</Trans>&nbsp;
                {!this.areResourceTypesEnabled() &&
                <Tooltip message={this.translate("Do not store sensitive data. Unlike the password, this data is not encrypted. Upgrade to version 3 to encrypt this information.")} icon="info-circle"/>
                }
                {this.areResourceTypesEnabled() && !this.state.encryptDescription &&
                <a role="button" onClick={this.handleDescriptionToggle} className="lock-toggle">
                  <Tooltip message={this.translate("Do not store sensitive data or click here to enable encryption for the description field.")} icon="lock-open" />
                </a>
                }
                {this.areResourceTypesEnabled() && this.state.encryptDescription &&
                <a role="button" onClick={this.handleDescriptionToggle} className="lock-toggle">
                  <Tooltip message={this.translate("The description content will be encrypted.")} icon="lock" />
                </a>
                }
              </label>
              <textarea id="create-password-form-description" name="description" maxLength="10000"
                className="required" placeholder={this.translate("Add a description")} value={this.state.description}
                disabled={this.state.processing}  onKeyUp={this.handleDescriptionInputKeyUp} onChange={this.handleInputChange}>
              </textarea>
              {this.state.descriptionError &&
              <div className="error message">{this.state.descriptionError}</div>
              }
              {this.state.descriptionWarning &&
              <div className="warning message">{this.state.descriptionWarning}</div>
              }
            </div>
          </div>
          <div className="submit-wrapper clearfix">
            <FormSubmitButton value={this.translate("Create")} disabled={this.state.processing} processing={this.state.processing}/>
            <FormCancelButton disabled={this.state.processing} onClick={this.handleClose}/>
          </div>
        </form>
      </DialogWrapper>
    );
  }
}

CreateResource.propTypes = {
  context: PropTypes.any, // The application context
  history: PropTypes.object, // Router history
  onClose: PropTypes.func, // Whenever the component must be closed
  actionFeedbackContext: PropTypes.any, // The action feedback context
  dialogContext: PropTypes.any, // The dialog context
  t: PropTypes.func, // The translation function
};

export default  withAppContext(withActionFeedback(withRouter(withDialog(withTranslation('common')(CreateResource)))));
