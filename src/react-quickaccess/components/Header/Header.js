import React from "react";
import PropTypes from "prop-types";
import {withAppContext} from "../../contexts/AppContext";
import {Trans, withTranslation} from "react-i18next";

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.initEventHandlers();
  }

  initEventHandlers() {
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  async handleLogoutClick() {
    this.props.context.port.request("passbolt.auth.logout");
    this.props.logoutSuccessCallback();
  }

  render() {
    return (
      <div className="quickaccess-header">
        <h1 className="logo">
          <a href={this.props.context.userSettings ? this.props.context.userSettings.getTrustedDomain() : "#"} target="_blank" rel="noopener noreferrer" title={this.translate("open passbolt in a new tab")}>
            <span className="visually-hidden">Passbolt</span>
          </a>
        </h1>
        {this.props.context.isAuthenticated &&
          <a role="button" className={`option-link button button-icon`} onClick={this.handleLogoutClick} title={this.translate("logout")}>
            <span className="visually-hidden"><Trans>logout</Trans></span>
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="power-off" className="svg-inline--fa fa-power-off fa-w-16" role="img" viewBox="0 0 512 512">
                <path fill="currentColor" d="M400 54.1c63 45 104 118.6 104 201.9 0 136.8-110.8 247.7-247.5 248C120 504.3 8.2 393 8 256.4 7.9 173.1 48.9 99.3 111.8 54.2c11.7-8.3 28-4.8 35 7.7L162.6 90c5.9 10.5 3.1 23.8-6.6 31-41.5 30.8-68 79.6-68 134.9-.1 92.3 74.5 168.1 168 168.1 91.6 0 168.6-74.2 168-169.1-.3-51.8-24.7-101.8-68.1-134-9.7-7.2-12.4-20.5-6.5-30.9l15.8-28.1c7-12.4 23.2-16.1 34.8-7.8zM296 264V24c0-13.3-10.7-24-24-24h-32c-13.3 0-24 10.7-24 24v240c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24z" />
              </svg>
            </span>
          </a>
        }
      </div>
    );
  }
}

Header.propTypes = {
  context: PropTypes.any, // The application context
  logoutSuccessCallback: PropTypes.func,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withTranslation('common')(Header));
