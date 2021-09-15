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
 * @since         3.0.0
 */
import React, {Component} from "react";
import Icon from "../../Common/Icons/Icon";
import SecurityComplexity from "../../../../shared/lib/Secret/SecretComplexity";
import {withAuthenticationContext} from "../../../contexts/AuthenticationContext";
import NotifyError from "../../Common/Error/NotifyError/NotifyError";
import {withDialog} from "../../../contexts/DialogContext";
import PropTypes from "prop-types";
import debounce from "debounce-promise";
import SecretComplexity from "../../../../shared/lib/Secret/SecretComplexity";
import {Trans, withTranslation} from "react-i18next";

/**
 * The component allows the user to create a Gpg key by automatic generation or by manually importing one
 */
class CreateGpgKey extends Component {
  /**
   * Default constructor
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.defaultState;
    this.evaluatePassphraseIsInDictionaryDebounce = debounce(this.evaluatePassphraseIsInDictionary, 300);
    this.bindEventHandlers();
    this.createReferences();
  }

  /**
   * Returns the component default state
   */
  get defaultState() {
    return {
      passphrase: '', // The current passphrase
      passphraseStrength: {  // The current passphrase strength
        id: '',
        label: ''
      },
      isObfuscated: true, // True if the paasphrase should not be visible
      errors: {}, // The list of errors
      actions: {
        processing: false // True if one's processing passphrase
      },
      hintClassNames: { // The class names for passphrase hints
        enoughLength: '',
        uppercase: '',
        alphanumeric: '',
        specialCharacters: ''
      }
    };
  }

  /**
   * Returns true if the user can perform actions on the component
   */
  get areActionsAllowed() {
    return !this.state.actions.processing;
  }

  /**
   * Returns true if the passphrase is valid
   */
  get isValid() {
    const validation = {
      enoughLength:  this.state.passphrase.length >= 8
    };
    return Object.values(validation).every(value => value);
  }

  /**
   * Returns true if the component must be in a disabled mode
   */
  get mustBeDisabled() {
    return !this.isValid;
  }

  /**
   * Returns true if the component must be in a processing mode
   */
  get isProcessing() {
    return this.state.actions.processing;
  }

