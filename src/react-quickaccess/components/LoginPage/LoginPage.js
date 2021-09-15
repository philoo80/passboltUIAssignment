
import browser from "webextension-polyfill";
import React from "react";
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";
import {withAppContext} from "../../contexts/AppContext";
import {Trans, withTranslation} from "react-i18next";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initState();
    this.initEventHandlers();
    this.passphraseInputRef = React.createRef();
  }

  initEventHandlers() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
  }

  initState() {
    return {
      error: "",
      processing: false,
      passphrase: "",
      rememberMe: false,
      passphraseStyle: {},
      securityTokenStyle: {}
    };
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    this.setState({processing: true, error: ""});

    try {
      await this.login();
    } catch (error) {
      this.setState({
        error: error.message,
        processing: false
      });
      // Force the focus onto the passphrase input. The autoFocus attribute only works with the first rendering.
      this.passphraseInputRef.current.focus();
    }
  }

  async login() {
    await this.props.context.port.request("passbolt.auth.login", this.state.passphrase, this.state.rememberMe);
    const isMfaRequired = await this.props.context.port.request("passbolt.auth.is-mfa-required");

    if (!isMfaRequired) {
      this.props.loginSuccessCallback();
      this.props.history.push("/data/quickaccess.html");
    } else {
      browser.tabs.create({url: this.props.context.userSettings.getTrustedDomain()});
      window.close();
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleInputFocus() {
    this.setState({
      passphraseStyle: {
        background: this.props.context.userSettings.getSecurityTokenBackgroundColor(),
        color: this.props.context.userSettings.getSecurityTokenTextColor(),
      },
      securityTokenStyle: {
        background: this.props.context.userSettings.getSecurityTokenTextColor(),
        color: this.props.context.userSettings.getSecurityTokenBackgroundColor(),
      }
    });
  }

  handleInputBlur() {
    this.setState({
      passphraseStyle: {
        background: "",
        color: ""
      },
      securityTokenStyle: {
        background: this.props.context.userSettings.getSecurityTokenBackgroundColor(),
        color: this.props.context.userSettings.getSecurityTokenTextColor(),
      }
    });
  }

  render() {
    return (
      <div className="quickaccess-login">
        <div className="login-form">
          <form onSubmit={this.handleFormSubmit}>
            <div className="input text required">
              <label htmlFor="username"><Trans>Username</Trans></label>
              <input className="required" maxLength="50" type="text" id="username" required="required" value={this.props.context.userSettings.username} disabled="disabled" />
            </div>
            <div className="input text passphrase required">
              <label htmlFor="passphrase"><Trans>Passphrase</Trans></label>
              <input type="password" name="passphrase" placeholder={this.translate('passphrase')} id="passphrase" autoFocus ref={this.passphraseInputRef}
                value={this.state.passphrase} onChange={this.handleInputChange} onFocus={this.handleInputFocus} onBlur={this.handleInputBlur}
                disabled={this.state.processing} style={this.state.passphraseStyle} />
              <span className="security-token" style={this.state.securityTokenStyle}>{this.props.context.userSettings.getSecurityTokenCode()}</span>
              <div className="error-message">{this.state.error}</div>
            </div>
            {this.props.canRememberMe &&
              <div className="input checkbox small">
                <input type="checkbox" name="rememberMe" id="remember-me" checked={this.state.rememberMe} onChange={this.handleInputChange} disabled={this.state.processing} />
                <label htmlFor="remember-me"><Trans>Remember until I log out.</Trans></label>
              </div>
            }
            <div className="submit-wrapper">
              <input type="submit" className={`button primary big full-width ${this.state.processing ? "processing" : ""}`} role="button" value={this.translate('login')} disabled={this.state.processing} />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

LoginPage.propTypes = {
  context: PropTypes.any, // The application context
  canRememberMe: PropTypes.bool, // True if the remember me flag must be displayed
  loginSuccessCallback: PropTypes.func,
  // Match, location and history props are injected by the withRouter decoration call.
  match: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withRouter(withTranslation('common')(LoginPage)));


