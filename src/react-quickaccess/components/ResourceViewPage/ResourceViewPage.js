import React from "react";
import Transition from 'react-transition-group/Transition';
import PropTypes from "prop-types";
import {Trans, withTranslation} from "react-i18next";
import {withAppContext} from "../../contexts/AppContext";

class ResourceViewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initState();
    this.initEventHandlers();
    this.loadResource();
  }

  initEventHandlers() {
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleCopyLoginClick = this.handleCopyLoginClick.bind(this);
    this.handleCopyPasswordClick = this.handleCopyPasswordClick.bind(this);
    this.handleGoToUrlClick = this.handleGoToUrlClick.bind(this);
    this.handleUseOnThisTabClick = this.handleUseOnThisTabClick.bind(this);
    this.handleViewPasswordButtonClick = this.handleViewPasswordButtonClick.bind(this);
  }

  initState() {
    return {
      resource: {},
      passphrase: "",
      usingOnThisTab: false,
      copySecretState: "default",
      copyLoginState: "default",
      useOnThisTabError: "",
      previewedPassword: null,
      isSecretDecrypting: false // if the secret is decrypting
    };
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  handleGoBackClick(ev) {
    ev.preventDefault();

    // Additional variables were passed via the history.push state option.
    if (this.props.location.state) {
      /*
       * A specific number of entries to go back to was given in parameter.
       * It happens when the user comes from the create resource page by instance.
       */
      if (this.props.location.state.goBackEntriesCount) {
        this.props.history.go(this.props.location.state.goBackEntriesCount);
        return;
      }
    }

    this.props.history.goBack();
  }

  async loadResource() {
    const storageData = await this.props.context.storage.local.get("resources");
    const resource = storageData.resources.find(item => item.id === this.props.match.params.id);
    this.setState({resource});
  }

  resetError() {
    this.setState({useOnThisTabError: ""});
  }

  async handleCopyLoginClick(event) {
    event.preventDefault();
    this.resetError();
    if (!this.state.resource.username) {
      return;
    }

    try {
      this.setState({copyLoginState: 'processing'});
      await navigator.clipboard.writeText(this.state.resource.username);
      this.setState({copyLoginState: 'done'});
      setTimeout(() => {
        this.setState({copyLoginState: 'default'});
      }, 15000);
    } catch (error) {
      console.error('An unexpected error occured', error);
    }
  }

  /**
   * Handle copy password click.
   */
  async handleCopyPasswordClick() {
    await this.copyPasswordToClipboard();
  }

  /**
   * Handle preview password button click.
   */
  async handleViewPasswordButtonClick() {
    await this.togglePreviewPassword();
  }

  /**
   * Copy the resource password to clipboard.
   * @returns {Promise<void>}
   */
  async copyPasswordToClipboard() {
    const isPasswordPreviewed = this.isPasswordPreviewed();
    let password;

    this.resetError();
    this.setState({copySecretState: 'processing'});

    if (isPasswordPreviewed) {
      password = this.state.previewedPassword;
    } else {
      try {
        const plaintext = await this.decryptResourceSecret(this.state.resource.id);
        password = this.extractPlaintextPassword(plaintext);
      } catch (error) {
        if (error.name !== "UserAbortsOperationError") {
          this.setState({copySecretState: 'default'});
          return;
        }
      }
    }

    await navigator.clipboard.writeText(password);
    this.setState({copySecretState: 'done'});
    setTimeout(() => {
      this.setState({copySecretState: 'default'});
    }, 15000);
  }

  /**
   * Toggle preview password
   * @returns {Promise<void>}
   */
  async togglePreviewPassword() {
    const isPasswordPreviewed = this.isPasswordPreviewed();
    if (isPasswordPreviewed) {
      this.hidePreviewedPassword();
    } else {
      await this.previewPassword();
    }
  }

  /**
   * Hide the previewed resource password.
   */
  hidePreviewedPassword() {
    this.setState({previewedPassword: null});
  }

  /**
   * Preview password
   * @returns {Promise<void>}
   */
  async previewPassword() {
    const resourceId = this.state.resource.id;
    let previewedPassword;

    await this.setState({isSecretDecrypting: true});

    try {
      const plaintext = await this.decryptResourceSecret(resourceId);
      previewedPassword = this.extractPlaintextPassword(plaintext);
      this.setState({previewedPassword, isSecretDecrypting: false});
    } catch (error) {
      await this.setState({isSecretDecrypting: false});
      if (error.name !== "UserAbortsOperationError") {
        throw error;
      }
    }
  }

  /**
   * Get the password property from a secret plaintext object.
   * @param {string|object} plaintextDto The secret plaintext
   * @returns {string}
   */
  extractPlaintextPassword(plaintextDto) {
    if (!plaintextDto) {
      throw new TypeError('The secret plaintext is empty.');
    }
    if (typeof plaintextDto === 'string') {
      return plaintextDto;
    }
    if (typeof plaintextDto !== 'object') {
      throw new TypeError('The secret plaintext must be a string or an object.');
    }
    if (!Object.prototype.hasOwnProperty.call(plaintextDto, 'password')) {
      throw new TypeError('The secret plaintext must have a password property.');
    }
    return plaintextDto.password;
  }

  /**
   * Decrypt the resource secret
   * @param {string} resourceId The target resource id
   * @returns {Promise<object>} The secret in plaintext format
   * @throw UserAbortsOperationError If the user cancel the operation
   */
  decryptResourceSecret(resourceId) {
    return this.props.context.port.request("passbolt.secret.decrypt", resourceId, {showProgress: true});
  }

  handleGoToUrlClick(event) {
    this.resetError();
    if (!this.sanitizeResourceUrl()) {
      event.preventDefault();
    }
  }

  async handleUseOnThisTabClick(event) {
    event.preventDefault();
    this.setState({usingOnThisTab: true});
    try {
      await this.props.context.port.request('passbolt.quickaccess.use-resource-on-current-tab', this.state.resource.id, this.state.resource.username);
      window.close();
    } catch (error) {
      if (error && error.name === "UserAbortsOperationError") {
        this.setState({usingOnThisTab: false});
      } else {
        console.error('An error occured', error);
        this.setState({
          usingOnThisTab: false,
          useOnThisTabError: "Unable to use the password on this page. Copy and paste the information instead."
        });
      }
    }
  }

  sanitizeResourceUrl() {
    const resource = this.state.resource;
    let uri = resource.uri;

    // Wrong format.
    if (!uri || typeof uri !== "string" || !uri.length) {
      return false;
    }

    // Absolute url are not valid url.
    if (uri[0] === "/") {
      return false;
    }

    // If no protocol defined, use http.
    if (!/^((?!:\/\/).)*:\/\//.test(uri)) {
      uri = `http://${uri}`;
    }

    let url;
    try {
      url = new URL(uri);
    } catch (error) {
      return false;
    }
    if (!url || url.protocol.startsWith("javascript")) {
      return false;
    }
    return url.href;
  }

  /**
   * Check if the password is previewed
   * @returns {boolean}
   */
  isPasswordPreviewed() {
    return this.state.previewedPassword !== null;
  }

  /**
   * Returns true if the logged in user can use the preview password capability.
   * @returns {boolean}
   */
  get canUsePreviewPassword() {
    return this.props.context.siteSettings.canIUse('previewPassword');
  }

  render() {
    const sanitizeResourceUrl = this.sanitizeResourceUrl();
    const isPasswordPreviewed = this.isPasswordPreviewed();

    return (
      <div className="resource item-browse">
        <div className="back-link">
          <a href="#" className="primary-action" onClick={this.handleGoBackClick}>
            <span className="icon fa">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" /></svg>
            </span>
            <span className="primary-action-title">{this.state.resource.name}</span>
          </a>
          <a href={`${this.props.context.userSettings.getTrustedDomain()}/app/passwords/view/${this.props.match.params.id}`} className="secondary-action button-icon button" target="_blank" rel="noopener noreferrer" title={this.translate("View it in passbolt")}>
            <span className="fa icon">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" className="svg-inline--fa fa-external-link-alt fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M576 24v127.984c0 21.461-25.96 31.98-40.971 16.971l-35.707-35.709-243.523 243.523c-9.373 9.373-24.568 9.373-33.941 0l-22.627-22.627c-9.373-9.373-9.373-24.569 0-33.941L442.756 76.676l-35.703-35.705C391.982 25.9 402.656 0 424.024 0H552c13.255 0 24 10.745 24 24zM407.029 270.794l-16 16A23.999 23.999 0 0 0 384 303.765V448H64V128h264a24.003 24.003 0 0 0 16.97-7.029l16-16C376.089 89.851 365.381 64 344 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V287.764c0-21.382-25.852-32.09-40.971-16.97z"/></svg>
            </span>
            <span className="visually-hidden"><Trans>Edit in passbolt</Trans></span>
          </a>
        </div>
        <ul className="properties">
          <li className="property">
            <a role="button" className={`button button-icon property-action ${!this.state.resource.username ? "disabled" : ""}`} onClick={this.handleCopyLoginClick} title={this.translate("copy to clipboard")}>
              <span className="fa icon login-copy-icon">
                <Transition in={this.state.copyLoginState === "default"} appear={false} timeout={500}>
                  {status => (
                    <svg className={`transition fade-${status} ${this.state.copyLoginState !== "default" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M336 64h-80c0-35.29-28.71-64-64-64s-64 28.71-64 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 400H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h42v36c0 6.627 5.373 12 12 12h168c6.627 0 12-5.373 12-12v-36h42a6 6 0 0 1 6 6v340a6 6 0 0 1-6 6zM192 40c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24" /></svg>
                  )}
                </Transition>
                <Transition in={this.state.copyLoginState === "processing"} appear={true} timeout={500}>
                  {status => (
                    <svg className={`fade-${status} ${this.state.copyLoginState !== "processing" ? "visually-hidden" : ""}`} width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" ><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9" /></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite" /></path></g></g></svg>
                  )}
                </Transition>
                <Transition in={this.state.copyLoginState === "done"} appear={true} timeout={500}>
                  {status => (
                    <svg className={`fade-${status} ${this.state.copyLoginState !== "done" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" /></svg>
                  )}
                </Transition>
              </span>
              <span className="visually-hidden"><Trans>Copy to clipboard</Trans></span>
            </a>
            <span className="property-name"><Trans>Username</Trans></span>
            {this.state.resource.username &&
              <a href="#" role="button" className="property-value" onClick={this.handleCopyLoginClick}>
                {this.state.resource.username}
              </a>
            }
            {!this.state.resource.username &&
              <span className="property-value empty">
                <Trans>no username provided</Trans>
              </span>
            }
          </li>
          <li className="property">
            <a role="button" className="button button-icon property-action" onClick={this.handleCopyPasswordClick} title={this.translate("copy to clipboard")}>
              <span className="fa icon">
                <Transition in={this.state.copySecretState === "default"} appear={false} timeout={500}>
                  {status => (
                    <svg className={`transition fade-${status} ${this.state.copySecretState !== "default" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M336 64h-80c0-35.29-28.71-64-64-64s-64 28.71-64 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 400H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h42v36c0 6.627 5.373 12 12 12h168c6.627 0 12-5.373 12-12v-36h42a6 6 0 0 1 6 6v340a6 6 0 0 1-6 6zM192 40c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24" /></svg>
                  )}
                </Transition>
                <Transition in={this.state.copySecretState === "processing"} appear={true} timeout={500}>
                  {status => (
                    <svg className={`fade-${status} ${this.state.copySecretState !== "processing" ? "visually-hidden" : ""}`} width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" ><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9" /></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite" /></path></g></g></svg>
                  )}
                </Transition>
                <Transition in={this.state.copySecretState === "done"} appear={true} timeout={500}>
                  {status => (
                    <svg className={`fade-${status} ${this.state.copySecretState !== "done" ? "visually-hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" /></svg>
                  )}
                </Transition>
              </span>
              <span className="visually-hidden"><Trans>Copy to clipboard</Trans></span>
            </a>
            <span className="property-name">Password</span>
            <a href="#" role="button"
              className={`property-value secret ${isPasswordPreviewed ? "decrypted" : "secret-copy"}`}
              title={isPasswordPreviewed ? this.state.previewedPassword : "secret"}
              onClick={this.handleCopyPasswordClick}>
              {isPasswordPreviewed &&
              <span>{this.state.previewedPassword}</span>
              }
              {!isPasswordPreviewed &&
              <span className="visually-hidden"><Trans>Copy to clipboard</Trans></span>
              }
            </a>
            {this.canUsePreviewPassword &&
            <a onClick={this.handleViewPasswordButtonClick}
              className={`password-view button button-icon button-toggle ${isPasswordPreviewed ? "selected" : ""} ${this.state.isSecretDecrypting ? "disabled" : ""}`}>
              <span className="fa icon">
                <Transition in={!this.state.isSecretDecrypting} appear={false} timeout={500}>
                  {status => (
                    <svg className={`transition fade-${status} ${this.state.isSecretDecrypting ? "visually-hidden" : ""}`} viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1664 960q-152-236-381-353 61 104 61 225 0 185-131.5 316.5t-316.5 131.5-316.5-131.5-131.5-316.5q0-121 61-225-229 117-381 353 133 205 333.5 326.5t434.5 121.5 434.5-121.5 333.5-326.5zm-720-384q0-20-14-34t-34-14q-125 0-214.5 89.5t-89.5 214.5q0 20 14 34t34 14 34-14 14-34q0-86 61-147t147-61q20 0 34-14t14-34zm848 384q0 34-20 69-140 230-376.5 368.5t-499.5 138.5-499.5-139-376.5-368q-20-35-20-69t20-69q140-229 376.5-368t499.5-139 499.5 139 376.5 368q20 35 20 69z"/>
                    </svg>
                  )}
                </Transition>
                <Transition in={this.state.isSecretDecrypting} appear={true} timeout={500}>
                  {status => (
                    <svg className={`fade-${status} ${!this.state.isSecretDecrypting ? "visually-hidden" : ""}`} width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" ><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9" /></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite" /></path></g></g></svg>
                  )}
                </Transition>
              </span>
              <span className="visually-hidden">view</span>
            </a>
            }
          </li>
          <li className="property">
            <a href={`${sanitizeResourceUrl ? sanitizeResourceUrl : "#"}`} role="button" className={`button button-icon property-action ${!sanitizeResourceUrl ? "disabled" : ""}`}
              onClick={this.handleGoToUrlClick} target="_blank" rel="noopener noreferrer" title={this.translate("open in a new tab")}>
              <span className="fa icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M448 80v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48zm-88 16H248.029c-21.313 0-32.08 25.861-16.971 40.971l31.984 31.987L67.515 364.485c-4.686 4.686-4.686 12.284 0 16.971l31.029 31.029c4.687 4.686 12.285 4.686 16.971 0l195.526-195.526 31.988 31.991C358.058 263.977 384 253.425 384 231.979V120c0-13.255-10.745-24-24-24z" /></svg>
              </span>
              <span className="visually-hidden"><Trans>Open in new window</Trans></span>
            </a>
            <span className="property-name">Url</span>
            {this.state.resource.uri && sanitizeResourceUrl &&
              <a href={this.sanitizeResourceUrl()} role="button" className="property-value" target="_blank" rel="noopener noreferrer">
                {this.state.resource.uri}
              </a>
            }
            {this.state.resource.uri && !sanitizeResourceUrl &&
              <span className="property-value">
                {this.state.resource.uri}
              </span>
            }
            {!this.state.resource.uri &&
              <span className="property-value empty">
                <Trans>no url provided</Trans>
              </span>
            }
          </li>
        </ul>
        <div className="submit-wrapper input">
          <a href="#" id="popupAction" className={`button primary big full-width ${this.state.usingOnThisTab ? "processing" : ""}`} role="button" onClick={this.handleUseOnThisTabClick}>
            <Trans>use on this page</Trans>
          </a>
          <div className="error-message">{this.state.useOnThisTabError}</div>
        </div>
      </div>
    );
  }
}

ResourceViewPage.propTypes = {
  context: PropTypes.any, // The application context
  // Match, location and history props are injected by the withRouter decoration call.
  match: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withTranslation('common')(ResourceViewPage));