  /**
   * Bind the event handlers
   */
  bindEventHandlers() {
    this.handlePassphraseChange = this.handlePassphraseChange.bind(this);
    this.handleToggleObfuscate = this.handleToggleObfuscate.bind(this);
    this.handleImportGpgKey = this.handleImportGpgKey.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Create component element references
   */
  createReferences() {
    this.passphraseInput = React.createRef();
  }

  /**
   * Whenever the passphrase change
   * @param event The input event
   */
  async handlePassphraseChange(event) {
    const passphrase = event.target.value;
    this.setState({passphrase});
    const passphraseStrength = this.evaluatePassphraseStrength(passphrase);
    const hintClassNames = await this.evaluatePassphraseHintClassNames(passphrase);
    this.setState({passphraseStrength, hintClassNames});
    await this.checkPassphraseIsInDictionary(passphrase, hintClassNames);
  }

  /**
   * check if the passphrase is in dictionary
   * @param passphrase
   * @param hintClassNames
   * @returns {Promise<void>}
   */
  async checkPassphraseIsInDictionary(passphrase, hintClassNames) {
    const hintClassName = condition => condition ? 'success' : 'error';
    // debounce only to check the passphrase is in dictionary
    const isPwned = await this.evaluatePassphraseIsInDictionaryDebounce(passphrase).catch(() => null);
    hintClassNames.notInDictionary = isPwned !== null ? hintClassName(!isPwned) : null;
    this.setState({hintClassNames});
  }

  /**
   * Whenever one wants to toggle the obfusctated mode
   */
  handleToggleObfuscate() {
    this.toggleObfuscate();
  }

  /**
   * Whenever the user wants to import his gpg key manually
   */
  handleImportGpgKey() {
    this.importGpgKey();
  }

  /**
   * Whenever the user submits the passphrase
   * @param event A form submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    this.generateGpgKey();
  }

  /**
   * Returns the strength evaluation of the passphrase
   * @param passphrase The passphrase to evaluate
   */
  evaluatePassphraseStrength(passphrase) {
    return SecurityComplexity.getStrength(passphrase);
  }

  /**
   * Evaluate the passphrase hints classnames
   * @param passphrase The passphrase to evaluate
   */
  evaluatePassphraseHintClassNames(passphrase) {
    const masks = SecurityComplexity.matchMasks(passphrase);
    const hintClassName = condition => condition ? 'success' : 'error';
    return {
      enoughLength:  hintClassName(passphrase.length >= 8),
      uppercase: hintClassName(masks.uppercase),
      alphanumeric: hintClassName(masks.alpha && masks.digit),
      specialCharacters: hintClassName(masks.special),
      notInDictionary:  'error'
    };
  }

  /**
   * Evaluate if the passphrase is in dictionary
   * @param passphrase The passphrase to evaluate
   * @return {Promise<boolean>} Return true if the password is part of a dictionary, false otherwise
   */
  async evaluatePassphraseIsInDictionary(passphrase) {
    if (passphrase.length >= 8) {
      return SecretComplexity.ispwned(passphrase);
    }
    return true;
  }

  /**
   * Generate the Gpg key
   */
  async generateGpgKey() {
    await this.toggleProcessing();
    this.props.authenticationContext.onGenerateGpgKeyRequested(this.state.passphrase)
      .catch(this.onGpgKeyGeneratedFailure.bind(this));
  }

  /**
   * Whenever the gpg key generation failed
   * @param error The error
   */
  async onGpgKeyGeneratedFailure(error) {
    await this.toggleProcessing();
    const ErrorDialogProps = {message: error.message};
    this.props.dialogContext.open(NotifyError, ErrorDialogProps);
  }

  /**
   * Request to import the gpg key
   */
  importGpgKey() {
    this.props.authenticationContext.onGoToImportGpgKeyRequested();
  }

  /**
   * Toggle the processing mode
   */
  async toggleProcessing() {
    await this.setState({actions: {processing: !this.state.actions.processing}});
  }

  /**
   * Toggle the obfuscate mode of the passphrase view
   */
  toggleObfuscate() {
    this.setState({isObfuscated: !this.state.isObfuscated});
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  /**
   * Render the component
   */
  render() {
    const processingClassName = this.isProcessing ? 'processing' : '';
    const disabledClassName = this.mustBeDisabled ? 'disabled' : '';
    return (
      <div className="create-gpg-key">
        <h1><Trans>Welcome to Passbolt, please select a passphrase!</Trans></h1>
        <form acceptCharset="utf-8" onSubmit={this.handleSubmit} className="enter-passphrase">
          <p>
            <Trans>This passphrase is the only passphrase you will need to remember from now on, choose wisely!</Trans>
          </p>
          <div className="input text password required">
            {this.state.isObfuscated &&
              <input
                id="passphrase-input"
                type="password"
                ref={this.passphraseInput}
                value={this.state.passphrase}
                onChange={this.handlePassphraseChange}
                disabled={!this.areActionsAllowed}
                autoFocus={true}/>
            }
            {!this.state.isObfuscated &&
              <input
                id="passphrase-input"
                type="text"
                ref={this.passphraseInput}
                value={this.state.passphrase}
                onChange={this.handlePassphraseChange}
                disabled={!this.areActionsAllowed}/>
            }
            <a
              className={`password-view button-icon button button-toggle ${this.state.isObfuscated ? "" : "selected"}`}
              role="button"
              onClick={this.handleToggleObfuscate}>
              <Icon name="eye-open"/>
              <span className="visually-hidden">view</span>
            </a>
            <div className="password-complexity">
              <span className="progress">
                <span className={`progress-bar ${this.state.passphraseStrength.id}`}></span>
              </span>
            </div>
          </div>

          <div className="password-hints">
            <ul>
              <li className={this.state.hintClassNames.enoughLength}>
                <Trans>It is at least 8 characters in length</Trans>
              </li>
              <li className={this.state.hintClassNames.uppercase}>
                <Trans>It contains lower and uppercase characters</Trans>
              </li>
              <li className={this.state.hintClassNames.alphanumeric}>
                <Trans>It contains letters and numbers</Trans>
              </li>
              <li className={this.state.hintClassNames.specialCharacters}>
                <Trans>It contains special characters (like / or * or %)</Trans>
              </li>
              <li className={this.state.hintClassNames.notInDictionary}>
                <Trans>It is not part of a dictionary</Trans>
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`button primary big full-width ${disabledClassName} ${processingClassName}`}
              role="button"
              disabled={this.mustBeDisabled || this.isProcessing}>
              <Trans>Next</Trans>
            </button>
            <a
              id="import-key-link"
              onClick={this.handleImportGpgKey}
              disabled={!this.areActionsAllowed}>
              <Trans>Or use an existing private key.</Trans>
            </a>
          </div>
        </form>
      </div>
    );
  }
}

CreateGpgKey.propTypes = {
  authenticationContext: PropTypes.any, // The authentication context
  dialogContext: PropTypes.any, // The dialog context
  t: PropTypes.func, // The translation function
};

export default withAuthenticationContext(withDialog(withTranslation('common')(CreateGpgKey)));
